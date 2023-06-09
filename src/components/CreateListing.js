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
import { database, storage } from "../firebase";
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

/* import Typography from '@mui/joy/Typography'; */
/* import Card from "@mui/joy/Card"; */
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
import { toast } from "react-toastify";
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
  const [openModal, setOpenModal] = useState(false);
  const [file, setFile] = useState([]);
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
    photo_url_1: "",
    photo_url_2: "",
    photo_url_3: "",
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
  }, [user?.email, accessToken, isAuthenticated]);

  console.log("state.user_id:", state.user_id);

  // LOGIC FOR SUBMIT BUTTON:
  const handleSubmit = (e) => {
    e.preventDefault();

    // Extract category IDs to send to backend
    const selectedCategoryIDs = selectedCategories.map(({ value }) => value);
    console.log(selectedCategoryIDs);

    // FIREBASE LOGIC GOES HERE: (need to call the FIREBASE URL up and store it here first before pushing it into backend)

    // Perform form submission actions to the backend:
    axios
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
          photo_url_1: state.photo_url_1,
          photo_url_2: state.photo_url_2,
          photo_url_3: state.photo_url_3,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((res) => {
        setState({
          user_id: "",
          title: "",
          price: "",
          description: "",
          shipping_detail: "",
          sku_number: "",
          quantity: "",
          photo_url_1: "",
          photo_url_2: "",
          photo_url_3: "",
        });
        setSelectedCategories([]);

        navigate(`/listings`);
      })
      .catch((error) => {
        console.log(error);
      });
    console.log({
      user_id: state.user_id,
      title: state.title,
      price: state.price,
      description: state.description,
      shipping_detail: state.shipping_detail,
      sku_number: state.sku_number,
      quantity: state.quantity,
      selectedCategoryIDs,
      photo_url_1: state.photo_url_1,
      photo_url_2: state.photo_url_2,
      photo_url_3: state.photo_url_3,
    });
    return console.log("you've submitted user info!");
  };

  // Handle Change for general field inputs (NOT FOR CATEGORIES INPUT):
  const handleChange = (e) => {
    setState({ ...state, [e.target.id]: e.target.value });
    console.log(state);
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
  }, []);

  console.log("all categories in local state:", allCategories);
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

  // LOGIC REQUIRED FOR SUBMISSION OF PHOTOS:

  const uploadFile = async (files, postKey) => {
    if (files == null) return 0;

    let images = {};

    await Promise.all(
      files.map(async (image, index) => {
        const imageRef = sRef(
          storage,
          `images/${postKey}/${crypto.randomUUID() + image.name}`
        );
        await uploadBytesResumable(imageRef, image);
        let imageURL = await getDownloadURL(imageRef);
        images[crypto.randomUUID()] = imageURL;
      })
    );
    console.log(images);
    return images;
  };

  const handleFileChange = (newFile) => {
    setFileErrorText("");
    setFile(newFile);
    console.log(file);
  };

  const handleImageSubmit = async () => {
    console.log(file);

    // const imagesRef = dbRef(database, `posts/images`);
    // const images = await uploadFile(file, selectedPost.key);
    // let updates = { ...selectedPost.images, ...images };
    // console.log(updates);

    // await toast.promise(update(imagesRef, updates), {
    //   pending: `Uploading photos 🤩`,
    //   success: "Successfully uploaded photos! 👌",
    //   error: "An error occurred... 🤯",
    // });

    setFile([]);
  };

  //
  //
  //

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
      <Stack alignItems={"center"} justifyContent={"center"} my={5}>
        <NavBar />
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

              <TextField
                required
                autoComplete="off"
                value={state.photo_url_1}
                size="small"
                id="photo_url_1"
                type="photo_url_1"
                label="upload an image (jpg) here"
                onChange={handleChange}
              ></TextField>
              <TextField
                required
                autoComplete="off"
                value={state.photo_url_2}
                size="small"
                id="photo_url_2"
                type="photo_url_2"
                label="upload an image (jpg) here"
                onChange={handleChange}
              ></TextField>
              <TextField
                required
                autoComplete="off"
                value={state.photo_url_3}
                size="small"
                id="photo_url_3"
                type="photo_url_3"
                label="upload an image (jpg) here"
                onChange={handleChange}
              ></TextField>
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
              <Button type="submit" variant="contained">
                SUBMIT YOUR LISTING
              </Button>
            </Stack>
          </form>
          <br />
        </>
        <Dialog open={openModal} onClose={() => setOpenModal(false)}>
          <DialogTitle id="alert-dialog-title">Add new photos</DialogTitle>
          <DialogContent>
            <MuiFileInput
              size="small"
              value={file}
              onChange={handleFileChange}
              placeholder="Click here to choose images"
              multiple
              helperText={
                fileErrorText
                  ? fileErrorText
                  : "You can choose to upload multiple images!"
              }
              error={fileErrorText ? true : false}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleImageSubmit}>Confirm</Button>
            <Button onClick={() => setOpenModal(false)} autoFocus>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </div>
  );
};
export default CreateListing;
