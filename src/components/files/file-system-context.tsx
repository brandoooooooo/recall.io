import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { api } from "../../api/api";
import { Document, Folder } from "../../api/types";
import { isFolderType } from "../../utils/utils";
import { useNavigate } from "react-router-dom";

interface DefaultProps {
  obj: Folder | Document | null;
  contextPosition: { x: number; y: number };
  onClose: () => void;
}

export default function FileSystemContext({ obj, contextPosition, onClose }: DefaultProps) {
  const navigate = useNavigate();
  const [createCollection] = api.endpoints.createCollection.useMutation();
  const { data: chats } = api.endpoints.getAllChats.useQuery();
  const totalChatCount = chats?.length;

  const [deleteDocument] = api.endpoints.deleteDocument.useMutation();
  const [deleteFolder] = api.endpoints.deleteFolder.useMutation();
  const [renameDocument] = api.endpoints.renameDocument.useMutation();
  const [renameFolder] = api.endpoints.renameFolder.useMutation();

  const { refetch } = api.endpoints.getAllFolders.useQuery();

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    let name = "";
    if (obj) {
      if (isFolderType(obj)) {
        name = obj.path.split("/").pop() ?? "";
      }
      setNewName(isFolderType(obj) ? name : obj.file_name);
    }
  }, [obj]);

  if (!obj) return null;

  const isFolder = isFolderType(obj);

  const handleRename = async () => {
    if (isFolder) {
      await renameFolder({ folderId: obj.id, newName });
    } else {
      await renameDocument({ documentId: obj.id, newName });
    }
    setIsRenaming(false);
    setNewName("");
    refetch();
    onClose();
    console.log(obj);
  };

  const folderOptions = [
    { label: "Rename", onClick: () => setIsRenaming(true) },
    {
      label: "Delete",
      onClick: async () => {
        await deleteFolder(obj.id);
        onClose();
      },
    },
  ];
  const fileOptions = [
    {
      label: "Start Collection",
      onClick: async () => {
        try {
          const newCollection = await createCollection({
            name: `collection_${totalChatCount}`,
            sources: [obj.id],
          }).unwrap();
          navigate(`/chat/${newCollection.id}`);
          return newCollection;
        } catch (error) {
          console.error("Error creating new chat:", error);
        }
      },
    },
    { label: "Rename", onClick: () => setIsRenaming(true) },
    {
      label: "Delete",
      onClick: async () => {
        await deleteDocument(obj.id);
        onClose();
      },
    },
  ];

  const options = isFolder ? folderOptions : fileOptions;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: "absolute",
        top: contextPosition.y,
        left: contextPosition.x,
        backgroundColor: "#222",
        border: "1px solid #555",
        borderRadius: "5px",
        padding: "10px",
        zIndex: 1000,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {isRenaming ? (
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              await handleRename();
            }
          }}
          autoFocus
          style={{
            padding: "4px 8px",
            borderRadius: "3px",
            margin: "5px 0",
            width: "calc(100% - 16px)",
          }}
        />
      ) : (
        options.map(({ label, onClick }) => (
          <motion.div
            key={label}
            whileHover={{ backgroundColor: "#444", scale: 1.05 }}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              color: "#ddd",
              borderRadius: "3px",
              margin: "5px 0",
              transition: "background-color 0.2s ease",
            }}
            onClick={async () => {
              await onClick();
              refetch();
            }}
          >
            {label}
          </motion.div>
        ))
      )}
    </motion.div>
  );
}
