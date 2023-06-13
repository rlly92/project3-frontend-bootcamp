import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../App";
import { useAuth0 } from "@auth0/auth0-react";
import { BACKEND_URL } from "../constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

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
  // const context = useContext(UserContext);
  const [userEmail, setUserEmail] = useState("");
  const [userID, setUserID] = useState(null);
  const [cartID, setCartID] = useState(null);
  const [cartListings, setcartListings] = useState(null);
  const [listingsData, setListingsData] = useState(null);

  const accessToken = localStorage.getItem("accessToken");

  // YOU HAVE TO MAKE A GET REQUEST TO FETCH THE ACTIVE CART FROM BACKEND HERE THEN CALL AGAIN TO GET OUT THE CARTS_LISTINGS:

  useEffect(() => {
    if (isAuthenticated && user) {
      setUserEmail(user.email);
      console.log("user email:", user.email);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const lookUpUserID = async () => {
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
  }, [accessToken, userID, navigate, userEmail]);

  useEffect(() => {
    const lookUpCartID = async () => {
      // look up cartID:
      try {
        const findActiveCartID = await axios.get(
          `${BACKEND_URL}/carts/checkforactivecart?user_id=${userID}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log("findActiveCartID:", findActiveCartID.data.id);
        if (findActiveCartID.data.id) {
          console.log("cartID exists!");
          setCartID(findActiveCartID.data.id);
        } else {
          console.log("cartID does not exist!");
          navigate("/listings");
        }
      } catch (error) {
        console.error(
          "Error occurred while checking user info exists on db:",
          error
        );
      }
    };

    if (userID !== null) {
      lookUpCartID();
    }
  }, [userID, accessToken, navigate, cartID]);
  console.log("cartID:", cartID);

  // TO GET ALL LINE ITEMS IN THE CURRENT ACTIVE CART: call /cartslistings/getalllineitems
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

  //  logic to pass all listingsIDs from cartsListings into the get request to get all the respective listings from backend that pertain to the IDs in cartsListings
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

  // Delete button logic: call BE to delete item: delete carts_listings for that specific carts_listings ID:

  const deleteItemFromCart = async (cartListingId) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this listed item?"
      );

      if (!confirmed) {
        return;
      }
      const deleteItem = await axios.delete(
        `${BACKEND_URL}/cartslistings/deleteitemfromcart`,

        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          data: {
            cartListingId,
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

  // LOGIC FOR WHEN USER WANTS TO EDIT AND ADJUST THE QTY FOR THE CART ITEM HE/SHE ADDED:
  const updateQuantity = async (cartListingId, quantity, subtotal) => {
    try {
      const updatedItem = await axios.put(
        `${BACKEND_URL}/cartslistings/updateitemqty`,
        {
          added_quantity: quantity,
          id: cartListingId,
          subtotal_price: subtotal,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log(updatedItem);

      console.log("statusText for updatedItem:", updatedItem.statusText);
      if (updatedItem.statusText === "OK" && !updatedItem.data.message) {
        toast.success("Quantity updated successfully");
        // Reload the cart listings to reflect the updated quantity and subtotal
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
      console.log(
        "error message for when edit qty>listing qty:",
        updatedItem.data.message
      );
      if (
        updatedItem.data.message ===
        "You have exceeded the stock quantity available"
      ) {
        toast.error("Quantity added exceeded the available stock.");
      }
    } catch (error) {
      console.error("Error occurred while updating the quantity.", error);
    }
  };

  // LOGIC FOR WHAT HAPPENS WHEN USER AS A BUYER CHECKS OUT CART:
  const checkOutCart = async () => {
    try {
      const confirmed = window.confirm("Are you sure you want to checkout?");

      if (!confirmed) {
        return;
      }
      const updateCartStatus = await axios.put(
        `${BACKEND_URL}/carts/changecartstatus`,
        { cartID: cartID, status: "checked out" },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("updateCartStatus:", updateCartStatus);
      console.log("updateCartStatus.statusText:", updateCartStatus.statusText);
      if (updateCartStatus) {
        toast.success("CONGRATULATIONS! YOU'VE MADE AN ORDER!");
        // Redirect to "/listings" for backend to create new active cart for another lifecycle of buying:
        setTimeout(() => {
          navigate("/listings");
        }, 3000);
      }

      // if (updatedItem.statusText === "OK" && !updatedItem.data.message) {
      //   toast.success("Quantity updated successfully");
      //   // Reload the cart listings to reflect the updated quantity and subtotal
      //   setTimeout(() => {
      //     window.location.reload();
      //   }, 3000);
      // }
      // console.log(
      //   "error message for when edit qty>listing qty:",
      //   updatedItem.data.message
      // );
      // if (
      //   updatedItem.data.message ===
      //   "You have exceeded the stock quantity available"
      // ) {
      //   toast.error("Quantity added exceeded the available stock.");
      // }
    } catch (error) {
      console.error("Error occurred while updating the quantity.", error);
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
  return (
    <div>
      <NavBar />
      <br />
      <br />
      <h1 className="centralized">
        THIS IS YOUR CART. CHECKOUT TO CONFIRM ORDER.
      </h1>
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
                        Subtotal: ${listing.price * cartListing.added_quantity}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => deleteItemFromCart(cartListing.id)}
                      >
                        Remove item
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => {
                          const newQuantity = prompt("Enter the new quantity");
                          if (newQuantity && parseInt(newQuantity) !== 0) {
                            const subtotal =
                              listing.price * parseInt(newQuantity);
                            updateQuantity(
                              cartListing.id,
                              parseInt(newQuantity),
                              subtotal
                            );
                          } else {
                            // Show an error message or handle the case where the quantity is 0
                            toast.error("Invalid quantity");
                          }
                        }}
                      >
                        Edit Quantity
                      </Button>
                    </CardActions>
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
          <Button
            variant="contained"
            style={{
              float: "right",
              backgroundColor: "yellow",
              color: "black",
            }}
            onClick={checkOutCart}
          >
            CHECK OUT!
          </Button>
        </>
      ) : (
        <h2 style={{ textAlign: "center" }}>Your Cart is empty!</h2>
      )}
    </div>
  );
};

export default Carts;
