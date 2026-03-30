import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/landing-page";
import CallbackPage from "../pages/callback-page";
// import Profile from "../components/profile";
import Chat from "../pages/chat-page";
// import File from "../pages/file-page";
// import SignUp from "../components/sign-up";
import SignIn from "../components/sign-in";
import AboutP from "../pages/about-page";
import Help from "../pages/help-page";
import WelcomePage from "../pages/welcome-page";
import FileSystem from "../pages/file-system-page";
import { ReactElement } from "react";
import Protected from "../components/protected";
import ChatPage from "../pages/chat-page";
import Navbar from "../components/navbar";

interface RouteDef {
  path: string;
  component: ReactElement;
  protected?: boolean;
}

const routes: RouteDef[] = [
  { path: "/", component: <LandingPage />, protected: false },
  { path: "/callback", component: <CallbackPage />, protected: false },
  // { path: "/signup", component: <SignUp />, protected: false },
  { path: "/signin", component: <SignIn />, protected: false },
  { path: "/about", component: <AboutP />, protected: false },
  { path: "/help", component: <Help />, protected: false },
  { path: "/chat", component: <Chat /> },
  { path: "/welcome", component: <WelcomePage /> },
  { path: "/files", component: <FileSystem /> },
  { path: "/chat/:collection_id", component: <ChatPage /> },
];

export default function Router() {
  return (
    <Routes>
      {routes.map((route) => {
        const isProtected = route.protected ?? true;
        const navComponent = <Navbar>{route.component}</Navbar>;
        const component = isProtected ? <Protected>{navComponent}</Protected> : navComponent;
        return <Route key={route.path} path={route.path} element={component} />;
      })}
    </Routes>
  );
}
