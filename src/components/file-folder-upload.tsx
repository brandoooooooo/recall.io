import React, { useState, ChangeEvent, DragEvent } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Add, Close, InsertDriveFile, ErrorOutline } from "@mui/icons-material";
import * as AWS from "aws-sdk";
import { STS } from "../api/types";
import { api } from "../api/api";
import { multiPartUpload, singleUpload } from "../utils/utils";
import { Tooltip } from "@mui/material";

const THRESHOLD = 10 * 1024 * 1024;

export interface UploadProgress {
  [key: string]: { progress: number; success: boolean | null; retry?: boolean };
}

const FileUploadProgress = ({ uploadProgress }: { uploadProgress: UploadProgress[""] }) => {
  if (!uploadProgress) return;

  if (uploadProgress.success === false)
    return (
      <Typography variant="body2" color="error" sx={{ mt: 1 }}>
        Upload failed{uploadProgress?.retry === true && ", please retry again"}
      </Typography>
    );
  else if (uploadProgress.success === true) {
    return (
      <Typography variant="body2" color="success" sx={{ mt: 1 }}>
        Upload succeeded
      </Typography>
    );
  } else {
    return <CircularProgress variant="determinate" value={uploadProgress?.progress || 25} sx={{ mt: 1 }} />;
  }
};

interface AddFileSystemObjectProps {
  currentPath: string;
  folderId: string;
}

