import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
import fs from 'fs';

// Set up cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadCloudinary = async function(localFilePath) {

    try {
        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: 'auto'
            }
        )
        console.log("File is uploaded on cloudinary : ", response.url);
        fs.unlinkSync(localFilePath) // Remove the locally saved temporary
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath) // Remove the locally saved temporary
        // file as the upload operation got killed
        return null;
    }

}

const deleteImageOnCloudinary = async (imagePath) => {
    try {
      const response = await cloudinary.uploader.destroy(imagePath, {
        resource_type: "image",
        invalidate: true,
        type: "authenticated",
      });
  
      return response;
    } catch (error) {
      return null;
    }
  };
  

export {uploadCloudinary, deleteImageOnCloudinary}