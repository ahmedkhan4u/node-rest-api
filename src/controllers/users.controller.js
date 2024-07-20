import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from '../models/user.model.js'
import { uploadCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {

  const { email, username, fullName, password } = req.body;

  if (
    [email, username, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  const userExists = await User.findOne({
    $or: [{username}, {email}]
  })

  if (userExists) {
    throw new ApiError(409,"User with the username or email already exists")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar file required")
  }



  const avatar = await uploadCloudinary(avatarLocalPath);
  let coverImage;
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
    coverImage = await uploadCloudinary(coverImageLocalPath);

  }
  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", 
    password: password
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong whle registering user")
  }

  res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )



//   console.log(avatarLocalPath);

  
  // res.status(201).json({email: email})
});

export { registerUser };
