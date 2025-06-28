import { Navigate, useParams } from "react-router-dom";
import { ADD_COFFEE_HOUSE } from "../utils/mutations";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import axios from "axios";
import Auth from "../utils/auth";


const CreateCoffeeHouse = () => {
  const { ownerId } = useParams(); //extracting OwnerId from the URL parameters
  console.log("OwnerId", ownerId);
  const [newPostImage, setNewPostImage] = useState(null);
  const [newPostImageName, setNewPostImageName] = useState("");
  const [addCoffeeHouse, { error }] = useMutation(ADD_COFFEE_HOUSE);
  const [formState, setFormState] = useState({
    coffeeName: "",
    address: "",
    bio: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (!file) return;
    setNewPostImage(file);
    setNewPostImageName(file.name);
    console.log(file.name);

    console.log(newPostImage);
    console.log(newPostImageName);
  };

  const uploadImage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", newPostImage);
    console.log(formData);
    axios
      .post(`http://localhost:3001/upload/single`, formData)

      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log(newPostImage);

    try {
      await uploadImage(event);
      const { data } = await addCoffeeHouse({
        variables: {
          coffeeName: formState.coffeeName,
          address: formState.address,
          bio: formState.bio,
          image: newPostImageName, // Use the image name from the state
        },
      });
      console.log("Coffee House created successfully:", data);
      setFormState({
        coffeeName: "",
        address: "",
        bio: "",
      });
      setNewPostImage(null);
      setNewPostImageName("");
      document.location.href = "/" + `me/${ownerId}`; // Redirect to the owner's profile page after creating the coffee house
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        background: "linear-gradient(135deg, #232526 30%, #373B44 40%, #6a11cb 80%,rgb(159, 189, 78) 100%)",
        color: "#fff",
        borderRadius: "5.5rem",
  
        boxShadow: "0 12px 40px 0 rgba(106,17,203,6.25)",
        padding: "3rem",
        margin: "0 0 4rem 0",
        letterSpacing: "1px",
  
        lineHeight: "1.6",
       
      }}
    >
      <div
        className="shadow-lg p-5"
        style={{
          maxWidth: "800px",
          width: "100%",
          background: "rgba(34, 34, 40, 0.98)",
          borderRadius: "3.5rem",
          boxShadow: "0 12px 40px 0 rgba(106,17,203,0.25)",
          border: "2.5px solid #6a11cb",
          color: "#fff",
        }}
      >
        {!Auth.loggedIn() || Auth.getProfile().data._id !== ownerId ? (
          (alert(
            "You are not authorized to create a coffee house. Please log in with the correct account."
          ),
          (<Navigate to="/Login" />))
        ) : (
          <>
            <div className="text-center mb-5">
              <h3
                style={{
                  color: "#fbbf24",
                  fontFamily: "Poppins, Montserrat, sans-serif",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textShadow: "0 2px 16px #6a11cb77",
                  fontSize: "2.5rem",
                }}
              >
                New Coffee House
              </h3>
              <p style={{ color: "#e0e7ef", fontSize: "1.5rem" }}>
                Hi,{" "}
                <span style={{ color: "#38bdf8", fontWeight: 600 }}>
                  {Auth.getProfile().data.userName}
                </span>
                !
              </p>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-5">
                <input
                  type="text"
                  name="coffeeName"
                  value={formState.coffeeName}
                  onChange={handleChange}
                  placeholder="Coffee house name"
                  required
                  className="form-control"
                  style={{
                    background: "#23272f",
                    border: "2px solid #fbbf24",
                    color: "#fff",
                    borderRadius: "1.5rem",
                    fontSize: "1.35rem",
                    padding: "1.3rem",
                    '::placeholder': { color: '#fff700', opacity: 1 },
                  }}
                  // For bright placeholder
                  autoComplete="off"
                />
              </div>
              <div className="mb-5">
                <input
                  type="text"
                  name="address"
                  value={formState.address}
                  onChange={handleChange}
                  placeholder="Address"
                  required
                  className="form-control"
                  style={{
                    background: "#23272f",
                    border: "2px solid #38bdf8",
                    color: "#fff",
                    borderRadius: "1.5rem",
                    fontSize: "1.35rem",
                    padding: "1.3rem",
                    '::placeholder': { color: '#fff700', opacity: 1 },
                  }}
                  autoComplete="off"
                />
              </div>
              <div className="mb-5">
                <textarea
                  rows="4"
                  name="bio"
                  value={formState.bio}
                  onChange={handleChange}
                  placeholder="Share your story..."
                  required
                  className="form-control"
                  style={{
                    background: "#23272f",
                    border: "2px solid #fbbf24",
                    color: "#fff",
                    borderRadius: "1.5rem",
                    fontSize: "1.35rem",
                    padding: "1.3rem",
                    '::placeholder': { color: '#fff700', opacity: 1 },
                  }}
                ></textarea>
              </div>
              <div className="mb-5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-control"
                  style={{
                    background: "#23272f",
                    border: "2px solid #a78bfa",
                    color: "#fff",
                    borderRadius: "1.5rem",
                    fontSize: "1.15rem",
                    padding: "1rem",
                  }}
                />
                {newPostImageName && (
                  <div className="text-center mt-4">
                    <img
                      style={{
                        width: "85%",
                        borderRadius: "1.2rem",
                        boxShadow: "0 2px 16px #6a11cb55",
                        border: "2.5px solid #fbbf24",
                        marginBottom: "0.7rem",
                      }}
                      src={URL.createObjectURL(newPostImage)}
                      alt={newPostImageName}
                    />
                    <div style={{ color: "#e0e7ef", fontSize: "1.05rem" }}>{newPostImageName}</div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="btn w-100"
                style={{
                  background: "linear-gradient(90deg, #fbbf24 0%, #6a11cb 100%)",
                  color: "#23272f",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "1.5rem",
                  fontSize: "1.35rem",
                  boxShadow: "0 2px 12px #6a11cb44",
                  letterSpacing: "1px",
                  padding: "1.2rem",
                }}
              >
                <i className="bi bi-cup-hot me-1"></i>
                Create
              </button>
            </form>
            
          </>
          
        )}
        {error && (
          <div className="my-3 p-3 bg-danger text-white rounded-3 text-center small">{error.message}</div>
        )}
      </div>
      <style>
        {`
          input::placeholder, textarea::placeholder {
            color:rgb(178, 194, 41) !important;
            opacity: 1 !important;
          }
        `}
      </style>
    
    </div>
  );
};

export default CreateCoffeeHouse;
