import React, { useState, useContext, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { BACKEND_URL } from "../constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { UserContext } from "../App";
import { Stack, TextField, Typography } from "@mui/material";
/* import Typography from '@mui/joy/Typography'; */
/* import Card from "@mui/joy/Card"; */
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { useParams } from "react-router-dom";
import Button from "@mui/material/Button";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./NavBar";
import ItemListingStyle from "./ItemListingStyle.css";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";

const ItemListing = () => {
  const { isAuthenticated, getAccessTokenSilently, user, isLoading } =
    useAuth0();
  const accessToken = localStorage.getItem("accessToken");

  const navigate = useNavigate();
  const [currentAction, setCurrentAction] = useState("");
  const [listingID, setListingID] = useState("");
  const params = useParams().id;

  console.log(listingID);
  const [listing, setListing] = useState(null);

  useEffect(() => {
    console.log("params:", params);
    if (listingID !== params) {
      setListingID(params);
    }
  }, []);

  // WRITE LOGIC TO CALL BACKEND FOR GETTING OUT THIS LISTING:
  useEffect(() => {
    const loadThisListing = async () => {
      try {
        const getThisListing = await axios.get(
          `${BACKEND_URL}/listings/getlisting/${listingID}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("getThisListing.data:", getThisListing.data);
        if (getThisListing.data) {
          // if the listings exist in the db(they normally would), store the listings data in the local state of listings:
          setListing(getThisListing.data);
        }
      } catch (error) {
        console.error("Error occurred while getting listing", error);
      }
    };
    if (listingID !== "") {
      loadThisListing();
    }
  }, [accessToken, listingID]);
  console.log("listing:", listing);

  // LOGIC TO CHECK IF THE PERSON ON THIS LISTING IS A SELLER OR A BUYER:
  useEffect(() => {
    const checkCurrentUserID = async () => {
      if (user.email !== "" && listing) {
        try {
          const response = await axios.get(
            `${BACKEND_URL}/users/checkuserinfo?email=${user.email}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          console.log("current userID:", response.data.id);

          if (response.data.id === listing.user_id) {
            setCurrentAction("User is a seller");
          } else {
            setCurrentAction("User is a buyer");
          }
        } catch (error) {
          console.error(
            "Error occurred while checking user info exists on db:",
            error
          );
        }
      }
    };
    checkCurrentUserID();
  }, [user?.email, accessToken, listingID, listing]);

  // LOGIC FOR WHEN "ADD TO CART" BUTTON IS PRESSED:
  // const addToCart = () => {

  // Perform form submission actions
  //   axios
  //     .post(
  //       `${BACKEND_URL}/cartslistings/addtocart`,
  //       {
  //        listing_id: listingID,
  //        cart_id: ????,
  //        added_quantity: ???,
  //        subtotal_price:???
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       }
  //     )
  //     .then((res) => {
  //       setState({
  //         email: "",
  //         first_name: "",
  //         last_name: "",
  //         phone_number: "",
  //         buyer_address: "",
  //         seller_address: "",
  //       });

  //       navigate("/listings");
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  //   console.log({
  //     email: state.email,
  //     first_name: state.first_name,
  //     last_name: state.last_name,
  //     phone_number: state.phone_number,
  //     buyer_address: state.buyer_address,
  //     seller_address: state.seller_address,
  //   });
  //   return console.log("you've submitted user info!");
  // };

  // };

  // LOGIC FOR WHEN "DELETE ITEM" BUTTON IS PRESSED:
  const deleteItemListing = async () => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this listed item?"
      );

      if (!confirmed) {
        return;
      }
      const deleteItem = await axios.delete(
        `${BACKEND_URL}/listings/deletelisting/${listingID}`,
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

  if (isLoading) {
    // Show loading state
    return (
      <div>
        <h1>Loading...Your patience is appreciated.</h1>
      </div>
    );
  }

  return isAuthenticated && listingID !== "" ? (
    <div>
      <NavBar />
      <br />
      <br />
      <h1 className="centralized">ADD TO CART NOW!</h1>

      <br />
      <ToastContainer />
      {listing ? (
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Box display="flex" justifyContent="center">
              <Card>
                <Carousel>
                  {listing.photo_url_1 ? (
                    <div>
                      <img
                        src={listing.photo_url_1}
                        alt={listing.title}
                        style={{
                          width: "100%",
                          maxHeight: "400px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      <img
                        src="" // Provide a blank image source here
                        alt={listing.title}
                        style={{
                          width: "100%",
                          maxHeight: "400px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                  {listing.photo_url_2 ? (
                    <div>
                      <img
                        src={listing.photo_url_2}
                        alt={listing.title}
                        style={{
                          width: "100%",
                          maxHeight: "400px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      <img
                        src="" // Provide a blank image source here
                        alt={listing.title}
                        style={{
                          width: "100%",
                          maxHeight: "400px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                  {listing.photo_url_3 ? (
                    <div>
                      <img
                        src={listing.photo_url_3}
                        alt={listing.title}
                        style={{
                          width: "100%",
                          maxHeight: "400px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      <img
                        src="" // Provide a blank image source here
                        alt={listing.title}
                        style={{
                          width: "100%",
                          maxHeight: "400px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                </Carousel>
                <CardContent>
                  <Typography variant="h6" component="div">
                    {listing.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    ${listing.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Description: {listing.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Shipping Details: {listing.shipping_detail}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    SKU Number: {listing.sku_number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantity: {listing.quantity}
                  </Typography>
                  <br />
                  <CardActions>
                    {currentAction === "User is a buyer" ? (
                      <Button variant="contained">
                        {/* onClick={addToCart} */}
                        Add to Cart
                      </Button>
                    ) : (
                      <Button variant="contained" onClick={deleteItemListing}>
                        Delete This Listing
                      </Button>
                    )}
                  </CardActions>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <h2>loading...</h2>
      )}
    </div>
  ) : (
    // content rendered for users that are NOT signed in NOR logged in:
    <div>
      <h2>You are not logged in or signed up.</h2>
      <Button onClick={() => navigate("/")} variant="contained">
        Sign Up/Login Here
      </Button>
    </div>
  );
};
export default ItemListing;
