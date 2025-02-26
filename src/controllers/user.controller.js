import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"


const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
  }
}

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
  console.log(req.files)

  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "ALL fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(409, "User with email and username is existed already")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar image is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);


  if (!avatar) {
    throw new ApiError(400, "avatar image is required")
  }

  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || ""
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while register the user..")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )
});



const loginUser = asyncHandler(async (req, res) => {
  // req.body sa data la ga 
  // username or email verify karay ga
  //find the user
  //check the password
  //access and refresh token
  //send cookie

  const { email, username, password } = req.body

  if (!email || !username) {
    throw new ApiError(400, "username or password is required")
  }

  const user = await User.findOne({
    $or: [{ username, email }]
  });


  if (!user) {
    throw new ApiError(404, "user does not exists")
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

});


const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

const loggedInUser = await User.findById(user._id).select("-passwoed -refreshToken")

const options = {
  httpOnly: true,
  secure: true
}

return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "User loggedIn Successfully"
    )
  );

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User Logged Out"))
})


export {
  registerUser,
  loginUser,
  logOutUser
};
