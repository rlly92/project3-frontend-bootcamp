import React, { useState, useContext, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { BACKEND_URL } from "../constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import NavBar from "./NavBar";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";

const Carts = () => {
  const { logout, isAuthenticated, getAccessTokenSilently, user, isLoading } =
    useAuth0();
  const navigate = useNavigate();
  const [cartListings, setcartListings] = useState(null);
  const [cartID, setCartID] = useState();
  const accessToken = localStorage.getItem("accessToken");

  // YOU HAVE TO MAKE A GET REQUEST TO FETCH THE ACTIVE CART FROM BACKEND HERE THEN CALL AGAIN TO GET OUT THE CARTS_LISTINGS:

  //   call /cartslistings/getalllineitems
  useEffect(() => {
    const loadCartsListings = async () => {
      try {
        const getAllLineItems = await axios.get(
          `${BACKEND_URL}/cartslistings/getalllineitems`,
          {
            cartID: 2,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("getAllLineItems.data:", getAllLineItems.data);
        if (getAllLineItems.data) {
          // if the carts_listings exist in the db(they normally would), store the carts_listings data in the local state of cartslistings:
          await setcartListings(getAllLineItems.data);
        }
      } catch (error) {
        console.error(
          "Error occurred while checking if user has added items to cart (if user has carts_listings) on db:",
          error
        );
      }
    };
    loadCartsListings();
  }, [accessToken]);
  console.log(cartListings);

  // Delete button logic: call BE to delete item: delete carts_listings for that specific carts_listings ID:

  const deleteItemFromCart = async () => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this listed item?"
      );

      if (!confirmed) {
        return;
      }
      const deleteItem = await axios.delete(
        `${BACKEND_URL}/carts_listings/deleteitemfromcart`,
        {
          id: "?????",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(deleteItem);
      toast.success("Item deleted successfully");
      setTimeout(() => {
        navigate("/listings");
      }, 3000);
    } catch (error) {
      console.error("Error occurred while deleting this listing.", error);
    }
  };

  return (
    <>
      <NavBar />
      isAuthenticated && listings ? (
      <div>
        <NavBar />
        <br />
        <br />
        <h1 className="centralized">ADD TO CART NOW! WHILE STOCKS LAST!</h1>

        <br />

        {cartListings.length > 0 ? (
          <Grid container spacing={2}>
            {cartListings.map((cartListing) => (
              <Grid item xs={12} sm={6} md={4} key={cartListing.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="350"
                    width="100"
                    image={
                      cartListing.photo_url_1 ||
                      cartListing.photo_url_2 ||
                      cartListing.photo_url_3
                    }
                    alt={cartListing.title}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {cartListing.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      ${cartListing.price}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      onClick={deleteItemFromCart(cartListing.id)}
                    >
                      Delete this item from cart.
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <h2>loading...</h2>
        )}
      </div>
      ) : ( // content rendered for users that are NOT signed in NOR logged in:
      <div>
        <h2>You are not logged in or signed up.</h2>
        <Button onClick={() => navigate("/")} variant="contained">
          Sign Up/Login Here
        </Button>
      </div>
      );
    </>
  );
};

export default Carts;
