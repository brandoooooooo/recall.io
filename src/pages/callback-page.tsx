import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function CallbackPage() {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/profile");
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="wrapper">
      <p>'Loading...'</p>
    </div>
  );
}
