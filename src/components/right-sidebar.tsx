import React from "react";
import { useParams } from "react-router-dom";
import styles from "../styles/right-sidebar.module.css";
import { Button } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import QuizIcon from "@mui/icons-material/Quiz";
import SchoolIcon from "@mui/icons-material/School";
import { Collection } from "../api/types";
import api from "../api/api";
import SourcesContainer from "./chatpagemodals/sources-container";

interface RightSidebarProps {
  collections?: Collection[];
  selectedPersonality?: string;
  onPersonalitySelect?: (personality: string) => void;
  chatFileName?: string;
}

const personalityOptions = [
  {
    id: "qa",
    name: "Q&A",
    icon: <HelpOutlineIcon />,
    description: "Direct answers to your questions",
  },
  {
    id: "quiz",
    name: "Quiz Me",
    icon: <QuizIcon />,
    description: "Test your knowledge",
  },
  {
    id: "braindump",
    name: "Brain Dump",
    icon: <SchoolIcon />,
    description: "Explore and expand your understanding",
  },
];

const RightSidebar: React.FC<RightSidebarProps> = ({
  collections,
  selectedPersonality = "qa",
  onPersonalitySelect,
  chatFileName,
}) => {
  const { collection_id } = useParams();

  const { data: fileTree } = api.endpoints.getAllFolders.useQuery();
  const documents = fileTree?.flatMap((folder) => folder.documents);

  const currentCollection = collections?.find((collection) => collection.id === collection_id);
  
  return (
    <div className={styles.rightSidebar}>
      <div className={styles.rightSidebarContent}>
        {/* <h3 className={styles.chatTitle}>
          Chat Source: {currentCollection?.name || chatFileName || "Untitled Collection"}
        </h3> */}

        <div className={styles.personalitySection}>
          <h4 className={styles.personalityTitle}>Toggle Personalities</h4>
          <div className={styles.personalityButtons}>
            {personalityOptions.map((personality) => (
              <Button
                key={personality.id}
                variant={selectedPersonality === personality.id ? "contained" : "outlined"}
                startIcon={personality.icon}
                onClick={() => onPersonalitySelect?.(personality.id)}
                className={`
                  ${styles.personalityButton} 
                  ${selectedPersonality === personality.id ? styles.active : ""}
                `}
                sx={{
                  backgroundColor: selectedPersonality === personality.id ? "var(--gray-shade-6)" : "transparent",
                  color: "var(--text-color-light)",
                  "&:hover": {
                    backgroundColor:
                      selectedPersonality === personality.id ? "var(--gray-shade-5)" : "var(--gray-shade-7)",
                  },
                }}
              >
                {personality.name}
                <span className={styles.personalityDescription}>{personality.description}</span>
              </Button>
            ))}
          </div>
        </div>

        <SourcesContainer currentCollection={currentCollection} documents={documents} />
      </div>
    </div>
  );
};

export default RightSidebar;
