import { Button, Typography, Container, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function Message({ title = "", message = "", buttonText = "" }) {
  return (
    <Container
      maxWidth="sm"
      style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Box textAlign="center">
        <Typography component="h1" style={{ fontSize: "48px", marginBottom: "20px" }}>
          {title}
        </Typography>
        <Typography component="p" style={{ fontSize: "24px", marginBottom: "40px" }}>
          {message}
        </Typography>
        {buttonText && (
          <Button
            variant="outlined"
            href="/"
            startIcon={<ArrowBackIcon />}
            sx={{
              fontSize: "20px",
              color: "#f1f1f1",
              borderColor: "#f1f1f1",
              padding: "10px 20px",
              borderRadius: "5px",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            {buttonText}
          </Button>
        )}
      </Box>
    </Container>
  );
}
