// import { v2 as cloudinary } from "cloudinary";
// import {fs} from "fs";


// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });



// const uploadoncloudinary = async (localfilepath) =>{
//     try {
//         if(!localfilepath) return null
//         const response = await cloudinary.v2.uploader.upload(localfilepath, {
//             resource_type: "auto"
//         })

//         console.log("file is uploaded", response.url);
//         return response;

//     } catch (error) {
//         fs.unlinkSync(localfilepath) //remove the locally saved temporary file as the upload operation got failed 
//         return null;
//     }
// }


// export {uploadoncloudinary}





import dotenv from 'dotenv';
import { v2 as cloudinary } from "cloudinary";
import { promises as fs } from 'fs'
import path from 'path';

// Load environment variables
dotenv.config();

// Check if cloudinary environment variables are set
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary credentials. Please check your .env file.');
  console.error(`CLOUDINARY_CLOUD_NAME: ${cloudName ? 'Set' : 'Missing'}`);
  console.error(`CLOUDINARY_API_KEY: ${apiKey ? 'Set' : 'Missing'}`);
  console.error(`CLOUDINARY_API_SECRET: ${apiSecret ? 'Set' : 'Missing'}`);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

const uploadImage = async (file) => {
  try {
    console.log("UploadImage input:", file);
    // Verify Cloudinary credentials again at runtime
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Missing Cloudinary cloud_name. Check your .env file.');
    }
    
    if (!file) {
      throw new Error('No file provided');
    }
    
    if (!file.path) {
      throw new Error('Invalid file object: missing path');
    }

    // Ensure file exists
    try {
      await fs.access(file.path);
      console.log("File exists at path:", file.path);
    } catch (err) {
      throw new Error(`File doesn't exist at path: ${file.path}`);
    }
    
    // Make sure the cloudinary configuration is set
    if (!cloudinary.config().cloud_name) {
      throw new Error('Cloudinary configuration missing. Check your .env file.');
    }
    
    console.log('Uploading file to Cloudinary:', path.basename(file.path));
    console.log('Using cloud name:', cloudinary.config().cloud_name);
    
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'image',
      transformation: [{ width: 600, height: 600, crop: 'limit' }],
    });
    
    // Clean up the temporary file
    await fs.unlink(file.path).catch(err => {
      console.error('Failed to delete temp file:', err);
    });
    
    console.log('Cloudinary upload successful. URL:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Try to clean up the file even if upload fails
    if (file && file.path) {
      try {
        await fs.unlink(file.path);
        console.log('Cleaned up temp file after failed upload');
      } catch (unlinkError) {
        console.error('Failed to delete temp file:', unlinkError);
      }
    }
    
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

const deleteImage = async (publicId) => {
  try {
    if (!publicId) return null;
    
    // Verify Cloudinary credentials
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Missing Cloudinary cloud_name. Check your .env file.');
    }
    
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

export {deleteImage, uploadImage }