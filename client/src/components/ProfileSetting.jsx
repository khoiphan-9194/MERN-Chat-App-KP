import { useParams } from "react-router-dom";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import { QUERY_SINGLE_OWNER } from "../utils/queries";
import { UPDATE_USER_PROFILE } from "../utils/mutations";
import { VERIFY_CURRENT_PASSWORD } from "../utils/mutations";
import { useQuery, useMutation } from "@apollo/client";
import { useState, useEffect } from "react";
import Auth from "../utils/auth";

const ProfileSetting = () => {
  const { ownerId } = useParams();
  const [isClicked, setIsClicked] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [currentPasswordVerified, setCurrentPasswordVerified] = useState(false);

  const [newPassword, setNewPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [isPasswordMatch, setIsPasswordMatch] = useState(false);

  useEffect(() => {
    if (activeForm === "password") {
      if (newPassword && confirmPassword) {
        setIsPasswordMatch(newPassword === confirmPassword);
      } else {
        setIsPasswordMatch(false);
      }
    }
  }, [newPassword, confirmPassword, activeForm]);

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

  const [updateUser, { error }] = useMutation(UPDATE_USER_PROFILE, {
    refetchQueries: [
      {
        query: QUERY_SINGLE_OWNER,
        variables: { ownerId: ownerId },
      },
    ],
  });

  const [formUpdateUser, setFormUpdateUser] = useState({
    userName: "",
    userEmail: "",
  });

  const handleButtonClick = () => {
    return setIsClicked((prev) => !prev);
  };

  const handleCurrentPasswordVerification = async () => {
    try {
      const { data } = await verifyCurrentUserPassword({
        variables: {
          ownerId: ownerId,
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

  const handle_UpdateButtonClick = async (e) => {
    e.preventDefault();

    const { userName, userEmail } = formUpdateUser;
    if (activeForm === "password" && !isPasswordMatch) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    try {
      await updateUser({
        variables: {
          ownerId: ownerId,
          userName: userName || undefined,
          userEmail: userEmail || undefined,
          password:
            activeForm === "password" && isPasswordMatch
              ? newPassword
              : undefined,
        },
      });
      alert("User profile updated successfully!");
      setIsClicked(false);
      setActiveForm(null);
      setFormUpdateUser({
        userName: "",
        userEmail: "",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Error updating user profile:", err);
    }
  };

  const UpdateUserForm = (option) => {
    switch (option) {
      case "username":
        return (
          <form onSubmit={handle_UpdateButtonClick}>
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                placeholder="New Username"
                style={{ width: "100%", padding: "8px" }}
                value={formUpdateUser.userName}
                onChange={(e) =>
                  setFormUpdateUser((prev) => ({
                    ...prev,
                    userName: e.target.value,
                  }))
                }
              />
            </div>
            <Button type="submit" style={{ width: "100%" }}>
              Update Username
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
                value={formUpdateUser.userEmail}
                onChange={(e) =>
                  setFormUpdateUser((prev) => ({
                    ...prev,
                    userEmail: e.target.value,
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
                onBlur={handleCurrentPasswordVerification}
                disabled={currentPasswordVerified}
              />
            </div>
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
              background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
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
                  <Col xs={12} className="text-center">
                    <Button
                      variant="primary"
                      onClick={() => {
                        setActiveForm("username");
                        handleButtonClick();
                      }}
                      style={{ width: "100%" }}
                    >
                      Update Username
                    </Button>
                  </Col>

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
                </Row>
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
