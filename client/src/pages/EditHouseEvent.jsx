import { useEffect, useState } from "react";
// Import the `useParams()` hook from React Router
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { UPDATE_EVENT } from "../utils/mutations";
import Button from "react-bootstrap/Button";
import axios from "axios";
import { QUERY_SINGLE_EVENT } from "../utils/queries";

function EditHouseEvent() {
  // Use `useParams()` to retrieve value of the route parameter `:thoughtId`
  const { eventId } = useParams();
  console.log(eventId);
  const { loading, data } = useQuery(QUERY_SINGLE_EVENT, {
    // Pass the `eventId` URL parameter into query to retrieve this event's data
    variables: { eventId: eventId },
  });
  const event = data?.event || {};
  console.log(event);

  const [eventUpdateForm, setEventUpdateForm] = useState({
    eventName: "",
    date: "",
    eventDetail: "",
    eventImage: [],
    donationAmount: "",
  });

  const [updateEvent] = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      // Optionally, you can redirect or show a success message here
      console.log("Event updated successfully");
    },
    onError: (error) => {
      console.error("Error updating event:", error);
    },
  });

  useEffect(() => {
    if (event) {
      setEventUpdateForm({
        eventName: event.eventName || "",
        date: event.date || "",
        eventDetail: event.eventDetail || "",
        eventImage: event.event_Images || [],
        donationAmount: event.donations?.[0]?.donationAmount || "",
      });
    }
  }, [event]);

  console.log("eventUpdateForm", eventUpdateForm);

  const handleImageChange = (event) => {
    const images_Array = Array.from(event.target.files);
    if (images_Array.length === 0) return;
    const updatedImages = images_Array.map((file) => {
      return {
        file: file,
        url: URL.createObjectURL(file),
        name: file.name,
      };
    });

    const noDuplicateImages = updatedImages.filter(
      (newImage) =>
        !eventUpdateForm.eventImage.some(
          (existingImage) => existingImage.name === newImage.name
        )
    ); // Filter out images that already exist in the state
    // some method checks if any existing image has the same name as the new image

    console.log("noDuplicateImages", noDuplicateImages);

    setEventUpdateForm({
      ...eventUpdateForm,
      eventImage: [...eventUpdateForm.eventImage, ...noDuplicateImages],
    });
    console.log("Updated eventImage state:", eventUpdateForm.eventImage);
    // Update the state with the new images
  };
  const uploadImages = async () => {
    console.log("Uploading images:", eventUpdateForm.eventImage);
    // const uploadedImageObjects = eventUpdateForm.eventImage
    //   .filter((image) => typeof image !== "string")
    //   .map((image) => {
    //     return { file: image.file, url: image.url, name: image.name }; // Handle new images
    //   });
    // console.log("Processed images for upload:", uploadedImageObjects);
    const formData = new FormData();
    eventUpdateForm.eventImage.forEach((image) => {
      if (image.file) {
        // make sure "files" matches the name used in the server-side multer setup
        formData.append("files", image.file, image.name);
        console.log("Image added to formData:", formData.get("eventImage"));
      } else {
        console.log("Image not added to formData:", image);
      }
    });
    try {
      if (eventUpdateForm.eventImage.length === 0) return;
      const response = await axios.post(
        "http://localhost:3001/upload/multiple",
        formData
      );
      console.log("Images uploaded successfully:", response.data);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setEventUpdateForm({
      ...eventUpdateForm,
      [name]: value,
    });
  };

  const removeImage = (image_index) => {
    const updatedImages = eventUpdateForm.eventImage.filter(
      (_, index) => index !== image_index
    );
    setEventUpdateForm({
      ...eventUpdateForm,
      eventImage: updatedImages,
    });
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();
    console.log("Submitting form with data:", eventUpdateForm);
    try {
      await uploadImages();
      await updateEvent({
        variables: {
          eventId: eventId,
          eventName: eventUpdateForm.eventName,
          eventDetail: eventUpdateForm.eventDetail,
          event_Images: eventUpdateForm.eventImage.map((image) => {
            return image.file ? image.file.name : image;
          }),
        },
      });
      console.log("Event updated successfully");
      // Optionally, you can redirect or show a success message here
      //redirect to the event details page or show a success message
      window.location.href = `/event/${eventId}`;
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  return (
    <main
      style={{ background: "#232931", minHeight: "100vh", padding: "40px 0" }}
    >
      {loading ? (
        <div style={{ color: "#f5f5f5" }}>Loading...</div>
      ) : (
        <form
          style={{
            background: "#393e46",
            borderRadius: 16,
            padding: 32,
            maxWidth: 600,
            margin: "0 auto",
            boxShadow: "0 4px 24px 0 rgba(255,179,71,0.15)",
          }}
          onSubmit={handleSubmitForm}
        >
          <h1
            style={{
              color: "#ffb347",
              fontWeight: 700,
              letterSpacing: 1,
              marginBottom: 32,
            }}
          >
            Edit Event
          </h1>
          <div className="form-group mb-4">
            <label
              htmlFor="eventName"
              style={{
                color: "#ffb347",
                fontWeight: 600,
                fontSize: 18,
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Event Name
            </label>
            <input
              type="text"
              className="form-control"
              id="eventName"
              name="eventName"
              value={eventUpdateForm.eventName}
              placeholder="Enter event name"
              onChange={handleChange}
              style={{
                background: "#232931",
                color: "#f5f5f5",
                border: "1.5px solid #ffb347",
                borderRadius: 8,
                fontSize: 16,
                padding: "10px 14px",
                marginTop: 4,
              }}
            />
          </div>

          <div className="form-group mb-4">
            <label
              htmlFor="description"
              style={{
                color: "#ffb347",
                fontWeight: 600,
                fontSize: 18,
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Description
            </label>
            <textarea
              className="form-control"
              id="description"
              name="eventDetail"
              placeholder="Enter event details"
              rows="3"
              value={eventUpdateForm.eventDetail}
              onChange={handleChange}
              style={{
                background: "#232931",
                color: "#f5f5f5",
                border: "1.5px solid #ffb347",
                borderRadius: 8,
                fontSize: 16,
                padding: "10px 14px",
                marginTop: 4,
              }}
            ></textarea>
          </div>

          <div className="mb-4">
            <label
              htmlFor="eventImages"
              className="form-label"
              style={{
                color: "#ffb347",
                fontWeight: 600,
                fontSize: 18,
                letterSpacing: 0.5,
                marginBottom: 8,
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
              name="eventImage"
              onChange={handleImageChange}
              style={{
                background: "#232931",
                color: "#f5f5f5",
                border: "1.5px solid #ffb347",
                borderRadius: 8,
                fontSize: 16,
                padding: "10px 14px",
                marginTop: 4,
              }}
            />
          </div>
          {eventUpdateForm.eventImage.length > 0 && (
            <div className="image-preview d-flex flex-wrap gap-3 mb-4">
              {eventUpdateForm.eventImage.map((image, index) => (
                <div
                  key={index}
                  className="position-relative d-flex align-items-center mb-2"
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 2px 12px 0 rgba(255,179,71,0.8)",
                    background: "#232931",
                    marginRight: 15,
                  }}
                >
                  <img
                    src={image.url ? image.url : `/coffee/${image}`}
                    alt={`Event Image ${index + 1}`}
                    className="img-thumbnail"
                    style={{
                      width: 200,
                      height: 200,
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

          <Button
            type="submit"
            variant="primary"
            style={{
              background: "#ffb347",
              color: "#232931",
              fontWeight: 700,
              fontSize: 18,
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              letterSpacing: 1,
              marginTop: 12,
              boxShadow: "0 2px 8px 0 rgba(255,179,71,0.25)",
            }}
          >
            Save Changes
          </Button>

          <Button
            type="button"
            variant="secondary"
            style={{
              background: "#393e46",
              color: "#ffb347",
              fontWeight: 700,
              fontSize: 18,
              border: "1.5px solid #ffb347",
              borderRadius: 8,
              padding: "10px 28px",
              letterSpacing: 1,
              marginTop: 12,
              marginLeft: 16,
              boxShadow: "0 2px 8px 0 rgba(255,179,71,0.15)",
            }}
            onClick={() => (window.location.href = `/event/${eventId}`)}
          >
            Cancel
          </Button>
        </form>
      )}
    </main>
  );
}

export default EditHouseEvent;

/*
        <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              className="form-control"
              id="date"
              name="date"
              defaultValue={event.date}
            />
          </div>
*/
