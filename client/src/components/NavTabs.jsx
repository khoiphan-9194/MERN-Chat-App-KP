import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Modal, Tab } from "react-bootstrap";
import Login from "./Login";
import Signup from "./Signup";
import { useTheme } from "../utils/ThemeContext";
import Auth from "../utils/auth";

const AppNavbar = () => {
  // set modal display state
  const [showModal, setShowModal] = useState(false);
  //Modal is a bootstrap component that allows us to create a modal like a popup

  const { darkTheme, toggleTheme } = useTheme();

  const themeStyle = {
    background: `
    
        :root {
          background: ${
            darkTheme
              ? "linear-gradient(90deg, rgb(17, 17, 17) 60%, rgb(11, 16, 60) 100%)"
              : "linear-gradient(90deg, rgba(68, 103, 182, 1.24) 40%, rgba(173, 175, 12, 1.89) 120%)"
          }
        }
          
       .grid-item { ${
         darkTheme ? "" : "box-shadow: 15px 20px 30px rgba(6, 7, 7, 0.8)"
       }
        }

      .grid-item h3 { ${
         darkTheme ? "" : "box-shadow: none"
       }
        }

        .neon{
          color: ${darkTheme ? "yellow" : ""};
          text-shadow: ${
            darkTheme
              ? "0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #fff"
              : ""
          };
        }
        
        `,
        
  };

  const handleToggleTheme = () => {
    toggleTheme();
  };

  return (
    <>
      <div className="navbar">
        <style>
          {`
           ${themeStyle.background}

          
          `}
        </style>

        <Navbar bg="dark" variant="dark" expand="lg">
          <Container fluid>
            <Navbar.Brand as={Link} to="/">
              <span role="img" aria-label="home" style={{ marginRight: "8px" }}>
                🏠
              </span>
              HOME
            </Navbar.Brand>

            <Navbar.Brand as={Link} to="/Contact">
              <span
                role="img"
                aria-label="contact"
                style={{ marginRight: "8px" }}
              >
                ✉️
              </span>
              CONTACT
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="navbar" />
            <Navbar.Collapse id="navbar" className="d-flex flex-row-reverse">
              <Nav className="ml-auto d-flex">
                {Auth.loggedIn() ? (
                  <>
                    <div className="dropdown">
                      <div className="dropdown-toggle">
                        Hello {Auth.getProfile().data.userName}!
                      </div>
                      <div className="dropdown-content">
                        {/* ----------------------------- */}
                        <button className="toggleButton"
                          onClick={handleToggleTheme}
                          style={{
                            margin: "10px",
                            padding: "8px 16px",
                            borderRadius: "5px",
                            border: "none",
                            background: darkTheme ? "#222" : "#eee",
                            color: darkTheme ? "#fff" : "#222",
                            cursor: "pointer",
                            transition: "background 0.3s, color 0.3s",
                          }}
                          aria-label={`Switch to ${darkTheme ? "light" : "dark"} mode`}
                        >
                          {darkTheme ? "🌙 Dark" : "☀️ Light"} Mode
                        </button>
                         {/* ----------------------------- */}
                        <Nav.Link
                          as={Link}
                          to={`me/${Auth.getProfile().data._id}`}
                        >
                          Profile Page
                        </Nav.Link>
                        <Nav.Link as={Link} to={`/settings/${Auth.getProfile().data._id}`}>
                          Settings
                        </Nav.Link>
                        <Nav.Link onClick={Auth.logout}>Logout</Nav.Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <Nav.Link onClick={() => setShowModal(true)}>
                    Login/Sign Up
                  </Nav.Link>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>
      {/* set modal data up */}
      <Modal
        size="lg"
        show={showModal}
        onHide={() => setShowModal(false)}
        aria-labelledby="signup-modal"
      >
        {/* tab container to do either signup or login component */}
        <Tab.Container defaultActiveKey="login">
          <Modal.Header closeButton>
            <Modal.Title id="signup-modal">
              <Nav variant="pills">
                <Nav.Item>
                  <Nav.Link eventKey="login">Login</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="signup">Sign Up</Nav.Link>
                </Nav.Item>
              </Nav>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tab.Content>
              <Tab.Pane eventKey="login">
                <Login handleModalClose={() => setShowModal(false)} />
              </Tab.Pane>
              <Tab.Pane eventKey="signup">
                <Signup handleModalClose={() => setShowModal(false)} />
              </Tab.Pane>
            </Tab.Content>
          </Modal.Body>
        </Tab.Container>
      </Modal>
    </>
  );
};

export default AppNavbar;
