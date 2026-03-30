import { useState } from "react";
import { motion } from "framer-motion";
import { Document, Folder } from "../../api/types";
import { isFolderType } from "../../utils/utils";
import styles from "../../styles/file-system.module.css";
import Checkbox from "@mui/material/Checkbox";

interface DefaultProps<T extends Document | Folder> {
  obj: T;
  onClick: (arg: T) => void;
  onDoubleClick?: (arg: T) => void;
  onRename?: (obj: T, newName: string) => void;
  isSelected?: boolean;
}

export default function FileSystemObject<T extends Document | Folder>({
  obj,
  onClick,
  onDoubleClick,
  isSelected,
  onRename,
}: DefaultProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  // lock for folder click/doubleClick
  const [folderLock, setFolderLock] = useState<NodeJS.Timeout | null>(null);

  const isFolder = isFolderType(obj);
  const [newName, setNewName] = useState(!isFolder ? obj.file_name : obj.path.split("/").filter(Boolean).pop() || "");

  const dateCreatedStr = new Date(obj.date_created).toLocaleDateString();

  const handleRename = () => {
    const trim = newName.trim();
    if (onRename && trim !== "") onRename(obj, trim);
    setIsEditing(false);
  };

  const handleClick = () => {
    if (isFolder) {
      if (folderLock) {
        clearTimeout(folderLock);
        setFolderLock(null);
      } else {
        onClick(obj);
        const t = setTimeout(() => {
          setFolderLock(null);
        }, 400);
        setFolderLock(t);
      }
    } else onClick(obj);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isFolder) {
      if (folderLock) {
        clearTimeout(folderLock);
        setFolderLock(null);
      } else {
        // folders: double click invokes fn
        e.stopPropagation();
        onClick(obj); // because a double click subsumes a single click - reverse this
        onDoubleClick?.(obj);
      }
    } else {
      // files: start editing if rename is supported
      setIsEditing(true);
    }
  };

  return (
    <motion.div
      key={obj.id}
      className={`${styles.fileSystemObject} ${!isFolder ? styles.fileObject : styles.folderObject}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {isEditing ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRename();
              } else if (e.key === "Escape") {
                setIsEditing(false);
              }
            }}
            autoFocus
            style={{ flex: 1 }}
          />
        ) : (
          <>
            <Checkbox checked={isSelected} disabled size="small" />
            <span style={{ paddingLeft: "5px" }}>{isFolder ? newName : obj.file_name}</span>
          </>
        )}
      </div>
      <span style={{ paddingRight: "5px" }}>{dateCreatedStr}</span>
    </motion.div>
  );
}
