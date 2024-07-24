import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, fullName, password } = req.body;

  if (
    [email, username, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  const userExists = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExists) {
    throw new ApiError(409, "User with the username or email already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file required");
  }

  const avatar = await uploadCloudinary(avatarLocalPath);
  let coverImage;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
    coverImage = await uploadCloudinary(coverImageLocalPath);
  }
  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password: password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong whle registering user");
  }

  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;


  console.log("Email: ", email);
  console.log("Username: ", username);
  console.log("Password: ", password);


  if (!(email || username)) {
    throw new ApiError(400, "Email or Username Required!");
  }

  let user = await User.findOne({ $or: [{ username }, { email }] });
  console.log("User : ", user);

  // return res.status(200).json(user);
  if (!user) {
    throw new ApiError(404, "User not found");
  }


  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "User does not exist");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user
  );

  const options = {
    httpOnly: true,
    secure: true,
  };


  const userData = await User.findOne(user._id).select("-password -refreshToken");

  console.log("User Data Faizan : ", userData);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: userData, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,

    {
      $set: {
        refreshToken: undefined,
      },
    },

    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged out"))

});

const refreshAccessToken = asyncHandler(async (req, res) => {

  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request")
  }

 try {
   const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
 
   const user = await User.findById(decodedToken?._id);
 
   if (!user) {
     throw new ApiError(401, "Invalid refresh token")
   }
 
   if (incomingRefreshToken !== user?.refreshToken) {
     throw new ApiError(401, "Refresh token is expired")
   }
 
   const userData = await User.findOne(user._id).select("-password -refreshToken")
 
   const options = {
     httpOnly: true,
     secure: true,
   };
 
   const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
     user
   );
   return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", refreshToken, options)
     .json(
       new ApiResponse(
         200,
         { user: userData, accessToken,refreshToken: refreshToken },
         "Access token refreshed"
       )
     );
 } catch (error) {
  throw new ApiError(401, error?.message || "Invalid refresh token")
}

})

const changeCurrentPassword = asyncHandler(async (req, res) => {

  const {oldPassword, newPassword} = req.body;

  const user = await User.findById(req.user?._id)

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Incorrect old password")
  }

  user.password =  newPassword;
  await user.save({validateBeforeSave: true});

  res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))

})

export { registerUser, loginUser, logoutUser, refreshAccessToken };
