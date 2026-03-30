// moved to the welcome page, this can be deleted now

import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../App.css";
import React from "react";
import { api } from "../api/api";

// TODO: clean up profile
// profile should take an existing user and display stuff (for now)
// NO user creation logic should be in here


export default function Profile() {
  // Attempts to get the token silently
  const { user, isAuthenticated, isLoading, getIdTokenClaims } = useAuth0();
  const navigate = useNavigate();

  const [sendUser] = api.endpoints.sendUser.useMutation();
  const { data: self } = api.endpoints.getSelf.useQuery();

  console.log(self);

  // TODO: fix this and create route abstraction
  const sendToken = React.useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const token = await getIdTokenClaims();
      if (!token || !token.__raw) return;
      localStorage.setItem("authToken", token?.__raw);
      // Call the mutation with the token && Change this after REMOVE response (only for testing)
      // const response = await postToken(token).unwrap();
      // console.log(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [isAuthenticated, getIdTokenClaims]);

  // Also fix this and create route abstration
  // TODO: remove unnecessary callback
  const sendUserInfo = React.useCallback(async () => {
    if (!isAuthenticated || !user || !user.name) return;

    try {
      const response = await sendUser({
        display_name: user.name,
      }).unwrap();
      console.log("Display name sent", response);
    } catch (error) {
      console.error("Error:", error);
    }
  }, [isAuthenticated, user, sendUser]);

  // TODO: i'm going to leave this (maybe it works? idk) but we shouldn't have
  // user creation (indiscriminate) in profile -> should be created on sign up
  // and probably not in useEffect. this could be triggered many times which is not optimal
  useEffect(() => {
    if (isAuthenticated) {
      sendToken();
      sendUserInfo();
    }
  }, [isAuthenticated, sendUserInfo, sendToken]); // sendToken,

  if (!isLoading && !isAuthenticated) {
    navigate("/");
  }

  if (isLoading) {
    return <p>Loading...</p>; // Show a loading indicator while checking auth status
  }

  // TODO: flatten this
  if (isAuthenticated) {
    return (
      <div className="container">
        <div className="wrapper">
          <img src={user?.picture} />
          <h2>{user?.name || "Unknown User"}</h2>
          <p>{user?.email || "No email provided"}</p>
        </div>
      </div>
    );
  }
}
