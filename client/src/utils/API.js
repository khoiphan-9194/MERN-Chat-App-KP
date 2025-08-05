// this file is used to handle avatar uploads
// and export the uploadAvatar function for use in other parts of the application

// axios allows the frontend to make HTTP requests to the backend
// without having to use the fetch API directly
import axios from "axios";
import Auth from "./auth"; // Import the Auth utility for token management

// the function is asynchronous, meaning it will return a promise
// and it will handle the file upload to the server
export const uploadAvatar = async (file) => {
  try {
    // Make a POST request to the server to upload the file
    const res = await axios.post(`/api/upload/single`, file, {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`, // means that the token is included in the request headers for authentication
        // This is necessary to authenticate the user before allowing the file upload, and prevent unauthorized access

        "Content-Type": "multipart/form-data", //content type for file uploads,
        // this tells the server that the request body contains form data, which is necessary for file uploads
      },
    });
    console.log("File uploaded successfully:", res.data);
  } catch (err) {
    console.error("Error uploading file:", err);
  }
};
