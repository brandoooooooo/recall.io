import { useState, useMemo, SetStateAction, Dispatch } from "react";
import { AnimatePresence } from "framer-motion";
import { api } from "../api/api";
import { Folder, Document, FolderWithDocuments } from "../api/types";
import FileSystemObject from "../components/files/file-system-object";
import AddFileSystemObject from "../components/file-folder-upload";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import styles from "../styles/file-system.module.css";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Snackbar, SnackbarCloseReason, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/chatpagemodals/confirmation-modal";
import DeleteButton from "@mui/icons-material/Delete";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { motion } from "framer-motion";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";

interface FilesProps {
  files: Document[];
  folders: FolderWithDocuments[];
  setCurrentPath: (path: string) => void;
  selectedFiles: Document[];
  setSelectedFiles: Dispatch<SetStateAction<Document[]>>;
  selectedFolders: Folder[];
  setSelectedFolders: Dispatch<SetStateAction<Folder[]>>;
}

function FileSystem({
  files,
  folders,
  setCurrentPath,
  selectedFiles,
  setSelectedFiles,
  selectedFolders,
  setSelectedFolders,
}: FilesProps) {
  const [renameDocument] = api.endpoints.renameDocument.useMutation();

  const onFileClick = (obj: Document): void => {
    // deselect
    if (selectedFiles.includes(obj)) setSelectedFiles((prev) => prev.filter((file) => file.id !== obj.id));
    // select
    else setSelectedFiles((prev) => [...prev, obj]);
  };

  const onFolderClick = (obj: Folder): void => {
    if (selectedFolders.includes(obj)) {
      setSelectedFolders((prev) => prev.filter((folder) => folder.id !== obj.id));
    } else {
      setSelectedFolders((prev) => [...prev, obj]);
    }
  };

  const onFolderDoubleClick = (obj: Folder): void => {
    // Open the folder
    setCurrentPath(obj.path);
  };

  const onFileRename = async (obj: Document, newName: string): Promise<void> => {
    try {
      await renameDocument({ documentId: obj.id, newName });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.fileSystemContent}>
      {folders.map((obj) => (
        <FileSystemObject
          key={obj.id}
          obj={obj}
          onClick={onFolderClick}
          onDoubleClick={onFolderDoubleClick}
          isSelected={selectedFolders.includes(obj)}
        />
      ))}
      {files.map((obj) => (
        <FileSystemObject
          key={obj.id}
          obj={obj}
          onClick={onFileClick}
          isSelected={selectedFiles.includes(obj)}
          onRename={onFileRename}
        />
      ))}
    </div>
  );
}

