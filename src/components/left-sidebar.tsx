import React, { useState } from "react";
import styles from "../styles/left-sidebar.module.css";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationModal from "./chatpagemodals/confirmation-modal";
import { Collection } from "../api/types";

interface LeftSidebarProps {
  collections?: Collection[];
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ collections }) => {
  const navigate = useNavigate();
  const { collection_id: collectionId } = useParams();

  const [deleteCollection] = api.endpoints.deleteCollection.useMutation();
  const [updateCollection] = api.endpoints.updateCollection.useMutation();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState<string>("");

  const handleChatClick = (id: string) => {
    navigate(`/chat/${id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, collectionId: string) => {
    e.stopPropagation();
    setSelectedCollectionId(collectionId);
    setIsDeleteModalOpen(true);
  };

  const handleRenameDoubleClick = (collectionId: string, currentName: string) => {
    setEditingCollectionId(collectionId);
    setNewCollectionName(currentName);
  };

  const handleRenameConfirm = async () => {
    if (editingCollectionId && newCollectionName.trim() !== "") {
      try {
        await updateCollection({ id: editingCollectionId, collection: { name: newCollectionName.trim() } });
      } catch (error) {
        console.error("Error renaming collection:", error);
      }
    }
    setEditingCollectionId(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedCollectionId) {
      try {
        await deleteCollection(selectedCollectionId);
        if (collectionId === selectedCollectionId) {
          navigate("/chat");
        }
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>Collections</div>
      <div className={styles.chatList}>
        {collections?.map((collection) => (
          <div key={collection.id} className={styles.chatItemWrapper}>
            <div
              className={`${styles.chatButton} ${collectionId === collection.id ? styles.activeChatButton : ""}`}
              onClick={() => handleChatClick(collection.id)}
              onDoubleClick={() => handleRenameDoubleClick(collection.id, collection.name || "Untitled Collection")}
            >
              {editingCollectionId === collection.id ? (
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onBlur={handleRenameConfirm}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRenameConfirm();
                    } else if (e.key === "Escape") {
                      setEditingCollectionId(null);
                    }
                  }}
                  autoFocus
                  className={styles.renameInput}
                />
              ) : (
                collection.name || "Untitled Collection"
              )}
              <button
                className={styles.clearConversationButton}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent div click
                  handleDeleteClick(e, collection.id);
                }}
              >
                <DeleteIcon className={styles.clearConversationIcon} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          await handleDeleteConfirm();
        }}
        message="Are you sure you want to delete this collection? This action cannot be undone."
      />
    </div>
  );
};

export default LeftSidebar;
