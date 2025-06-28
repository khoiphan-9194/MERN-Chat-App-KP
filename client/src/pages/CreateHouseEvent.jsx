import { Navigate, useParams } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import axios from "axios";
import Auth from "../utils/auth";
import { ADD_EVENT } from "../utils/mutations";


const CreateHouseEvent = () => {
  const { coffeeHouseId } = useParams(); //extracting OwnerId from the URL parameters
  console.log("Event", coffeeHouseId);
  const { ownerId } = useParams(); //extracting OwnerId from the URL parameters
  console.log("OwnerId", ownerId);

  const [addEvent, { error }] = useMutation(ADD_EVENT);
  const [formState, setFormState] = useState({
    eventName: "",
    eventDetail: "",
    coffeeEventHouse_Id: coffeeHouseId,
    event_Images: [],
  });
  console.log("formState", formState);
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState({
      ...formState,
      [name]: value,
    });
  };
  const [newPostImages, setNewPostImages] = useState([]);

  const handleImageChange = (event) => {
    const filesArray = Array.from(event.target.files);
    if (filesArray.length === 0) return; // If no files are selected, exit the function

    const imagesToAdd = filesArray.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      file: file,
    }));
    console.log("imagesToAdd", imagesToAdd);
    setNewPostImages((prevImages) => [...prevImages, ...imagesToAdd]);

    // Reset the input value to allow re-uploading the same file
    event.target.value = null;
  };
  
  const removeImage = (index) => {
    setNewPostImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    console.log("newPostImages", newPostImages);
    const formData = new FormData();
    for (const image of newPostImages) {
      formData.append("files", image.file, image.name); // Append each file to the FormData object
      console.log("formData", formData);
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/upload/multiple",
        formData
      );
      console.log("Image upload response:", response.data);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  console.log("newPostImages", newPostImages);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    // console.log("formState", formState);
    // console.log("newPostImages", newPostImages);

    try {
      // Upload images first
      await uploadImages();
      await addEvent({
        variables: {
          eventName: formState.eventName,
          eventDetail: formState.eventDetail,
          coffeeEventHouse_Id: formState.coffeeEventHouse_Id,
          event_Images: newPostImages.map((image) => image.name), // Assuming the server returns an array of image URLs
        },
      });
      // Reset form state after successful submission
      setFormState({
        eventName: "",
        eventDetail: "",
        coffeeEventHouse_Id: coffeeHouseId,
        event_Images: [],
      });
      setNewPostImages([]); // Clear the image previews
      console.log("Event created successfully");
      // Optionally, redirect or show a success message
      window.location.href = `/coffeehouse/${coffeeHouseId}`; // Redirect to the coffee house page
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };
  if (!Auth.loggedIn()) {
    return <Navigate to="/login" />;
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #232931, #393e46)",
        position: "relative",
        backgroundSize: "cover",
        backgroundPosition: "center",
        bottom: "70px",
        padding: "50px",
        margin: "30px auto",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(210, 18, 18, 0.2)",
      }}
    >
      {!Auth.loggedIn() || Auth.getProfile().data._id !== ownerId ? (
        <Navigate to="/" />
      ) : (
        <form
          onSubmit={handleFormSubmit}
          style={{
            background: "rgba(34, 40, 49, 0.95)",
            borderRadius: 18,
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            maxWidth: 600,
            margin: "0 auto",
            padding: "36px 32px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2
            className="mb-4 text-center"
            style={{
              fontWeight: 700,
              letterSpacing: 1,
              color: "#ffb347",
              fontSize: 32,
              textShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            Create House Event
          </h2>
          <div className="mb-3">
            <label
              htmlFor="eventName"
              className="form-label"
              style={{
                fontWeight: 600,
                color: "#ffb347",
                fontSize: 18,
                letterSpacing: 0.5,
              }}
            >
              Event Name
            </label>
            <input
              type="text"
              className="form-control"
              id="eventName"
              name="eventName"
              value={formState.eventName}
              onChange={handleChange}
              style={{
                background: "#232931",
                color: "#f5f5f5",
                border: "1.5px solid #393e46",
                borderRadius: 8,
                fontSize: 16,
                padding: "10px 14px",
                marginTop: 4,
              }}
              placeholder="Enter event name"
              autoComplete="off"
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="eventDetail"
              className="form-label"
              style={{
                fontWeight: 600,
                color: "#ffb347",
                fontSize: 18,
                letterSpacing: 0.5,
              }}
            >
              Event Detail
            </label>
            <textarea
              className="form-control"
              id="eventDetail"
              name="eventDetail"
              rows="3"
              value={formState.eventDetail}
              onChange={handleChange}
              style={{
                background: "#232931",
                color: "#f5f5f5",
                border: "1.5px solid #393e46",
                borderRadius: 8,
                fontSize: 16,
                padding: "10px 14px",
                marginTop: 4,
                resize: "vertical",
              }}
              placeholder="Describe your event"
            ></textarea>
          </div>
          <div className="mb-3">
            <label
              htmlFor="eventImages"
              className="form-label"
              style={{
                color: "#ffb347",
                fontWeight: 600,
                fontSize: 18,
                letterSpacing: 0.5,
              }}
            >
              Upload Event Images
            </label>
            <input
              id="eventImages"
              type="file"
              className="form-control"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{
                background: "#232931",
                color: "#f5f5f5",
                border: "1.5px solid #393e46",
                borderRadius: 8,
                fontSize: 16,
                padding: "10px 14px",
                marginTop: 4,
              }}
            />
          </div>
          {newPostImages.length > 0 && (
            <div className="image-preview d-flex flex-wrap gap-3 mb-3">
              {newPostImages.map((image, index) => (
                <div
                  key={index}
                  className="position-relative d-flex align-items-center mb-2"
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 2px 12px 0 rgba(255,179,71,0.8)",
                    background: "#393e46",
                    marginRight: 15,
                  }}
                >
                  <img
                    src={image.url}
                    alt={`Preview ${index}`}
                    className="img-thumbnail"
                    style={{
                      width: 200,
                      height: 170,
                      objectFit: "cover",
                      border: "none",
                      borderRadius: 12,
                      marginRight: 0,
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-light btn-sm position-absolute"
                    style={{
                      top: 8,
                      right: 8,
                      zIndex: 2,
                      border: "none",
                      background: "rgba(0,0,0,0.6)",
                      borderRadius: "50%",
                      padding: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() => removeImage(index)}
                    aria-label="Remove"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="#ff4e50"
                      viewBox="0 0 16 16"
                    >
                      <path d="M2.146 2.146a.5.5 0 0 1 .708 0L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854a.5.5 0 0 1 0-.708z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="submit"
            className="btn"
            style={{
              background: "linear-gradient(90deg, #ffb347 0%, #ff4e50 100%)",
              color: "#232931",
              fontWeight: 700,
              fontSize: 18,
              border: "none",
              borderRadius: 8,
              padding: "12px 0",
              width: "100%",
              marginTop: 18,
              boxShadow: "0 2px 8px 0 rgba(255,179,71,0.13)",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            Submit Event
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateHouseEvent;

/*
  const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("Image upload response:", response.data);
      return response.data.imageUrls; // Assuming the server returns an array of image URLs
*/

/*

  // const uploadImages = async (event) => {
  //   event.preventDefault();
  //   console.log("newPostImages", newPostImages);
  //  // tiep tuc o day
  //   const formData = new FormData();
  //   for (const image of newPostImages) {
  //     const response = await fetch(image);
  //     const blob = await response.blob(); // Convert the image URL to a Blob

      
  //     formData.append('files', blob, image.split('/').pop()); // Append each image Blob to the FormData object
  //   }

  //   await axios.post('http://localhost:3001/upload/multiple', formData)
  //   .then((response) => {
  //     console.log("Image upload response:", response)
  //   })
  //   .catch((error) => {
  //     console.error("Error uploading images:", error);
  //   });
     
  // };  

*/
//why we need to use blob to upload images?
// Blob is used to represent binary data in JavaScript. what blob does is it allows us to handle binary data, such as images, 
// in a way that can be easily manipulated and sent over the network.

// When uploading images, we often need to convert the image URL to a Blob or binary format
//  before appending it to a FormData object. This is because FormData expects the data to be in a specific format that can be sent as part of an HTTP request.
// By converting the image to a Blob, we ensure that the image data is correctly formatted in form of binary data, binary data is like this:
// 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A ... and so on, which is the binary representation of the image file 

// In this code, we use the Blob constructor to create a Blob object from the image URL.


