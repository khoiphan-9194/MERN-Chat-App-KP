import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useMutation } from "@apollo/client";
import { USER_SIGNUP } from "../utils/mutations";
import Auth from "../utils/auth";
import { uploadAvatar } from "../utils/API";

const Signup = () => {
  // set initial form state
  const [userFormData, setUserFormData] = useState({
    username: "",
    user_email: "",
    password: "",
    profile_picture: "",
  });
  const [signedUpusername, setSignedUpusername] = useState("");
  // set state for form validation
  const [validated] = useState(false);
  // set state for alert
  const [showAlert, setShowAlert] = useState(false);
  const [newPostImage, setNewPostImage] = useState(null);
  const [newPostImageName, setNewPostImageName] = useState("");

  // SETUP THE ADD_USER MUTATION
  const [addUser, { error, data }] = useMutation(USER_SIGNUP);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
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
    await uploadAvatar(formData);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log(userFormData);
    // check if form has everything (as per react-bootstrap docs)
    try {
      await uploadImage(event);

      const { data } = await addUser({
        variables: {
          username: userFormData.username,
          user_email: userFormData.user_email,
          password: userFormData.password,
          profile_picture: newPostImageName
            ? `/userAvatar/${newPostImageName}`.trim()
            : "/assets/default-avatar.jpg",
        },
      });

      console.log(data);

      if (!data) {
        throw new Error("something went wrong!");
      }

      const { token, user } = data.addUser;

      console.log(user);
      console.log(token);

      Auth.login(token);
    } catch (err) {
      console.error(err);

      setShowAlert(true);
    }
    console.log(Auth.loggedIn());
    // clear form values

    setSignedUpusername(userFormData.username);

    setUserFormData({
      username: "",
      user_email: "",
      password: "",
      profile_picture: "",
    });
    setNewPostImage(null);
    setNewPostImageName("");
  };

  return (
    <main className="flex-row justify-center mb-4">
      <div className="col-12 col-lg-12">
        <div className="card">
          <h4 className="card-header bg-dark text-light p-2">Sign Up</h4>
          <div className="card-body">
            {data ? (
              <h4 className="card-header bg-dark text-light p-2">
                Welcome {signedUpusername}! Your signup was successful!
              </h4>
            ) : (
              <Form
                noValidate
                validated={validated}
                onSubmit={handleFormSubmit}
              >
                {/* show alert if server response is bad */}
                <Alert
                  dismissible
                  onClose={() => setShowAlert(false)}
                  show={showAlert}
                  variant="danger"
                >
                  Something went wrong with your signup!
                </Alert>

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="username">Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Your username"
                    name="username"
                    onChange={handleInputChange}
                    value={userFormData.username}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    username is required!
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="email">Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Your email address"
                    name="user_email"
                    onChange={handleInputChange}
                    value={userFormData.user_email}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    email is required!
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="password">Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Your password"
                    name="password"
                    onChange={handleInputChange}
                    value={userFormData.password}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Password is required!
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="profile_picture">
                    Profile Picture
                  </Form.Label>
                  <Form.Control
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
                      <div style={{ color: "black", fontSize: "1.05rem" }}>
                        {newPostImageName}
                      </div>
                    </div>
                  )}
                </Form.Group>

                <Button
                  disabled={
                    !(
                      userFormData.username &&
                      userFormData.user_email &&
                      userFormData.password
                    )
                  }
                  type="submit"
                  variant="success"
                >
                  Submit
                </Button>
              </Form>
            )}

            {error && (
              <div className="my-3 p-3 bg-danger text-white">
                {error.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Signup;
