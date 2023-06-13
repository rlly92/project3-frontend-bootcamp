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
  Autocomplete,
  TextField,
  Box,
} from "@mui/material";
import SearchBar from "./UserSearchBar";
import { useNavigate, Outlet } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth0();
  const context = useContext(UserContext);

  console.log("context.listingsForNavBar:", context.listingsForNavBar);

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

  const handleItemClick = (optionID) => {
    navigate(`/itemlisting/${optionID}`);
  };

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
            {/* THIS BUTTON BELOW WAS CREATED PURELY FOR DEV STAGES AND IS NOT NEEDED FOR USER AT DEPLOYMENT: */}
            {/* <Button
              variant="contained"
              disableElevation
              onClick={() => navigate("/signupinfo")}
            >
              New User Info
            </Button>{" "} */}
            <Button
              variant="contained"
              disableElevation
              onClick={() => navigate("/carts")}
            >
              Your Cart
            </Button>
          </Typography>
          {context.listingsForNavBar ? (
            <Autocomplete
              id="listingTitle"
              getOptionLabel={(option) => option.title}
              options={context.listingsForNavBar}
              sx={{ width: 300 }}
              isOptionEqualToValue={(option, value) => option === value}
              noOptionsText={"NO ITEMS CAN BE FOUND"}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  key={option.title}
                  onClick={() => handleItemClick(option.id)}
                >
                  {option.title}
                </Box>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Search for your latest buy!" />
              )}
            />
          ) : (
            <div> </div>
          )}

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
