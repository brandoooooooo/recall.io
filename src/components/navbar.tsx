import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import styles from "../styles/navbar.module.css";

interface NavbarProps {
  children: React.ReactNode;
}

interface NavLinkProps {
  to: string;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavLink = ({ to, label, isActive, onClick }: NavLinkProps) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`${styles.navItem} ${isActive ? styles.active : ""}`}
  >
    {onClick ? (
      <button onClick={onClick} className={`${styles.navBarText} ${isActive ? styles.active : ""}`}>
        {label}
      </button>
    ) : (
      <Link to={to} className={`${styles.navBarText} ${isActive ? styles.active : ""}`}>
        {label}
      </Link>
    )}
  </motion.div>
);

function Logo() {
  const { isAuthenticated } = useAuth0();

  if (isAuthenticated)
    return (
      <Link to="/welcome" className={styles.logo}>
        RECALL
      </Link>
    );

  return (
    <Link to="/" className={styles.logo}>
      RECALL
    </Link>
  );
}

// function Account() {
//   const { isAuthenticated } = useAuth0();

//   if (isAuthenticated) return <NavLink to="/profile" label="Account" />;

//   return null;
// }

export default function Navbar({ children }: NavbarProps) {
  const location = useLocation();
  const { logout } = useAuth0();

  const path = location.pathname.split("/")?.[1] || "landing";
  const isCommon = !["chat", "files", "welcome", "help"].includes(path);

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  // const toggleDarkMode = () => {
  //   const isDarkMode = document.body.classList.toggle("dark-mode");
  //   localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
  // };

  // useEffect(() => {
  //   // get saved isDarkMode state
  //   const savedDarkMode = localStorage.getItem("darkMode");
  //   if (savedDarkMode === "enabled") {
  //     document.body.classList.add("dark-mode");
  //   }
  // }, []);

  const commonLinks = [
    { to: "/help", label: "Help" },
    { to: "/about", label: "About" },
  ];

  const mainNavLinks = [
    { to: "/chat", label: "Chat", isActive: path === "chat" },
    { to: "/files", label: "Files", isActive: path === "files" },
    { to: "/help", label: "Help", isActive: path === "help" },
  ];

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={styles.logoContainer}>
            <Logo />
          </motion.div>
        </div>
        <div className={styles.navContainer}>
          {!isCommon && mainNavLinks.map((link) => <NavLink key={link.to} {...link} />)}
          {isCommon && commonLinks.map((link) => <NavLink key={link.to} to={link.to} label={link.label} />)}
        </div>
        <div className={styles.logOutButton}>
          {/* <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className={styles.darkModeButton}
          aria-label="Toggle dark mode"
        >
          <Brightness6Icon />
        </motion.button> */}
          {!isCommon && (
            <>
              <Link to="/" onClick={handleLogout} className={styles.navItem}>
                Log out
              </Link>
            </>
          )}
        </div>
      </nav>
      {children}
    </>
  );
}
