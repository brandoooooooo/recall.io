import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Auth0ProviderWithNavigate } from "./auth0-provider.tsx";
import { Provider } from "react-redux";
import store from "./api/store.ts";
import "./index.css";
import Router from "./utils/Router.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <Provider store={store}>
          <Router />
        </Provider>
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </StrictMode>,
);
