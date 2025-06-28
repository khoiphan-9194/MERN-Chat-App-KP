import { useEffect, useState } from "react";
// Import the `useParams()` hook from React Router
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
// Import the QUERY_SINGLE_THOUGHT query from our utility file
import { GET_SINGLE_COFFEE_HOUSE } from "../utils/queries";
import { UPDATE_COFFEE_HOUSE } from "../utils/mutations";
import Button from "react-bootstrap/Button";
import axios from "axios";

function EditCoffeehouse() {
  // Use `useParams()` to retrieve value of the route parameter `:thoughtId`
  const { coffeeHouseId } = useParams();

  const [newPostImage, setNewPostImage] = useState(null);
  const { loading, data } = useQuery(GET_SINGLE_COFFEE_HOUSE, {
    // Pass the `thoughtId` URL parameter into query to retrieve this thought's data
    variables: { coffeeHouseId: coffeeHouseId },
  });

  console.log(data);
  const coffeehouse = data?.coffeehouse || {};
  const [updateCoffeeHouse, { error }] = useMutation(UPDATE_COFFEE_HOUSE);
  const [formUpdateCoffeeHouse, setFormUpdateCoffeeHouse] = useState({
    coffeeHouseId: "",
    coffeeName: "",
    address: "",
    bio: "",
    image: "",
  });
  console.log("formUpdateCoffeeHouse", formUpdateCoffeeHouse);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormUpdateCoffeeHouse({
      ...formUpdateCoffeeHouse,
      [name]: value,
    });
  };
  useEffect(() => {
    if (coffeehouse) {
      setFormUpdateCoffeeHouse({
        coffeeHouseId: coffeehouse._id || "",
        coffeeName: coffeehouse.coffeeName || "",
        address: coffeehouse.address || "",
        bio: coffeehouse.bio || "",
        image: coffeehouse.image || "",
      });
    }
  }, [coffeehouse]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewPostImage(file);
    setFormUpdateCoffeeHouse({
      ...formUpdateCoffeeHouse,
      image: file.name,
    });
  };
  const uploadImage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", newPostImage);
    try {
      const response = await axios.post(
        `http://localhost:3001/upload/single`,
        formData
      );
      console.log(response);
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await uploadImage(e); // Ensure the image is uploaded before updating the coffeehouse
      await updateCoffeeHouse({
        variables: {
          coffeeHouseId: coffeeHouseId,
          ...formUpdateCoffeeHouse,
        },
      });
      // Optionally, show a success message or redirect
      alert("Coffeehouse updated!");
      window.location.href = `/coffeehouse/${coffeeHouseId}`; // Redirect to the updated coffeehouse page
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f7cac9 0%, #92a8d1 100%)",
        padding: "40px 0",
        borderRadius: "100px",
        margin: "0 0 70px 0",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "40px auto",
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          padding: "36px 32px",
          fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
        }}
      >
        <h1
          style={{
            fontFamily: "'Montserrat', 'Segoe UI', sans-serif",
            fontWeight: 700,
            fontSize: "2.2rem",
            color: "#4b3832",
            marginBottom: "18px",
          }}
        >
          Edit Coffeehouse
        </h1>
        <h6></h6>
        {loading ? (
          <p style={{ fontSize: "1.1rem", color: "#888" }}>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "18px" }}>
              <label style={{ fontWeight: 600, color: "#855e42" }}>
                CoffeeHouse Name:
              </label>
              <input
                type="text"
                name="coffeeName"
                value={formUpdateCoffeeHouse.coffeeName}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "6px",
                }}
                required
              />
            </div>
            <div style={{ marginBottom: "18px" }}>
              <label style={{ fontWeight: 600, color: "#855e42" }}>
                Address:
              </label>
              <input
                type="text"
                name="address"
                value={formUpdateCoffeeHouse.address}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "6px",
                }}
                required
              />
            </div>
            <div style={{ marginBottom: "18px" }}>
              <label style={{ fontWeight: 600, color: "#855e42" }}>Bio:</label>
              <textarea
                name="bio"
                value={formUpdateCoffeeHouse.bio}
                onChange={handleChange}
                rows={4}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "6px",
                }}
                required
              />
            </div>
            <div style={{ marginBottom: "18px" }}>
              <label style={{ fontWeight: 600, color: "#855e42" }}>
                Image Filename:
              </label>
              <input
                type="text"
                name="image"
                value={formUpdateCoffeeHouse.image}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "6px",
                }}
                required
              />
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
            </div>
            <div style={{ textAlign: "center", margin: "24px 0" }}>
              {newPostImage ? (
                <>
                  <img
                    style={{
                      width: "100%",
                      borderRadius: "1.2rem",
                      boxShadow: "0 2px 16px #6a11cb55",
                      border: "2.5px solid #fbbf24",
                      marginBottom: "0.7rem",
                    }}
                    src={URL.createObjectURL(newPostImage)}
                    alt={newPostImage.name}
                  />
                  <div style={{ marginTop: "12px", color: "#4b3832" }}>
                    New Image Selected: {newPostImage.name}
                  </div>
                </>
              ) : (
                <img
                  src={"/uploads/" + formUpdateCoffeeHouse.image}
                  alt="picture not displayed"
                  style={{
                    width: "450px",
                    height: "350px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    boxShadow: "0 2px 12px rgba(0,0,0,1.8)",
                  }}
                />
              )}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <Button
                variant="primary"
                type="submit"
                style={{ width: "100%", fontWeight: 600 }}
              >
                Save Changes
              </Button>

              <Button
                variant="danger"
                type="button"
                style={{ width: "100%", fontWeight: 600 }}
                onClick={() =>
                  (window.location.href = `/coffeehouse/${coffeeHouseId}`)
                }
              >
                Cancel
              </Button>
            </div>

            {error && (
              <div style={{ color: "red", marginTop: "12px" }}>
                Error updating coffeehouse.
              </div>
            )}
          </form>
        )}
      </div>
    </main>
  );
}

export default EditCoffeehouse;
