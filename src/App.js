import React, { createContext, useCallback, useEffect, useState } from "react";
import UserOrders from "./components/UserOrders";
import CreateListing from "./components/CreateListing";
import SignUpInfoPage from "./components/SignUpInfoPage";
import LoginPage from "./components/LoginPage";
import Listings from "./components/Listings";
import Carts from "./components/Carts";
import ItemListing from "./components/ItemListing";
import NavBar from "./components/NavBar";

import { BrowserRouter, Route, Routes, Navigate, Link } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import "./App.css";

export const UserContext = createContext();

const App = () => {
  const [userID, setUserID] = useState(null);
  const [cartID, setCartID] = useState(null);
  const [listingsForNavBar, setListingsForNavBar] = useState(null);
  const context = {
    userID,
    setUserID,
    cartID,
    setCartID,
    listingsForNavBar,
    setListingsForNavBar,
  };

  return (
    <UserContext.Provider value={context}>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/listings" element={<Listings />} />
            <Route
              path="/navbarthatwillneverbeaccessedbytheenduserandomgimjustputtingitheretopleaseReact"
              element={<NavBar />}
            />
            <Route path="/yourorders" element={<UserOrders />} />
            <Route path="/signupinfo" element={<SignUpInfoPage />} />
            <Route path="/createlisting" element={<CreateListing />} />
            <Route path="/carts" element={<Carts />} />
            <Route path="/itemlisting/:id" element={<ItemListing />} />
          </Routes>
        </BrowserRouter>

        <ToastContainer />
      </div>
    </UserContext.Provider>
  );
};

export default App;
