import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import ErrorPage from "./error-page";
import AupDialog from "./aup-dialog";

interface DefaultProps {
  children: React.ReactNode;
}

export default function Protected({ children }: DefaultProps) {
  const navigate = useNavigate();
  const [tokenIsSaved, setTokenIsSaved] = React.useState(false);

  // use Auth0 user in the future, but ignore for now
  const { error, isAuthenticated, isLoading, getIdTokenClaims } = useAuth0();
  const {
    data: self,
    isLoading: selfIsLoading,
    isUninitialized: selfIsUnitinitialized,
    isError: selfIsError,
  } = api.endpoints.getSelf.useQuery(undefined, { skip: !isAuthenticated || !tokenIsSaved });

  React.useEffect(() => {
    async function saveToken() {
      const tokenExists = localStorage.getItem("authToken") != null;
      console.log(tokenExists);
      if (tokenExists) {
        setTokenIsSaved(true);
        return;
      }

      try {
        console.log("running");
        const token = await getIdTokenClaims();
        if (!token || !token.__raw) return;
        localStorage.setItem("authToken", token?.__raw);
        setTokenIsSaved(true);
      } catch {}
    }

    if (isAuthenticated) saveToken();
  }, [isAuthenticated, getIdTokenClaims, setTokenIsSaved]);

  // TODO: make generic error page
  if (isLoading || selfIsLoading) return <div>loading</div>;

  if (error || selfIsError)
    return <ErrorPage title="We can't find your account." message="There seems to be an error with your profile." />;

  if ((!selfIsUnitinitialized && self == null) || !isAuthenticated) navigate("/");

  // AUP
  if (self && !self.accepted_aup) {
    return (
      <>
        <AupDialog />
        {children}
      </>
    );
  }

  return children;
}
