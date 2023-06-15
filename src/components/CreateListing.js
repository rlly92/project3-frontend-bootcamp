import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { BACKEND_URL } from "../constants";
import { useNavigate, useParams } from "react-router-dom";
import {
  ref as sRef,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { ref as dbRef, update } from "firebase/database";
import { storage } from "../firebase";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import {
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { MuiFileInput } from "mui-file-input";

import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

// import Select from "@mui/material/Select";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./NavBar";

const CreateListing = () => {
  // FOR NAVIGATION:
  const navigate = useNavigate();
  //
  // FOR AUTH0:
  const { isAuthenticated, user, isLoading } = useAuth0();
  //
  // FOR GETTING ACCESS TOKEN FROM LOCAL STORAGE:
  const accessToken = localStorage.getItem("accessToken");
  //
  // LOCAL STATES FOR IMAGE SUBMISSION:
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [file3, setFile3] = useState(null);
  // const [file, setFile] = useState([]);
  const [fileErrorText, setFileErrorText] = useState("");
  //

  // LOCAL STATES FOR CATEGORIES SUBMISSION:
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  //

  // LOCAL STATES FOR LISTINGS FORM SUBMISSION:
  const [state, setState] = useState({
    user_id: "",
    title: "",
    price: "",
    description: "",
    shipping_detail: "",
    sku_number: "",
    quantity: "",
  });

  // WHEN USER FIRST ACCESSES THIS PAGE: GET USER ID AND STORE IN LOCAL STATE:
  // GET USER ID ON MOUNT, USE EMAIL TO FISH OUT THE ID:
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
    if (isAuthenticated && user) {
      console.log("user email:", user.email);

      const checkUserInfoExists = async () => {
        try {
          const response = await axios.get(
            `${BACKEND_URL}/users/checkuserinfo?email=${user.email}`,
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
            setState({ user_id: response.data.id });
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
      checkUserInfoExists();
    }
  }, [user?.email, accessToken, isAuthenticated, user]);

  console.log("state.user_id:", state.user_id);

  // ALL THE LOGIC FOR SUBMIT BUTTON TO SUBMIT ALL THE DATA TO BACKEND:
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Show loading toast message
    toast.info("Submitting listing...", { autoClose: false });
    // Extract category IDs to send to backend
    const selectedCategoryIDs = selectedCategories.map(({ value }) => value);
    console.log(selectedCategoryIDs);

    // FIREBASE LOGIC FOR SUBMITTING PHOTOS GOES HERE: (need to call the FIREBASE URL up and store it here first before pushing it into backend)
    const fileURLs = [];
    if (file1) {
      const storageRef = sRef(storage, `photos/${file1.name}`);
      await uploadBytesResumable(storageRef, file1);
      const downloadURL1 = await getDownloadURL(storageRef);
      fileURLs.push(downloadURL1);
      console.log("fileURLs1:", fileURLs);
    }
    if (file2) {
      const storageRef = sRef(storage, `photos/${file2.name}`);
      await uploadBytesResumable(storageRef, file2);
      const downloadURL2 = await getDownloadURL(storageRef);
      fileURLs.push(downloadURL2);
      console.log("fileURLs1+2:", fileURLs);
    }
    if (file3) {
      const storageRef = sRef(storage, `photos/${file3.name}`);
      await uploadBytesResumable(storageRef, file3);
      const downloadURL3 = await getDownloadURL(storageRef);
      fileURLs.push(downloadURL3);
      console.log("fileURLs1+2+3:", fileURLs);
    }

    // Perform form submission actions to the backend:
    await axios
      .post(
        `${BACKEND_URL}/listings/create`,
        {
          user_id: state.user_id,
          title: state.title,
          price: state.price,
          description: state.description,
          shipping_detail: state.shipping_detail,
          sku_number: state.sku_number,
          quantity: state.quantity,
          selectedCategoryIDs,
          photo_url_1: fileURLs[0] || "",
          photo_url_2: fileURLs[1] || "",
          photo_url_3: fileURLs[2] || "",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      .then((res) => {
        // Show success toast message
        toast.success("Listing submitted successfully!");
        console.log("you've submitted listing info!");
        setState({
          user_id: "",
          title: "",
          price: "",
          description: "",
          shipping_detail: "",
          sku_number: "",
          quantity: "",
        });
        setFile1(null);
        setFile2(null);
        setFile3(null);
        setSelectedCategories([]);

        navigate(`/listings`);
      })
      .catch((error) => {
        console.log(error);
        // Show error toast message
        toast.error("Error submitting listings. Please try again.");
      });
  };

  // LOGIC REQUIRED FOR HANDLING CATEGORY SUBMISSIONS:
  // call all the categories first upon page loading:
  useEffect(() => {
    const getAllCategories = async () => {
      const categories = await axios.get(`${BACKEND_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log(getAllCategories);
      setAllCategories(categories.data);
      console.log(categories);
    };
    getAllCategories();
  }, [accessToken]);

  console.log("all categories in local state:", allCategories);
  //
  // categoryOptions for mapping out Category selection inputs to render:
  const categoryOptions = allCategories.map((category) => ({
    value: category.id,
    label: category.name,
  }));
  // handle change for category selection form:
  const handleSelectChange = (categories) => {
    setSelectedCategories(categories);
  };
  console.log("selected categories:", selectedCategories);
  // styling colours for the category selection:
  const selectFieldStyles = {
    option: (provided) => ({
      ...provided,
      color: "black",
    }),
  };
  //
  //

  // LOGIC REQUIRED FOR HANDLING CHANGE OF PHOTO FILES AND FORM INPUTS (NOT INCLUDING CATEGORIES):

  // Handle Change for general field inputs (NOT FOR CATEGORIES INPUT):
  const handleChange = (e) => {
    setState({ ...state, [e.target.id]: e.target.value });
    console.log(state);
  };

  // Handle File Change for each MuiFileInput field (FOR THE IMAGES):
  const handleFileChange1 = (newFile) => {
    setFileErrorText("");
    setFile1(newFile);
    console.log("file1:", file1);
  };

  const handleFileChange2 = (newFile) => {
    setFileErrorText("");
    setFile2(newFile);
    console.log("file2:", file2);
  };

  const handleFileChange3 = (newFile) => {
    setFileErrorText("");
    setFile3(newFile);
    console.log("file3:", file3);
  };

  // IF PAGE IS LOADING.... THIS WILL RENDER:
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

      <Stack alignItems={"center"} justifyContent={"center"} my={5}>
        <>
          <Box m={2} p={2}>
            <Typography
              variant="h2"
              align="center"
              color="textPrimary"
              gutterBottom
            >
              Create A New Listing:
            </Typography>
            <Typography
              variant="h5"
              align="center"
              color="textSecondary"
              gutterBottom
            >
              Type in your product details to create a new listing.
            </Typography>
          </Box>
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
                value={state.title}
                size="small"
                id="title"
                type="title"
                label="Product Title"
                onChange={handleChange}
              ></TextField>
              <TextField
                required
                autoComplete="off"
                value={state.price}
                size="small"
                id="price"
                type="price"
                label="Price"
                onChange={handleChange}
              ></TextField>
              <TextField
                required
                autoComplete="off"
                value={state.description}
                size="small"
                id="description"
                type="description"
                label="Description"
                onChange={handleChange}
              ></TextField>
              <TextField
                required
                autoComplete="off"
                value={state.shipping_detail}
                size="small"
                id="shipping_detail"
                type="shipping_detail"
                label="Shipping Detail"
                onChange={handleChange}
              ></TextField>
              <TextField
                required
                autoComplete="off"
                value={state.sku_number}
                size="small"
                id="sku_number"
                type="sku_number"
                label="SKU"
                onChange={handleChange}
              ></TextField>
              <TextField
                required
                autoComplete="off"
                value={state.quantity}
                size="small"
                id="quantity"
                type="quantity"
                label="Quantity"
                onChange={handleChange}
              ></TextField>
              <DialogTitle id="alert-dialog-title" variant="h6">
                Add up to 3 photos for this listing:
              </DialogTitle>
              <MuiFileInput
                size="small"
                value={file1}
                id="photo_url_1"
                onChange={handleFileChange1}
                placeholder="Click here to choose an image"
                helperText={
                  fileErrorText ? fileErrorText : "Please upload only 1 image."
                }
                error={fileErrorText ? true : false}
              />
              <MuiFileInput
                size="small"
                value={file2}
                id="photo_url_2"
                onChange={handleFileChange2}
                placeholder="Click here to choose an image"
                helperText={
                  fileErrorText ? fileErrorText : "Please upload only 1 image."
                }
                error={fileErrorText ? true : false}
              />
              <MuiFileInput
                size="small"
                value={file3}
                id="photo_url_3"
                onChange={handleFileChange3}
                placeholder="Click here to choose an image"
                helperText={
                  fileErrorText ? fileErrorText : "Please upload only 1 image."
                }
                error={fileErrorText ? true : false}
              />
              <DialogTitle id="alert-dialog-title" variant="h6">
                Pick a Category tag for your listing:
              </DialogTitle>
              <label>
                <Select
                  isMulti
                  styles={selectFieldStyles}
                  options={categoryOptions}
                  value={selectedCategories}
                  onChange={handleSelectChange}
                  placeholder="Categories"
                />
              </label>
              <br />
              <Button type="submit" variant="contained">
                SUBMIT YOUR LISTING
              </Button>
              <ToastContainer />
            </Stack>
          </form>
          <br />
        </>
      </Stack>
    </div>
  );
};
export default CreateListing;
