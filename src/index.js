import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import App from "./App";
import Listings from "./components/Listings";
import UserOrders from "./components/UserOrders";
import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUpInfoPage from "./components/SignUpInfoPage";
import CreateListing from "./components/CreateListing";
import Carts from "./components/Carts";
import ItemListing from "./components/ItemListing";
import LoginPage from "./components/LoginPage";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Auth0Provider
    domain={process.env.REACT_APP_DOMAIN}
    clientId={process.env.REACT_APP_CLIENT_ID}
    authorizationParams={{
      redirect_uri: process.env.REACT_APP_REDIRECT_URI,
      audience: process.env.REACT_APP_AUDIENCE,
      scope:
        "read:current_user update:current_user_metadata openid profile email",
    }}

    // useRefreshTokens={true}
    // useRefreshTokensFallback={false}
  >
    <App />
  </Auth0Provider>
);
