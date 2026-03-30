// can be deleted now since moved to welcome page
// need to update navbar
import "../App.css"; // ? 
import { api } from "../api/api";
import styles from "../styles/landing-page.module.css";
import { motion } from "framer-motion";

export default function Profile() {
  const { data: self, isLoading: selfIsLoading } = api.endpoints.getSelf.useQuery();

  if (selfIsLoading) return <p>Loading...</p>;

  return (
    <div className={styles.container} style={{ backgroundColor: "white", padding: "20px" }}>
      <div className={styles.hero}>
        <motion.div className={styles.heroText} style={{ textAlign: "center" }}>
          <h2 className={styles.title}>Welcome, {self?.display_name || "Unknown User"}!</h2>
        </motion.div>
      </div>
    </div>
  );
}