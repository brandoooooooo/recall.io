import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
// import { ArrowForward, Visibility, VisibilityOff } from "@mui/icons-material";
// import Navbar from "../components/navbar";
import React, { useState } from "react";
import styles from "../styles/sign-in-page.module.css";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const { loginWithPopup, getIdTokenClaims, isAuthenticated } = useAuth0();
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [showPassword, setShowPassword] = useState(false);
  const [createUser] = api.endpoints.sendUser.useMutation();
  const navigate = useNavigate();
  // const [message, setMessage] = useState("");

  React.useEffect(() => {
    if (isAuthenticated) navigate("/welcome");
  }, [isAuthenticated, navigate]);

  // useEffect(() => {
  //   const savedDarkMode = localStorage.getItem("darkMode");
  //   if (savedDarkMode === "enabled") {
  //     document.body.classList.add("dark-mode");
  //   }
  // }, []);

  // Handles google authentication still testing
  const handleGoogleLogin = async () => {
    try {
      await loginWithPopup({
        authorizationParams: {
          connection: "google-oauth2",
          scope: "openid profile email",
        },
      });

      // Fetch token claims and user details
      const tokenClaims = await getIdTokenClaims();
      if (!tokenClaims || !tokenClaims.__raw) return;
      localStorage.setItem("authToken", tokenClaims?.__raw);

      const response = await createUser({ display_name: tokenClaims.name ?? "" }).unwrap();

      if (response) {
        navigate("/welcome");
      }
    } catch (error) {
      console.error("Error during Google login:", error);
    }
  };

  // const handleLogin = async () => {
  //   try {
  //     await loginWithPopup({
  //       authorizationParams: {
  //         connection: "Username-Password-Authentication", // Connection for username-password
  //         scope: "openid profile email",
  //       },
  //     });
  //     // Fetch token claims and user details
  //     const tokenClaims = await getIdTokenClaims();
  //     if (!tokenClaims || !tokenClaims.__raw) return;
  //     localStorage.setItem("authToken", tokenClaims?.__raw);
  //     const response = await createUser({ display_name: tokenClaims.name ?? "" }).unwrap();
  //     if (response) {
  //       navigate("/welcome");
  //     }

  //     // gets the oauth token for user information THIS CODE IS FOR NO REDIRECTION
  //     // Should fail fetch if user did not verify their account
  //     // LOOK at this later does not properly authenticate the user
  //     // it is because auth0 is not explicitly returning the request back through
  //     // auh0-react api call**

  //     // const response = await fetch(`https://${import.meta.env.VITE_DOMAIN}/oauth/token`, {
  //     //   method: "POST",
  //     //   headers: { "Content-Type": "application/json" },
  //     //   body: JSON.stringify({
  //     //     username: email,
  //     //     password: password,
  //     //     client_id: import.meta.env.VITE_CLIENTID,
  //     //     client_secret: import.meta.env.VITE_CLIENTSECRET,
  //     //     grant_type: "password",
  //     //     scope: "openid profile email",
  //     //     connection: "Username-Password-Authentication",
  //     //   }),
  //     // });
  //     // if (!response.ok) return response;

  //     // const data = await response.json();
  //     // if (!data || !data.id_token) return;
  //     // localStorage.setItem("authToken", data?.id_token);
  //     // console.log(data?.id_token);

  //     // // Decode the ID token to get claims
  //     // const base64Url = data?.id_token.split(".")[1];
  //     // const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  //     // const jsonPayload = decodeURIComponent(
  //     //   atob(base64)
  //     //     .split("")
  //     //     .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
  //     //     .join(""),
  //     // );
  //     // const claims = JSON.parse(jsonPayload);
  //     // if (claims) {
  //     //   const user = await createUser({ display_name: claims.nickname ?? "" }).unwrap();
  //     //   if (user) {
  //     //     navigate("/welcome");
  //     //   }
  //     // }
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };

  // const togglePasswordVisibility = () => {
  //   setShowPassword((prev) => !prev);
  // };

  // const handleSignup = async () => {
  //   try {
  //     await loginWithPopup({
  //       authorizationParams: {
  //         screen_hint: "signup",
  //         scope: "openid profile email",
  //       },
  //     });

  //     const tokenClaims = await getIdTokenClaims();
  //     if (!tokenClaims || !tokenClaims.__raw) return;
  //     localStorage.setItem("authToken", tokenClaims?.__raw);
  //     const response = await createUser({ display_name: tokenClaims.name ?? "" }).unwrap();
  //     if (response) {
  //       setMessage("Please verify your email and sign in again.");
  //       setTimeout(() => {
  //         navigate("/signin");
  //       }, 3000);
  //     }
  //   } catch (error) {
  //     console.error("Error during signup:", error);
  //     setMessage("Error during signup. Please try again.");
  //   }
  // };

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
          Welcome back
        </motion.h1>
        <motion.p
          className={styles.signInSubheading}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Let's continue your learning journey.
        </motion.p>

        <motion.button
          className={styles.googleSignIn}
          onClick={handleGoogleLogin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign in with Google
        </motion.button>

        {/* <motion.div
          className={styles.dividerContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className={styles.line}></div>
          <span className={styles.divider}>or continue with</span>
          <div className={styles.line}></div>
        </motion.div> */}

        {/* <motion.div className={styles.emailContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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

        <motion.div
          className={styles.forgotPassword}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <a href="/forgot-password" className={styles.greenLink}>
            Forgot password?
          </a>
        </motion.div> */}

        {/* <motion.button
          className={styles.googleSignIn}
          onClick={() => handleLogin()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          Login with Auth0
        </motion.button>

        <motion.p
          className={styles.signUp}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          Don't have an account?{" "}
          <span onClick={handleSignup} className={styles.greenLink} style={{ cursor: "pointer" }}>
            Sign up
          </span>
        </motion.p>
        {message && (
          <motion.p className={styles.message} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {message}
          </motion.p>
        )} */}
      </motion.div>
    </div>
  );
}
