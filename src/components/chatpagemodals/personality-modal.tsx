import React from 'react';
import { Modal, Box } from '@mui/material';
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import PsychologyIcon from "@mui/icons-material/Psychology";
import QuizIcon from "@mui/icons-material/Quiz";
import styles from "../../styles/personality-modal.module.css";

interface PersonalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (personality: string) => void;
}

const PersonalityModal: React.FC<PersonalityModalProps> = ({ isOpen, onClose, onSelect }) => {
  const personalities = [
    {
      id: 'qa',
      icon: <QuestionAnswerIcon sx={{ fontSize: 48 }} />,
      title: 'Q&A',
      description: 'Get direct answers to your questions'
    },
    {
      id: 'braindump',
      icon: <PsychologyIcon sx={{ fontSize: 48 }} />,
      title: 'Active Recall',
      description: 'Practice active recall with your materials'
    },
    {
      id: 'quiz',
      icon: <QuizIcon sx={{ fontSize: 48 }} />,
      title: 'Test Yourself',
      description: 'Generate quizzes from your content'
    }
  ];

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box className={styles.modalContainer}>
        <h2>Choose a Personality</h2>
        <div className={styles.personalityGrid}>
          {personalities.map((personality) => (
            <div
              key={personality.id}
              className={styles.personalityCard}
              onClick={() => onSelect(personality.id)}
            >
              <div className={styles.iconContainer}>
                {personality.icon}
              </div>
              <h3>{personality.title}</h3>
              <p>{personality.description}</p>
            </div>
          ))}
        </div>
      </Box>
    </Modal>
  );
};

export default PersonalityModal;
