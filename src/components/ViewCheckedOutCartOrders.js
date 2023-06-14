import React, { useState, useContext, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { BACKEND_URL } from "../constants";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import NavBar from "./NavBar";

const ViewCheckedOutCartOrders = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");
  const params = useParams().id;

  const [cartID, setCartID] = useState(null);
  const [cartListings, setcartListings] = useState(null);
  const [listingsData, setListingsData] = useState(null);

  // To take the end point URL number which is the cart ID and then store it in a local state:
  useEffect(() => {
    console.log("params:", params);
    if (cartID !== params) {
      setCartID(params);
    }
  }, []);

  // ONCE GET CART ID, THEN FISH OUT THE ADDED_QUANTITY AND SUBTOTAL PRICE FROM CARTS_LISTINGS AND THEN
  // FISH OUT LISTING_ID, USING LISTING_ID, LOOK FOR ALL THE RELEVANT LISTINGS:

  // FIRST: GET ALL LINE ITEMS IN THE CURRENT ACTIVE CART: call /cartslistings/getalllineitems
  useEffect(() => {
    const loadCartsListings = async () => {
      try {
        const getAllLineItems = await axios.post(
          `${BACKEND_URL}/cartslistings/getalllineitems`,
          {
            cartID: cartID,
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
    if (cartID !== null) {
      loadCartsListings();
    }
  }, [accessToken, cartID]);
  console.log("cartListings:", cartListings);

  //  Use listingsIDs from cartsListings to send with the get request to get all the respective listings from backend (from listings table):
  useEffect(() => {
    const getAllListings = async () => {
      try {
        const listingsIDs = await cartListings.map(
          (cartListing) => cartListing.listing_id
        );
        console.log("listingsIDs:", listingsIDs);
        const listingsPromises = listingsIDs.map((listingID) =>
          axios.get(`${BACKEND_URL}/listings/getlisting/${listingID}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
        );

        const listingsResponses = await Promise.all(listingsPromises);
        console.log("listingsPromises:", listingsPromises);
        const listingsData = listingsResponses.map((response) => response.data);
        await setListingsData(listingsData);
        console.log("All listings:", listingsData);
        // Use the listingsData as needed
      } catch (error) {
        console.error("Error occurred while fetching listings:", error);
      }
    };

    if (cartListings) {
      getAllListings();
    }
  }, [accessToken, cartListings]);

  return (
    isAuthenticated && (
      <div>
        <NavBar />
        <br />
        <br />
        <h1 className="centralized">THIS WAS YOUR ORDER #{cartID}</h1>
        <br />
        {cartListings && listingsData && cartListings.length > 0 ? (
          <>
            <Grid container spacing={2}>
              {cartListings.map((cartListing, index) => {
                const listing = listingsData[index];

                return (
                  <Grid item xs={12} sm={6} md={4} key={cartListing.id}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="350"
                        width="100"
                        image={
                          listing.photo_url_1 ||
                          listing.photo_url_2 ||
                          listing.photo_url_3
                        }
                        alt={listing.title}
                      />
                      <CardContent>
                        <Typography variant="h6" component="div">
                          <Link
                            to={`/itemlisting/${listing.id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            {listing.title}
                          </Link>
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                          Price: ${listing.price}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                          Quantity ordered: {cartListing.added_quantity}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                          Subtotal: $
                          {listing.price * cartListing.added_quantity}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
              <br />
            </Grid>
            <br />
            <Typography variant="h6" align="right">
              TOTAL CART VALUE: $
              {cartListings.reduce(
                (total, cartListing) => total + cartListing.subtotal_price,
                0
              )}
            </Typography>
          </>
        ) : (
          <h2 style={{ textAlign: "center" }}>Your Cart was empty!</h2>
        )}
      </div>
    )
  );
};

export default ViewCheckedOutCartOrders;