export default function FilePage() {
  const navigate = useNavigate();

  const { data: allFolders, isLoading } = api.endpoints.getAllFolders.useQuery();
  const [deleteDocument] = api.endpoints.deleteDocument.useMutation();
  const [deleteFolder] = api.endpoints.deleteFolder.useMutation();
  const [createCollection] = api.endpoints.createCollection.useMutation();

  const [currentPath, setCurrentPath] = useState<string>("/");
  const [selectedFiles, setSelectedFiles] = useState<Document[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Folder[]>([]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [snackbarIsOpen, setSnackbarIsOpen] = useState(false);

  const handleSnackbarClose = (_: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === "clickaway") return;
    setSnackbarIsOpen(false);
  };

  // this should be abstracted
  const snackbarAction = (
    <React.Fragment>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  const handleDeleteConfirm = async () => {
    if (selectedFiles.length === 0 && selectedFolders.length === 0) {
      console.warn("No items selected for deletion.");
      return;
    }

    try {
      // deletion for each selected file/folder
      const fileDeletionPromises = selectedFiles.map((file) => deleteDocument(file.id).unwrap());
      const folderDeletionPromises = selectedFolders.map((folder) => deleteFolder(folder.id).unwrap());

      await Promise.all(fileDeletionPromises);
      await Promise.all(folderDeletionPromises);

      setSelectedFiles([]);
      setSelectedFolders([]);
      console.log("Successfully deleted files.");
    } catch (error) {
      console.error("Error deleting files:", error);
      setSnackbarIsOpen(true);
      //
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const startNewCollection = async () => {
    if (selectedFiles.length === 0) return;

    try {
      const newCollection = await createCollection({
        name: `new collection`,
        sources: selectedFiles.map((file) => file.id),
      }).unwrap();
      navigate(`/chat/${newCollection.id}`);
      return newCollection;
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const foldersInCurrentPath = useMemo(
    () =>
      allFolders?.filter((folder: FolderWithDocuments) => {
        const folderPath = folder.path;
        if (currentPath === "/") {
          return folderPath.split("/").filter(Boolean).length === 1;
        }

        const isImmediateSubfolder =
          folderPath.startsWith(`${currentPath}/`) &&
          folderPath.split("/").filter(Boolean).length === currentPath.split("/").filter(Boolean).length + 1;

        return isImmediateSubfolder;
      }),
    [allFolders, currentPath],
  );

  const currFolder = allFolders?.find((folder) => folder.path === currentPath);
  const folderId = allFolders?.find((folder) => folder.path === currentPath)?.id;

  const handleBreadcrumbClick = (path: string) => {
    setCurrentPath(path);
  };

  const generateBreadcrumbs = () => {
    const pathSegments = currentPath.split("/").filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => {
      const path = "/" + pathSegments.slice(0, index + 1).join("/");
      return (
        <Link
          key={path}
          sx={{ color: "#666" }}
          onClick={() => handleBreadcrumbClick(path)}
          style={{ cursor: "pointer" }}
        >
          {segment}
        </Link>
      );
    });

    return [
      <Link key="/" sx={{ color: "#666" }} onClick={() => handleBreadcrumbClick("/")} style={{ cursor: "pointer" }}>
        Home
      </Link>,
      ...breadcrumbs,
    ];
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.fileSystemHeader}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#666" }}>
          <Breadcrumbs
            aria-label="breadcrumb"
            sx={{ color: "#666" }}
            style={{ padding: "10px", margin: "5px 0" }}
            separator={<NavigateNextIcon fontSize="small" />}
          >
            {generateBreadcrumbs()}
          </Breadcrumbs>
          <div style={{ display: "flex" }}>
            <AddFileSystemObject currentPath={currentPath} folderId={folderId ?? ""} />
            <Tooltip title="Delete Items">
              <IconButton
                aria-label="Delete Items"
                sx={{ color: "#666" }}
                onClick={() => {
                  if (selectedFiles.length + selectedFolders.length > 0) setIsDeleteModalOpen(true);
                  else console.warn("No items selected for deletion.");
                }}
                disabled={selectedFiles.length === 0 && selectedFolders.length === 0}
              >
                <DeleteButton />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px",
            borderBottom: "1px solid #555",
            color: "#484848",
            fontWeight: "bold",
          }}
        >
          <span>Name</span>
          <span>Date added</span>
        </div>
        <AnimatePresence>
          {isLoading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Skeleton variant="rectangular" width="100%" height={40} />
              <Skeleton variant="rectangular" width="100%" height={40} />
              <Skeleton variant="rectangular" width="100%" height={40} />
            </Box>
          ) : (
            <FileSystem
              files={currFolder?.documents ?? []}
              folders={foldersInCurrentPath ?? []}
              setCurrentPath={setCurrentPath}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              selectedFolders={selectedFolders}
              setSelectedFolders={setSelectedFolders}
            />
          )}
        </AnimatePresence>
      </div>
      <div className={styles.buttonContainer}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={styles.startCollectionButton}
          onClick={startNewCollection}
          style={{ cursor: "pointer" }}
        >
          Start a Collection
        </motion.div>
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        message={`Are you sure you want to delete ${selectedFiles.length + selectedFolders.length} item${
          selectedFiles.length + selectedFolders.length > 1 ? "s" : ""
        }? This action cannot be undone.`}
      />
      <Snackbar
        open={snackbarIsOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="Unable to delete files/folder"
        action={snackbarAction}
      />
    </div>
  );
}
