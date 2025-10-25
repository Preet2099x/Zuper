import { BlobServiceClient } from "@azure/storage-blob";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!connectionString) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING environment variable is not set");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerName = "vehicle-images";

// Ensure container exists
export const ensureContainerExists = async () => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const exists = await containerClient.exists();
    
    if (!exists) {
      await blobServiceClient.createContainer(containerName, {
        access: "container"
      });
      console.log(`Container "${containerName}" created successfully`);
    }
  } catch (error) {
    console.error("Error ensuring container exists:", error);
    throw error;
  }
};

// Upload image to Azure Blob Storage
export const uploadImageToAzure = async (fileBuffer, fileName, mimetype) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Generate unique blob name with timestamp
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const blobName = `${timestamp}-${randomStr}-${fileName}`;
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Upload the file
    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
      blobHTTPHeaders: {
        blobContentType: mimetype
      }
    });
    
    // Return the public URL
    const imageUrl = `${blockBlobClient.url}`;
    
    console.log(`Image uploaded successfully: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error("Error uploading image to Azure:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

// Delete image from Azure Blob Storage
export const deleteImageFromAzure = async (imageUrl) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Extract blob name from URL
    const urlParts = imageUrl.split("/");
    const blobName = urlParts[urlParts.length - 1];
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Delete the blob
    await blockBlobClient.delete();
    
    console.log(`Image deleted successfully: ${blobName}`);
    return true;
  } catch (error) {
    console.error("Error deleting image from Azure:", error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

// Delete multiple images from Azure Blob Storage
export const deleteMultipleImagesFromAzure = async (imageUrls) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    const deletePromises = imageUrls.map(async (imageUrl) => {
      const urlParts = imageUrl.split("/");
      const blobName = urlParts[urlParts.length - 1];
      
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
    });
    
    await Promise.all(deletePromises);
    
    console.log(`${imageUrls.length} images deleted successfully`);
    return true;
  } catch (error) {
    console.error("Error deleting multiple images from Azure:", error);
    throw new Error(`Failed to delete images: ${error.message}`);
  }
};

export default blobServiceClient;
