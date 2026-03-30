import { Link } from "react-router-dom";

interface Props {
  title?: string;
  message?: string;
  goBack?: boolean;
}

function ErrorPage({ title = "An error has occurred", message = "Oops, something went wrong.", goBack = true }: Props) {
  return (
    <div
      style={{
        justifyContent: "center",
        alignContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}>{title}</h1>
        <p style={{ fontSize: "1.25rem", marginBottom: "2rem" }}>{message}</p>
        {goBack && (
          <Link
            to="/"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              color: "#fff",
              backgroundColor: "#007bff",
              borderRadius: "0.25rem",
              textDecoration: "none",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0056b3")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#007bff")}
          >
            Go back home
          </Link>
        )}
      </div>
    </div>
  );
}

export default ErrorPage;
