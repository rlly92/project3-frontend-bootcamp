import React, { createContext, useCallback, useEffect, useState } from "react";

import LoginPage from "./components/LoginPage";
import Listings from "./components/Listings";
import Carts from "./components/Carts";
import ItemListing from "./components/ItemListing";
import NavBar from "./components/NavBar";

import { BrowserRouter, Route, Routes, Navigate, Link } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";

export const UserContext = createContext();

const App = () => {
  const [userID, setUserID] = useState(null);
  const [cartID, setCartID] = useState(null);

  const context = {
    userID,
    setUserID,
    cartID,
    setCartID,
  };

  return (
    <UserContext.Provider value={context}>
      <div className="App">
        <NavBar />

        <Listings />
        <Carts />
        <ItemListing />

        <ToastContainer />
      </div>
    </UserContext.Provider>
  );
};

export default App;
