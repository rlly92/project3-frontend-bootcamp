import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../constants";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";

const SignUpInfoPage = () => {
  const { isAuthenticated, user, getAccessTokenSilently, isLoading } =
    useAuth0();

  const accessToken = localStorage.getItem("accessToken");
  console.log("access token:", accessToken);

  const [state, setState] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    buyer_address: "",
    seller_address: "",
  });
  const navigate = useNavigate();

  // GET EMAIL ON MOUNT:
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
    if (isAuthenticated && user) {
      setState({
        email: user.email,
      });
      console.log("user email:", user.email);
    }
  }, [isAuthenticated]);

  console.log("email:", state.email);

  // UseEffect here to validate if user has given backend his user data, if yes redirect them to /listings page:
  useEffect(() => {
    const checkUserInfoExists = async () => {
      if (state.email !== "") {
        try {
          const response = await axios.get(
            `${BACKEND_URL}/users/checkuserinfo?email=${state.email}`,
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
            navigate("/listings");
          } else {
            console.log("user info does not exist!");
          }
        } catch (error) {
          console.error(
            "Error occurred while checking user info exists on db:",
            error
          );
        }
      }
    };
    checkUserInfoExists();
  }, [state?.email, accessToken]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform form submission actions
    axios
      .post(
        `${BACKEND_URL}/users/signupinfo`,
        {
          email: state.email,
          first_name: state.first_name,
          last_name: state.last_name,
          phone_number: state.phone_number,
          buyer_address: state.buyer_address,
          seller_address: state.seller_address,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((res) => {
        setState({
          email: "",
          first_name: "",
          last_name: "",
          phone_number: "",
          buyer_address: "",
          seller_address: "",
        });

        navigate("/listings");
      })
      .catch((error) => {
        console.log(error);
      });
    console.log({
      email: state.email,
      first_name: state.first_name,
      last_name: state.last_name,
      phone_number: state.phone_number,
      buyer_address: state.buyer_address,
      seller_address: state.seller_address,
    });
    return console.log("you've submitted user info!");
  };

  const handleChange = (e) => {
    setState({ ...state, [e.target.id]: e.target.value });
    console.log(state);
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
    <Stack alignItems={"center"} justifyContent={"center"} my={5}>
      <Typography variant="h2">
        Thank you for signing up!
        <br />
        Welcome to our community!
      </Typography>
      <br />
      <Typography variant="subtitle1">
        Please kindly provide your details below to make your shopping a breeze:
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack
          alignItems={"center"}
          justifyContent={"center"}
          spacing={2}
          mt={2}
        >
          <TextField
            required
            autoComplete="off"
            value={state.first_name}
            size="small"
            id="first_name"
            type="first_name"
            label="First Name"
            onChange={handleChange}
          ></TextField>
          <TextField
            required
            autoComplete="off"
            value={state.last_name}
            size="small"
            id="last_name"
            type="last_name"
            label="Last Name"
            onChange={handleChange}
          ></TextField>
          <TextField
            required
            autoComplete="off"
            value={state.phone_number}
            size="small"
            id="phone_number"
            type="phone_number"
            label="Phone No."
            onChange={handleChange}
          ></TextField>
          <TextField
            required
            autoComplete="off"
            value={state.buyer_address}
            size="small"
            id="buyer_address"
            type="buyer_address"
            label="Buyer Address"
            onChange={handleChange}
          ></TextField>
          <TextField
            required
            autoComplete="off"
            value={state.seller_address}
            size="small"
            id="seller_address"
            type="seller_address"
            label="Seller Address"
            onChange={handleChange}
          ></TextField>
          <Button type="submit" variant="contained">
            Sign Up
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};

export default SignUpInfoPage;
