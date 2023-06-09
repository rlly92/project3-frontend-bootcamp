import React, { useState, useContext, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";

const LoginPage = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/listings");
    }
  });

  if (isLoading) {
    // Show loading state
    return (
      <div>
        <h1>Loading...Your patience is appreciated.</h1>
      </div>
    );
  }

  return (
    <Stack alignItems={"center"} justifyContent={"center"} my={1}>
      <Paper sx={{ px: 5, py: 4, my: 7 }} elevation={0}>
        <Typography variant="h1" sx={{ fontFamily: "'Yeseva One'" }}>
          笨 蛋 <br />
          BEN-DAN <br />
          Ecommerce
        </Typography>
      </Paper>
      <Typography variant="h4">
        Because online shopping should be STUPID easy.
      </Typography>
      <br />
      <Button variant="contained" onClick={() => loginWithRedirect()}>
        Log In
      </Button>
      <br />
      <Typography variant="h4">Don't have an account yet?</Typography>
      <br />
      <Button
        variant="contained"
        onClick={() =>
          loginWithRedirect({
            authorizationParams: {
              screen_hint: "signup",
            },
            appState: {
              returnTo: "/listings",
            },
          })
        }
      >
        Sign Up
      </Button>
      <br />
      <br />
      <br />
      <br />
    </Stack>
  );
};

export default LoginPage;
