import { useParams } from "react-router-dom";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { QUERY_SINGLE_USER } from "../utils/queries";
import { UPDATE_USER_PROFILE } from "../utils/mutations";
import { VERIFY_CURRENT_PASSWORD } from "../utils/mutations";
import { useMutation } from "@apollo/client";
import { useState, useEffect } from "react";
import Auth from "../utils/auth";
import { useAuthUserInfo } from "../utils/AuthUser_Info_Context";

import { uploadAvatar } from "../utils/API"; // Import the uploadAvatar function

const ProfileSetting = () => {
  const [isClicked, setIsClicked] = useState(false);
  const [activeForm, setActiveForm] = useState(null); // is used to display the form based on the button clicked
  const [currentPassword, setCurrentPassword] = useState("");
  const [currentPasswordVerified, setCurrentPasswordVerified] = useState(false);
  const [newPostImage, setNewPostImage] = useState(null);
  const [newPassword, setNewPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [isPasswordMatch, setIsPasswordMatch] = useState(false);
  const { authUserInfo } = useAuthUserInfo();
  const { userId } = useParams();
  const [formUpdateUser, setFormUpdateUser] = useState({
    username: "",
    user_email: "",
    profile_picture: `..${authUserInfo.user?.profile_picture}`,
  }); // Initialize with current profile picture

  // useEffect here is used to check if the newPassword and confirmPassword match
  // when the activeForm is set to "password"
  // it returns true if they match, false otherwise
  // because we want to ensure that the user enters the same password twice when updating their password
  useEffect(() => {
    if (activeForm === "password") {
      if (newPassword && confirmPassword) {
        setIsPasswordMatch(newPassword === confirmPassword);
      } else {
        setIsPasswordMatch(false);
      }
    }
  }, [newPassword, confirmPassword, activeForm]);

  // Mutation to verify the current password
  // This mutation will be called when the user clicks outside the current password input field
  // It will check if the current password is correct before allowing the user to update their profile
  // If the password is correct, it will set the currentPasswordVerified state to true
  // If the password is incorrect, it will alert the user and keep the currentPasswordVerified
  const [verifyCurrentUserPassword] = useMutation(VERIFY_CURRENT_PASSWORD, {
    onCompleted: (data) => {
      if (data.verifyCurrentUserPassword) {
        setCurrentPasswordVerified(true);
        console.log("Current password verified successfully.");
      } else {
        console.error("Incorrect current password.");
      }
    },
    onError: (error) => {
      console.error("Error verifying current password:", error);
    },
  });

  // Mutation to update the user profile
  // This mutation will be called when the user clicks the update button in the form
  // It will update the user profile with the new values entered in the form
  // It will also refetch the user data to reflect the changes
  // If the update is successful, it will alert the user and reset the form states
  const [updateUser] = useMutation(UPDATE_USER_PROFILE, {
    refetchQueries: [
      {
        query: QUERY_SINGLE_USER,
        variables: { userId: userId },
      },
    ],
  });

  // Function to handle the button click to toggle the form visibility
  // It sets the isClicked state to true to show the form
  const handleButtonClick = () => {
    return setIsClicked((prev) => !prev); // Toggle the isClicked state to show/hide the form
  };

  // Function to verify the current password
  // This function is called when the user clicks outside the current password input field
  // It will call the verifyCurrentUserPassword mutation with the userId and currentPassword
  // If the password is correct, it will set the currentPasswordVerified state to true
  // If the password is incorrect, it will alert the user and keep the currentPasswordVerified
  // If the currentPassword is empty, it will not call the mutation
  const handleCurrentPasswordVerification = async () => {
    try {
      const { data } = await verifyCurrentUserPassword({
        variables: {
          userId: userId,
          currentPassword: currentPassword,
        },
      });

      if (data.verifyCurrentUserPassword) {
        console.log("Current password verified successfully.");
      } else {
        alert("Incorrect current password. Please try again.");
      }
    } catch (err) {
      console.error("Error verifying current password:", err);
    }
    setCurrentPassword(""); // Clear the input after verification
  };

  // This is the heart of the update button click handler
  // It handles the form submission when the user clicks the update button

  const handle_UpdateButtonClick = async (e) => {
    e.preventDefault();

    const { username, user_email, profile_picture } = formUpdateUser;

    // Handle password form validation
    // If the activeForm is "password", we check if the passwords match
    if (activeForm === "password") {
      if (!isPasswordMatch) {
        alert("Passwords do not match. Please try again.");
        return;
      }
      if (!newPassword || !confirmPassword) {
        alert("Please fill out both password fields.");
        return;
      }
    }

    // now we proceed to update the user profile
    try {
      await updateUser({
        variables: {
          userId,
          username: username?.trim() || undefined,
          user_email: user_email?.trim() || undefined,
          password:
            activeForm === "password" && isPasswordMatch // If the activeForm is "password" and passwords match
              ? newPassword.trim()
              : undefined,
          profile_picture:
            activeForm === "profile_picture" // If the activeForm is "profile_picture", we use the newPostImage name
              ? `/userAvatar/${profile_picture}`
              : authUserInfo.user?.profile_picture,
        },
      });

      alert("User profile updated successfully!");

      // Reset all states after update
      setIsClicked(false);
      setActiveForm(null);
      setFormUpdateUser({
        username: "",
        user_email: "",
        profile_picture: authUserInfo.user?.profile_picture || "",
      });
      setNewPassword("");
      setConfirmPassword("");
      setNewPostImage(null);
      setCurrentPassword("");
      setCurrentPasswordVerified(false);
    } catch (err) {
      console.error("Error updating user profile:", err);
      alert("Something went wrong while updating. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormUpdateUser({
      ...formUpdateUser,
      [name]: value,
    });
  };

  // Function to handle image change
  // This function is called when the user selects a new image file
  const handleImageChange = (e) => {
    //it will return something like FileList object like this: FileList {0: File, length: 1, [Symbol.iterator]: ƒ}
    console.log("Selected file:", e.target.files);
    const file = e.target.files[0];

    if (!file) return;
    setNewPostImage(file);
    setFormUpdateUser((prev) => ({
      ...prev,
      profile_picture: file.name, // Set the filename in the form state
    }));
  };

  // Function to upload the image to the server
  // This function is called when the user clicks the upload button
  // It will create a FormData object with the file and send it to the server
  // It will also log the response or error
  // This is used to upload the new profile picture to the server
  // Note: This function is not called directly, it is called in the handleUpload_ImageButtonClick function
  // which is called when the user clicks the upload button
  // It is also used to update the profile picture in the form state
  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("file", newPostImage);
    try {
      await uploadAvatar(formData); // Call the uploadAvatar function to upload the image
      // Log the response or do something with it
      console.log("Image uploaded successfully:", formData);
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };

  // Function to handle the upload button click
  // This function is called when the user clicks the upload button
  // It will check if the newPostImage is selected, if not it will alert the user
  // If the image is selected, it will call the uploadImage function and then the handle_UpdateButtonClick function
  // This is used to upload the new profile picture and update the user profile
  // It will also reset the newPostImage state to null after the upload
  const handleUpload_ImageButtonClick = async (e) => {
    e.preventDefault();
    if (!newPostImage) {
      alert("Please select an image to upload.");
      return;
    }
    await uploadImage();
    await handle_UpdateButtonClick(e);
  };

  // UpdateUserForm function to render the form based on the activeForm state
  // This function returns a form based on the activeForm state when the user clicks a button
  // It will render different forms for updating username, email, password, and profile picture
  // It will also handle the input changes and submit the form when the user clicks the update button

  const UpdateUserForm = (option) => {
    switch (option) {
      case "username":
        return (
          <form onSubmit={handle_UpdateButtonClick}>
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                placeholder="New username"
                style={{ width: "100%", padding: "8px" }}
                value={formUpdateUser.username}
                onChange={(e) =>
                  setFormUpdateUser((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />
            </div>
            <Button type="submit" style={{ width: "100%" }}>
              Update username
            </Button>
          </form>
        );
      case "email":
        return (
          <form onSubmit={handle_UpdateButtonClick}>
            <div style={{ marginBottom: "16px" }}>
              <input
                type="email"
                placeholder="New Email"
                style={{ width: "100%", padding: "8px" }}
                value={formUpdateUser.user_email}
                onChange={(e) =>
                  setFormUpdateUser((prev) => ({
                    ...prev,
                    user_email: e.target.value,
                  }))
                }
              />
            </div>
            <Button type="submit" style={{ width: "100%" }}>
              Update Email
            </Button>
          </form>
        );

      case "password":
        return (
          <div>
            <div style={{ marginBottom: "6px" }}>
              <input
                type="password"
                placeholder="Please Enter Current Password"
                style={{ width: "100%", padding: "8px" }}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                // onBlur is a common event handler that triggers when user clicks outside the input field
                // This is useful for verifying the current password before allowing updates
                onBlur={handleCurrentPasswordVerification}
                disabled={currentPasswordVerified}
              />
            </div>
            {/*  if currentPasswordVerified is true, show the new password form */}
            {currentPasswordVerified ? (
              <form onSubmit={handle_UpdateButtonClick}>
                <div style={{ marginBottom: "16px" }}>
                  <input
                    type="password"
                    placeholder="New Password"
                    style={{ width: "100%", padding: "8px" }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    style={{ width: "100%", padding: "8px" }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button type="submit" style={{ width: "100%" }}>
                  Update Password
                </Button>
              </form>
            ) : (
              <div style={{ color: "red", marginBottom: "8px" }}>
                Incorrect current password. Please try again.
              </div>
            )}
          </div>
        );

      case "profile_picture":
        return (
          <form
            onSubmit={handleUpload_ImageButtonClick}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div style={{ marginBottom: "18px" }}>
              <label style={{ fontWeight: 600, color: "#855e42" }}>
                Image Filename:
              </label>
              <input
                type="text"
                name="image"
                value={formUpdateUser.profile_picture.replace(
                  "../userAvatar/",
                  ""
                )} // Remove the leading "../" for display
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  marginTop: "6px",
                }}
                readOnly
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
                  src={
                    `/userAvatars/${formUpdateUser.profile_picture}` ||
                    `${authUserInfo.user?.profile_picture}`
                  }
                  alt="User Avatar"
                  style={{
                    width: "100%",
                    maxHeight: "300px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    boxShadow: "0 2px 12px rgba(0,0,0,1.8)",
                  }}
                />
              )}
            </div>
            <Button type="submit" variant="warning" style={{ width: "100%" }}>
              Save Profile Picture
            </Button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-setting-bg">
      {!Auth.loggedIn() ? (
        <>
          <div className="text-center mt-5"></div>
          <h2 className="text-danger">
            You must be logged in to view this page.
          </h2>
        </>
      ) : (
        <div className="text-center mt-5">
          <Container
            fluid
            className="d-flex justify-content-center align-items-center"
            style={{
              minHeight: "100vh",

              padding: 0,
              margin: 0,
            }}
          >
            <Card
              style={{
                width: "100%",
                maxWidth: "480px",
                borderRadius: "28px",
                border: "none",
                boxShadow: "0 8px 32px rgba(60,60,120,0.12)",
                background: "rgba(255,255,255,0.95)",
              }}
            >
              <Card.Body className="p-5">
                <div className="d-flex flex-column align-items-center mb-4">
                  <div
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #6366f1 60%, #a5b4fc 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                      boxShadow: "0 2px 12px rgba(99,102,241,0.15)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 38,
                        color: "#fff",
                        fontWeight: 700,
                        letterSpacing: 2,
                      }}
                    >
                      KP
                    </span>
                  </div>

                  <span className="text-muted" style={{ fontSize: 15 }}>
                    powered by Khoi Phan LLC
                  </span>
                </div>
                <hr />

                <Row className="g-4 mt-2">
                  {/* Username */}
                  <Col xs={12} className="text-center">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setActiveForm("username");
                        handleButtonClick();
                      }}
                      style={{ width: "100%" }}
                    >
                      Update username
                    </Button>
                  </Col>

                  {/* Email */}
                  <Col xs={12} className="text-center">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setActiveForm("email");
                        handleButtonClick();
                      }}
                      style={{ width: "100%" }}
                    >
                      Update Email
                    </Button>
                  </Col>

                  {/* Password */}
                  <Col xs={12} className="text-center">
                    <Button
                      variant="success"
                      onClick={() => {
                        setActiveForm("password");
                        handleButtonClick();
                      }}
                      style={{ width: "100%" }}
                    >
                      Update Password
                    </Button>
                  </Col>

                  {/* Profile Picture */}
                  <Col xs={12} className="text-center">
                    <Button
                      variant="warning"
                      onClick={() => {
                        setActiveForm("profile_picture");
                        handleButtonClick();
                      }}
                      style={{ width: "100%" }}
                    >
                      Update Profile Picture
                    </Button>
                  </Col>

                  {/* Go Back to Chat */}
                  <Col xs={12} className="text-center">
                    <Button
                      variant="danger"
                      onClick={() => {
                        window.location.href = `/mychat/${authUserInfo.user?.userId}`;
                      }}
                      style={{ width: "100%" }}
                    >
                      Go Back to Chat
                    </Button>
                  </Col>
                </Row>

                {/*  if isClicked is true and activeForm is set, show the form 
                  based on the activeForm state */}

                {isClicked && activeForm && (
                  <Col xs={12} className="mt-5">
                    {UpdateUserForm(activeForm)}
                  </Col>
                )}
              </Card.Body>
            </Card>
          </Container>
        </div>
      )}
    </div>
  );
};

export default ProfileSetting;
