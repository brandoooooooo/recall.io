import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "../styles/landing-page.module.css";

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="hero-text"
        >
          <h1 className={styles.title}>recall.io</h1>
          <p className={styles.subtitle}>Your AI study guide</p>

          <div className={styles.buttonContainer}>
            <Link to="/signin" className={styles.loginButton}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Get started
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
