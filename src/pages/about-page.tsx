import "../App.css";
import styles from "../styles/landing-page.module.css";
import { Box, Card, Typography, Avatar } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import SourceIcon from "@mui/icons-material/Source";
import { motion } from "framer-motion";

export default function AboutP() {
  // useEffect(() => {
  //   const savedDarkMode = localStorage.getItem("darkMode");
  //   if (savedDarkMode === "enabled") {
  //     document.body.classList.add("dark-mode");
  //   }
  // }, []);

  return (
    <motion.div
      className={styles.container}
      style={{
        minHeight: "100vh",
        paddingBottom: "90px",
        justifyContent: "start",
      }}
    >
      <Box
        textAlign="center"
        mt={4}
        mb={2}
        px={{ xs: 2, sm: 4 }}
        style={{
          top: 0,
          padding: "16px 0",
        }}
      >
        <Typography variant="h3" fontWeight="bold">
          Study Smarter with Recall
        </Typography>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={4}
        mb={2}
        maxWidth={1000}
        width="100%"
        px={{ xs: 2, sm: 4 }}
      >
        {/* Large Feature Card */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ width: "100%" }}>
          <Card
            className={styles.card}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              padding: 3,
              borderRadius: 2,
              width: "100%",
            }}
          >
            <ChatBubbleOutlineIcon
              fontSize="large"
              sx={{ marginRight: { sm: 2 }, mb: { xs: 2, sm: 0 }, color: "primary.main" }}
            />
            <Box textAlign={{ xs: "center", sm: "left" }}>
              <Typography variant="h5" className={styles["card-title"]}>
                Interactive Study Sessions
              </Typography>
              <Typography variant="body2" className={styles["card-content"]}>
                Use Recall to dive deep into your notes with interactive questions, summaries, and chapter overviews.
                Quiz yourself or explore key points to reinforce your understanding of any topic.
              </Typography>
            </Box>
          </Card>
        </motion.div>

        {/* Smaller Feature Cards */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="center"
          width="100%"
          maxWidth={1000}
          gap={10}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ width: "100%" }}>
            <Card
              className={styles.card}
              sx={{
                textAlign: "center",
                padding: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderRadius: 2,
                width: "100%",
                marginBottom: { xs: 2, sm: 0 },
              }}
            >
              <UploadFileIcon fontSize="large" sx={{ color: "primary.main" }} />
              <Typography variant="h6" className={styles["card-title"]} mt={1}>
                Upload Your Study Material
              </Typography>
              <Typography variant="body2" className={styles["card-content"]}>
                Upload raw text files to Recall, turning your notes into interactive study
                aids.
              </Typography>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ width: "100%" }}>
            <Card
              className={styles.card}
              sx={{
                textAlign: "center",
                padding: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderRadius: 2,
                width: "100%",
                marginBottom: { xs: 2, sm: 0 },
              }}
            >
              <FlashOnIcon fontSize="large" sx={{ color: "primary.main" }} />
              <Typography variant="h6" className={styles["card-title"]} mt={1}>
                Instant, AI-Powered Answers
              </Typography>
              <Typography variant="body2" className={styles["card-content"]}>
                Leveraging RAG (Retrieval-Augmented Generation) technology, Recall can instantly answer questions based
                on your notes.
              </Typography>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ width: "100%" }}>
            <Card
              className={styles.card}
              sx={{
                textAlign: "center",
                padding: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderRadius: 2,
                width: "100%",
              }}
            >
              <SourceIcon fontSize="large" sx={{ color: "primary.main" }} />
              <Typography variant="h6" className={styles["card-title"]} mt={1}>
                Transparent Sources
              </Typography>
              <Typography variant="body2" className={styles["card-content"]}>
                View the exact sources used for each answer, ensuring accuracy and helping you review the most relevant
                material.
              </Typography>
            </Card>
          </motion.div>
        </Box>
      </Box>

      {/* Team Section */}
      <Box textAlign="center" mt={6} mb={6} px={{ xs: 2, sm: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Meet the Team
        </Typography>
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="center"
          alignItems="center"
          gap={4}
          mt={4}
      
        >
          <Card
            className={styles.card}
            sx={{
              padding: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 2,
              width: "100%",
              maxWidth: 300,
              height: 150,
            }}
          >
            <Avatar alt="Carter Costic" src="/carter.jpeg" sx={{ width: 80, height: 80, mb: 2 }} />
            <Typography variant="h6" className={styles["card-title"]}>
              Carter <br />
              Costic
            </Typography>
          </Card>
          <Card
            className={styles.card}
            sx={{
              padding: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 2,
              width: "100%",
              maxWidth: 300,
              height: 150,
            }}
          >
            <Avatar alt="Kevin Le" src="/kevin.jpg" sx={{ width: 80, height: 80, mb: 2 }} />
            <Typography variant="h6" className={styles["card-title"]}>
              Kevin
              <br /> Le
            </Typography>
          </Card>
          <Card
            className={styles.card}
            sx={{
              padding: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 2,
              width: "100%",
              maxWidth: 300,
              height: 150,
            }}
          >
            <Avatar alt="Brandon Lee" src="/brandon.jpeg" sx={{ width: 80, height: 80, mb: 2 }} />
            <Typography variant="h6" className={styles["card-title"]}>
              Brandon <br />
              Lee
            </Typography>
          </Card>
          <Card
            className={styles.card}
            sx={{
              padding: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 2,
              width: "100%",
              maxWidth: 300,
              height: 150,
            }}
          >
            <Avatar alt="Austin Li" src="/austin.jpeg" sx={{ width: 80, height: 80, mb: 2 }} />
            <Typography variant="h6" className={styles["card-title"]}>
              Austin <br />
              Li
            </Typography>
          </Card>
          <Card
            className={styles.card}
            sx={{
              padding: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              borderRadius: 2,
              width: "100%",
              maxWidth: 300,
              height: 150,
            }}
          >
            <Avatar alt="William Zhang" src="/william.jpg" sx={{ width: 80, height: 80, mb: 2 }} />
            <Typography variant="h6" className={styles["card-title"]}>
              William
              <br /> Zhang
            </Typography>
          </Card>
        </Box>
      </Box>
    </motion.div>
  );
}
