import React, { useState, useContext, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { BACKEND_URL } from "../constants";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import NavBar from "./NavBar";

const UserOrders = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();

  const accessToken = localStorage.getItem("accessToken");
  const [userID, setUserID] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [checkedOutCarts, setCheckedOutCarts] = useState([]);
  const [listingsMadeByUser, setListingsMadeByUser] = useState([]);
  const navigate = useNavigate();

  //GET USERID FIRST:
  useEffect(() => {
    const lookUpUserID = async () => {
      if (isAuthenticated && user) {
        setUserEmail(user.email);
        console.log("user email:", user.email);
      }
      // look up userID first:
      try {
        const response = await axios.get(
          `${BACKEND_URL}/users/checkuserinfo?email=${userEmail}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log(response.data);
        // Check the response to determine if the project exists
        if (!response.data.error) {
          console.log("user info exists!");
          setUserID(response.data.id);
          console.log("userID:", userID);
        } else {
          console.log("user info does not exist!");
        }
      } catch (error) {
        console.error(
          "Error occurred while checking user info exists on db:",
          error
        );
      }
    };
    if (userEmail !== "") {
      lookUpUserID();
    }
  }, [accessToken, userID, navigate, userEmail, isAuthenticated, user]);

  // THIS IS TO GET ALL THE CHECKED OUT CARTS FOR THE CURRENT USER FROM THE BACKEND AND THEN LATER WILL BE DISPLAYED AS "ORDERS MADE" BY USER:
  useEffect(() => {
    const loadAllCheckedOutCarts = async () => {
      try {
        const getAllCheckedOutCarts = await axios.get(
          `${BACKEND_URL}/carts/checkforcheckedoutcart?user_id=${userID}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("getAllCheckedOutCarts.data:", getAllCheckedOutCarts.data);
        setCheckedOutCarts(getAllCheckedOutCarts.data);
      } catch (error) {
        console.error(
          "Error occurred while checking user info exists on db:",
          error
        );
      }
    };
    if (userID !== null) {
      loadAllCheckedOutCarts();
    }
  }, [accessToken, userID]);

  // THIS IS LOGIC THAT LOADS OUT THE LISTINGS THE SIGNED IN USER HAS ALREADY MADE AND IS CURRENTLY SELLING:
  useEffect(() => {
    const loadAllListingsMadeByUser = async () => {
      try {
        const getAllListings = await axios.post(
          `${BACKEND_URL}/listings/getalllistingsbythisuser`,
          {
            userID: userID,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log("getAllListings:", getAllListings);
        console.log("getAllListings.data:", getAllListings.data);
        setListingsMadeByUser(getAllListings.data);
      } catch (error) {
        console.error(
          "Error occurred while checking user info exists on db:",
          error
        );
      }
    };
    if (userID !== null) {
      loadAllListingsMadeByUser();
    }
  }, [accessToken, userID]);

  if (isLoading) {
    // Show loading state
    return (
      <div>
        <h1>Loading...Your patience is appreciated.</h1>
      </div>
    );
  }

  return (
    isAuthenticated && (
      <div>
        <NavBar />
        <div>
          <h1>Your Orders made as a Buyer:</h1>
          <br />

          {checkedOutCarts.map((cart) => (
            <div key={cart.id}>
              <Link to={`/vieworder/${cart.id}`}>
                <Typography variant="h6">Order ID: {cart.id}</Typography>
              </Link>
              <Typography variant="body1">
                Order made on: {cart.updatedAt}
              </Typography>
              <br />
            </div>
          ))}
          <h1>Your Orders received as a Seller:</h1>
          <br />
          <h1>You are currently selling these items:</h1>
          {listingsMadeByUser.map((listing) => (
            <div key={listing.id}>
              <Typography variant="h6">
                <Link to={`/itemlisting/${listing.id}`}>{listing.title}</Link>
              </Typography>
              <Typography variant="h6">Price: ${listing.price}</Typography>
              <Typography variant="h6">Quantity: {listing.quantity}</Typography>
              <Typography variant="h6">SKU: {listing.sku_number}</Typography>
              <img
                src={listing.photo_url_1}
                alt="product img"
                style={{ width: "200px" }}
              />
              <br />
            </div>
          ))}
        </div>
      </div>
    )
  );
};

export default UserOrders;