export default function AddFileSystemObject({ currentPath, folderId }: AddFileSystemObjectProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"folder" | "file" | null>(null);
  const [folderName, setFolderName] = useState("");
  const [createFolder] = api.endpoints.createFolder.useMutation();
  const [files, setFiles] = useState<File[]>([]);

  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [showUploadComponent, setShowUploadComponent] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDialogOpen = (type: "folder" | "file") => {
    if (type === "file") {
      setShowUploadComponent(true);
    } else {
      setDialogType(type);
      setOpen(true);
    }
    handleMenuClose();
  };

  const handleDialogClose = () => {
    console.log("handle close");
    setOpen(false);
    setUploading(false);
    setDialogType(null);
    setFolderName("");
  };

  // root directory / -> after added folder -> //x
  const handleCreateFolder = async () => {
    const trimmed = folderName.trim();
    setFolderName("");
    if (!trimmed) {
      console.error("If the user inputs '' or empty do not create folder");
      setErrorMessage("Folder name cannot be empty!");
      return;
    }
    console.log(trimmed);

    let newPath = currentPath;

    if (currentPath === "/") {
      newPath += `${folderName.trim()}`;
    } else {
      newPath += `/${folderName.trim()}`;
    }
    try {
      const response = await createFolder({
        path: newPath,
      }).unwrap();
      console.log("Folder created", response);
      handleDialogClose();
    } catch (error) {
      if (error.data.includes("folder exists")) setErrorMessage("Folder already exists");
      else setErrorMessage("Error creating folder");
      console.error("Error:", error);
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    // less than 2MB
    const selectedFiles = Array.from(event.target.files || []).filter((file) => file.size <= 2 * 1024 * 1024);
    setFiles(selectedFiles);
    setUploadProgress({});
    setUploadComplete(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files)
      .filter((file) => file.type === "text/plain")
      .filter((file) => file.size <= 2 * 1024 * 1024);
    setFiles(droppedFiles);
    setUploadProgress({});
    setUploadComplete(false);
  };

  // GET STS
  const { data: STS, refetch } = api.endpoints.getSTS.useQuery();
  const region = import.meta.env.VITE_REGION;

  const configureAWSCredentials = (sts: STS) => {
    if (sts) {
      AWS.config.update({
        accessKeyId: sts.access_key_id,
        secretAccessKey: sts.secret_access_key,
        sessionToken: sts.session_token,
        region: region,
      });
    }
  };

  // TODO: test and handle case where STS endpoint does not return/errors out (we want to disable upload)
  if (STS) {
    configureAWSCredentials(STS);
  }

  // Create s3 label and get bucket name
  const bucket_name = import.meta.env.VITE_BUCKET;
  const s3 = new AWS.S3();

  const [createDocument] = api.endpoints.createDocument.useMutation();

  const handleUpload = async () => {
    if (!files.length || !STS) {
      console.error("Files or STS credentials are missing.");
      return;
    }

    setUploading(true);
    const newUploadProgress: UploadProgress = {};

    const handleFail = (name: string, retry: boolean = false) => {
      setUploadProgress((prevProgress) => ({
        ...prevProgress,
        [name]: { progress: 0, success: false, retry },
      }));
      setUploadComplete(false);
      setUploading(false);
    };

    await Promise.all(
      files.map(
        (file) =>
          new Promise<void>(async (resolve, reject) => {
            let uuid = "";

            // init progress bar
            setUploadProgress((prevProgress) => ({
              ...prevProgress,
              [file.name]: { progress: 0, success: null },
            }));

            try {
              newUploadProgress[file.name] = { progress: 0, success: null };
              // 1. s3 upload
              // Currently uses multi if it is >= 10 mb might change later to be greater> ?
              if (file.size >= THRESHOLD) {
                uuid = await multiPartUpload(file, bucket_name, s3);
              } else {
                uuid = await singleUpload(file, bucket_name, s3);
              }
            } catch (e) {
              console.error("error uploading to s3", e);

              // refetch STS token
              if (typeof e === "object" && e != null && "code" in e && e.code === "ExpiredToken") {
                refetch();
                handleFail(file.name, true);
              } else handleFail(file.name);

              reject();
              return;
            }

            // 2. db creation
            try {
              await createDocument({
                file_name: file.name,
                object_key: uuid,
                file_size: file.size,
                content_type: file.type,
                file_metadata: {},
                folder_id: folderId,
              }).unwrap();

              setUploadProgress((prevProgress) => ({
                ...prevProgress,
                [file.name]: { progress: 100, success: true },
              }));
            } catch (error) {
              console.error("Error during DB upload:", error);
              handleFail(file.name);
              reject();
            }

            resolve();
          }),
      ),
    );

    setUploading(false);
    setUploadComplete(true);
  };

  const handleClose = () => {
    setFiles([]);
    setUploadProgress({});
    setUploading(false);
    setUploadComplete(false);
    setShowUploadComponent(false);
  };

  return (
    <div>
      <Tooltip title="Add Item">
        <IconButton onClick={handleMenuClick} sx={{ color: "black" }}>
          <Add />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleDialogOpen("folder")}>Create Folder</MenuItem>
        <MenuItem onClick={() => handleDialogOpen("file")}>Upload File</MenuItem>
      </Menu>

      {dialogType === "folder" && (
        <Dialog open={open} onClose={handleDialogClose} fullWidth maxWidth="sm">
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Create Folder</Typography>
              <IconButton
                onClick={handleDialogClose}
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  color: "gray",
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Enter Folder Name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (errorMessage) setErrorMessage(null);
                  if (e.key === "Enter") {
                    handleCreateFolder();
                  }
                }}
                fullWidth
                sx={{ marginTop: 2 }}
                autoFocus
              />
              {errorMessage && <Typography color="error">{errorMessage}</Typography>}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} variant="contained" color="error">
              Cancel
            </Button>
            <Button variant="contained" onClick={handleCreateFolder}>
              Add Folder
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {showUploadComponent && (
        <Dialog
          open={showUploadComponent}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: "none",
            },
          }}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Upload</Typography>
              <IconButton
                onClick={handleClose}
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  color: "gray",
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => e.preventDefault()}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "40vh",
                border: "3px dashed gray",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                maxWidth: "100%",
                boxSizing: "border-box",
                position: "relative",
                overflowY: "scroll",
              }}
            >
              <input
                accept="text/*"
                id="file-upload"
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
              <label
                htmlFor="file-upload"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {files.length === 0 ? (
                  <>
                    <InsertDriveFile fontSize="large" sx={{ fontSize: 80, color: "gray", mb: 1 }} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      or drag and drop files here
                    </Typography>
                    <Typography variant="body2" sx={{ color: "gray" }}>
                      (Only text files under 2 MB are supported)
                    </Typography>
                  </>
                ) : (
                  <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    {files.map((file) => (
                      <Card key={file.name} sx={{ width: "100%", mb: 2 }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={2}>
                            <InsertDriveFile sx={{ fontSize: 40, color: "gray" }} />
                            <Box textAlign="center" flexGrow={1}>
                              <Typography variant="body2">{file.name}</Typography>
                              <FileUploadProgress uploadProgress={uploadProgress[file.name]} />
                            </Box>
                            {uploadProgress[file.name]?.success === false && (
                              <ErrorOutline color="error" sx={{ fontSize: 40 }} />
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </label>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={handleClose}
              variant="contained"
              color="error"
              disabled={files.length === 0 || uploading || uploadComplete}
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={uploadComplete ? handleClose : handleUpload}
              variant="contained"
              sx={{ backgroundColor: "green", color: "white" }}
              loading={uploading}
              disabled={files.length === 0}
            >
              {uploadComplete ? "Done" : "Confirm Upload"}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
