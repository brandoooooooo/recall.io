import { Typography } from "@mui/material";
import "../App.css";
import { api } from "../api/api";
import styles from "../styles/landing-page.module.css";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ReactNode } from "react";

export default function WelcomePage() {
  const { data: self, isLoading: selfIsLoading } = api.endpoints.getSelf.useQuery();
  const { data: latestCollection, isLoading: latestCollectionIsLoading } = api.endpoints.getLatestCollection.useQuery();

  if (selfIsLoading || latestCollectionIsLoading) return <p>Loading...</p>;

  let latestCollectionText: string | ReactNode = "";
  if (latestCollection == null) latestCollectionText = "Loading...";
  else if (Object.keys(latestCollection).length === 0) latestCollectionText = "Go to chats";
  else
    latestCollectionText = (
      <>
        Continue with <strong>{latestCollection.name}</strong>
      </>
    );

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <motion.div className={styles.heroText}>
          <h1 className={styles.title}>Welcome, {self?.display_name || "Unknown User"}!</h1>
          <p className={styles.subtitle}>What would you like to study today?</p>
          <div className={styles.buttonContainer}>
            <Link to={`/chat/${latestCollection?.id || ""}`} className={styles.loginLink}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={styles.loginButton}
                disabled={!latestCollection}
              >
                <Typography>{latestCollectionText}</Typography>
              </motion.button>
            </Link>
            <Link to="/files" className={styles.signUpLink}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={styles.signUpButton}>
                <Typography>Study something else</Typography>
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
