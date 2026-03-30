import "../App.css";
import styles from "../styles/landing-page.module.css";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

export default function Help() {
  return (
    <motion.div
      className={styles.container}
      style={{
        overflowY: "auto",
        minHeight: "100%",
        justifyContent: "start",
      }}
    >
      <Box
        textAlign="center"
        mt={0}
        px={{ xs: 2, sm: 4 }}
        style={{
          overflowY: "hidden",
          top: 0,
          padding: "10px 0",
        }}
      >
        <Typography variant="h3" fontWeight="bold">
          Tutorial
        </Typography>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={4}
        mb={0}
        maxWidth={1000}
        width="100%"
        px={{ xs: 2, sm: 4 }}
      >
        <iframe
          width="100%"
          height="613"
          src="https://www.youtube.com/embed/KkYa39YdG3U"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            borderRadius: "8px",
          }}
        ></iframe>
      </Box>
    </motion.div>
  );
}