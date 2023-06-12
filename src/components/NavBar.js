import React, { useContext } from "react";
import { UserContext } from "../App";
import { useAuth0 } from "@auth0/auth0-react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Stack,
  Button,
  Avatar,
} from "@mui/material";
import SearchBar from "./UserSearchBar";
import { useNavigate, Outlet } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth0();

  //   const context = useContext(UserContext);
  //   const displayName = context.loggedInUser
  //     ? context.loggedInUser.displayName
  //     : "";

  const benDanButton = () => {
    navigate("/listings");
  };

  //   const handleProfileClick = () => {
  //     navigate(`/user/${displayName}`);
  //   };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 2 }}>
            <Button
              variant="contained"
              onClick={benDanButton}
              type="button"
              disableElevation
            >
              <Typography variant="h4" sx={{ fontFamily: "'Yeseva One'" }}>
                笨 蛋
              </Typography>
            </Button>
            <Button
              variant="contained"
              disableElevation
              onClick={() => navigate("/yourorders")}
            >
              Your Orders & Listings
            </Button>
            <Button
              variant="contained"
              disableElevation
              onClick={() => navigate("/createlisting")}
            >
              Create A New Listing
            </Button>
            <Button
              variant="contained"
              disableElevation
              onClick={() => navigate("/signupinfo")}
            >
              New User Info
            </Button>{" "}
            <Button
              variant="contained"
              disableElevation
              onClick={() => navigate("/carts")}
            >
              Your Cart
            </Button>
          </Typography>

          <Button
            variant="contained"
            disableElevation
            onClick={() => {
              localStorage.removeItem("accessToken");
              logout({ logoutParams: { returnTo: window.location.origin } });
            }}
            type="button"
          >
            Log Out
          </Button>
        </Toolbar>
      </AppBar>
      <Outlet />
    </>
  );
};

export default NavBar;
