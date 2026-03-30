// import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowForward, Visibility, VisibilityOff } from "@mui/icons-material";
// import Navbar from "../components/navbar";
import styles from "../styles/sign-in-page.module.css";
import { useNavigate } from "react-router-dom";

// TODO: add framer animation and consider forwarding
// information from here to Auth0 instead of using their UI
export default function SignUp() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // useEffect(() => {
  //   const savedDarkMode = localStorage.getItem("darkMode");
  //   if (savedDarkMode === "enabled") {
  //     document.body.classList.add("dark-mode");
  //   }
  // }, []);

  // const [sendUser] = api.endpoints.sendUser.useMutation();
  // Also fix this and create route abstration
  // // TODO: remove unnecessary callback
  // const sendUserInfo = React.useCallback(async () => {
  //   if (!isAuthenticated || !user || !user.name) return;

  //   try {
  //     const response = await sendUser({
  //       display_name: user.name,
  //     }).unwrap();
  //     console.log("Display name sent", response);
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // }, [isAuthenticated, user, sendUser]);

  const navigate = useNavigate();

  // TODO: redirect to a verify email page if succesful
  // currently redirects to the auth0 page where user has
  // to sign in again.
  const handleSignUp = async () => {
    try {
      const response = await fetch(`https://${import.meta.env.VITE_DOMAIN}/dbconnections/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: import.meta.env.VITE_CLIENTID,
          username: name,
          email,
          password,
          connection: "Username-Password-Authentication",
        }),
      });

      if (response.ok) {
        // Go sign in fix this later
        navigate("/signin");
      } else {
        const errorData = await response.json();
        console.error("Error creating user:", errorData);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.signInContainer}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className={styles.signInHeading}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Create an Account
        </motion.h1>
        <motion.p
          className={styles.signInSubheading}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Join us to start your learning journey.
        </motion.p>

        <motion.div className={styles.emailContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </motion.div>

        <motion.div className={styles.emailContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <input
            type="email"
            className={styles.inputField}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </motion.div>

        <motion.div
          className={styles.passwordContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <input
            type={showPassword ? "text" : "password"}
            className={styles.passwordInputField}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span onClick={togglePasswordVisibility} className={styles.eyeIcon}>
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </span>
        </motion.div>

        <motion.button
          className={styles.arrowBtn}
          onClick={handleSignUp}
          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
        >
          <ArrowForward className={styles.arrowIcon} />
        </motion.button>

        <motion.p className={styles.signUp} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
          Already have an account?{" "}
          <a href="/signin" className={styles.greenLink}>
            Sign in
          </a>
        </motion.p>
      </motion.div>
    </div>
  );

}