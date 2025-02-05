import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js"

const registerUser = asyncHandler(async (req, res) => {
  // steps to make the backend code for registration of user in Frontend
  //get user information from the frontend
  // Validation for backend not user get any empty box like email or passsword - not empty
  //check if user already exists: username, email
  //check for images and avatar
  //upload them to cloudinary, avatar
  //create user object - create entry in db
  //remove password and refresh tokenfield from response
  //check for user crreation
  //return response

  const { fullName, email, password, username } = req.body;
  console.log("email :", email);

  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "ALL fields are required");
  }
});

export {
  registerUser
};
