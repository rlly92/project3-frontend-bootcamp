import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import App from "./App";
import Listings from "./components/Listings";
import UserProfilePage from "./components/UserProfilePage";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUpInfoPage from "./components/SignUpInfoPage";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Auth0Provider
    domain={process.env.REACT_APP_DOMAIN}
    clientId={process.env.REACT_APP_CLIENT_ID}
    authorizationParams={{
      redirect_uri: "http://localhost:3000/listings",
      audience: process.env.REACT_APP_AUDIENCE,
      scope: "read:current_user update:current_user_metadata",
    }}

    // useRefreshTokens={true}
    // useRefreshTokensFallback={false}
  >
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/signupinfo" element={<SignUpInfoPage />} />
      </Routes>
    </BrowserRouter>
  </Auth0Provider>
);
