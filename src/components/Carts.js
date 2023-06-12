import React, { useState, useContext, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import NavBar from "./NavBar";

const Carts = () => {
  // YOU HAVE TO MAKE A GET REQUEST TO FETCH THE ACTIVE CART FROM BACKEND HERE THEN CALL AGAIN TO GET OUT THE CARTS_LISTINGS:

  //   call /carts/checkforactivecart and call /cartslistings/getalllineitems
  return (
    <>
      <NavBar />

      {/* render the cart listings here: */}
      <div>Carts</div>
    </>
  );
};

export default Carts;
