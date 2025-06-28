import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Accordion from "react-bootstrap/Accordion";
import { QUERY_SINGLE_OWNER, QUERY_ME } from "../utils/queries";
import Alert from "react-bootstrap/Alert";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { useMutation } from "@apollo/client";
import { REMOVE_COFFEE_HOUSE } from "../utils/mutations";
import Auth from "../utils/auth";
import Search_Coffee from "./Search_Coffee";


const Profile = () => {
  const { ownerId } = useParams();

  const [removeCoffeeHouse, { error }] = useMutation(REMOVE_COFFEE_HOUSE);
  const handleRemoveCoffeeHouse = async (coffeeHouseId) => {
    if (!window.confirm("Are you sure you want to remove this coffeehouse?")) {
      alert(`Coffeehouse ${coffeeHouseId} removal cancelled.`);
      return;
    }
    try {
      await removeCoffeeHouse({
        variables: { coffeeHouseId },
        refetchQueries: [{ query: QUERY_SINGLE_OWNER, variables: { ownerId } }],
      });
      console.log("Coffeehouse removed successfully");
    } catch (err) {
      console.error("Error removing coffeehouse:", err);
    }
  };

  // ownerId ? QUERY_SINGLE_OWNER : QUERY_ME will be used to determine if the user is logged in or not
  // if ownerId is present, we will use QUERY_SINGLE_OWNER to get the data of the user
  // if ownerId is not present, we will use QUERY_ME to get the data of the logged in user
  const { loading, data } = useQuery(ownerId ? QUERY_SINGLE_OWNER : QUERY_ME, {
    variables: { ownerId: ownerId },
  });
  //
  // data?.me || data?.owner || {}
  // can check for 3 different cases
  // 1. if the user is logged in, we will get the data from QUERY_ME
  // 2. if the user is not logged in, we will get the data from QUERY_SINGLE_OWNER
  // 3. otherwise we will get an empty object
  const user = data?.me || data?.owner || {};

  console.log(user.coffeehouses);
  if (loading) {
    return <div>Loading...</div>;
  }

  console.log(Auth.loggedIn());
  console.log("user", user);
  return (
    <div className="main-container">
      {!Auth.loggedIn() || Auth.getProfile().data._id !== user._id ? (
        <Alert variant="danger">
          <Alert.Heading>Unauthorized</Alert.Heading>
          <p
            style={{
              color: "#721c24",
              background: "linear-gradient(90deg, #f8d7da 0%, #fff3cd 100%)",
              padding: "1rem",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "1.2rem",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              letterSpacing: "1px",
            }}
          >
            🚫 You are not authorized to view this page. 🚫
          </p>
          <Link to="/">
            <Button variant="primary">Go back to home</Button>
          </Link>
        </Alert>
      ) : (
        <div className="container">
          <h1
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', 'Georgia', serif",
              fontStyle: "italic",
              fontWeight: 800,
              fontSize: "3.4rem",
              letterSpacing: "2px",
              color: "#f8f9fa",
            }}
          >
            Viewing {`${user.userName}'s`} profile.
          </h1>
          <br />
          <Search_Coffee coffeeHousesArr={user.coffeehouses} />
          <br />
          {user.coffeehouses.length === 0 ? (
            <Alert variant="info">
              <Alert.Heading>No Coffeehouses Found</Alert.Heading>
              <p style={{ color: "black" }}>
                {user.userName} has not created any coffeehouses yet.
              </p>
            </Alert>
          ) : (
            <div className="row">
              <div className="col-12 col-md-10 mb-5">
                <ul className="list-group">
                  {user.coffeehouses.map((coffeehouse) => (
                    <li key={coffeehouse._id}>
                      <Accordion defaultActiveKey="0">
                        <Accordion.Item
                          eventKey={coffeehouse._id}
                          key={coffeehouse._id}
                        >
                          <Accordion.Header>
                            <h2
                              style={{
                                fontSize: "3rem",
                                fontWeight: "bold",
                                color: "black",
                              }}
                            >
                              {coffeehouse.coffeeName}
         
                                <Link to={`/me_id=/${Auth.getProfile().data._id}/edit-coffee-house_id=/${coffeehouse._id}`}>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    style={{ marginLeft: "10px", verticalAlign: "middle" }}
                                    title="Edit Coffeehouse"
                                  >
                                    <span role="img" aria-label="edit">✏️</span>
                                  </Button>
                                </Link>
                              
                              
                            </h2>
                          </Accordion.Header>
                          <Accordion.Body>
                            <Alert key="warning" variant="warning">
                              <p style={{ fontSize: "1.5rem", color: "black" }}>
                                {coffeehouse.bio}
                              </p>
                              <img
                                src={"../uploads/" + coffeehouse.image}
                                alt={coffeehouse.coffeeName}
                                style={{
                                  width: "400px",
                                  height: "350px",
                                  objectFit: "cover",
                                }}
                              />
                            </Alert>
                            <Link to={`/coffeehouse/${coffeehouse._id}`}>
                              <Button
                                variant="primary"
                                style={{ marginTop: "10px" }}
                              >
                                View Coffeehouse
                              </Button>
                            </Link>

                            {Auth.loggedIn() &&
                              Auth.getProfile().data._id === user._id && (
                                <Button
                                  variant="danger"
                                  style={{
                                    marginLeft: "10px",
                                    marginTop: "10px",
                                  }}
                                  onClick={() =>
                                    handleRemoveCoffeeHouse(coffeehouse._id)
                                  }
                                >
                                  Remove Coffeehouse
                                </Button>
                              )}

                            {Auth.loggedIn() &&
                              Auth.getProfile().data._id === user._id && (
                                <Link
                                  to={`/me/${user._id}/create-event/${coffeehouse._id}`}
                                  style={{ marginLeft: "10px", marginTop: "10px" }}
                                >
                                <Button
                                  variant="warning"
                                  style={{
                                    marginLeft: "10px",
                                    marginTop: "10px",
                                  }}
                        
                                >
                                 Create Event
                                </Button>
                                </Link>
                              )}
                              
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <Link
            className="btn btn-warning btn-block btn-squared"
            to={`/create-coffeehouse/${user._id}`}
          >
            <h2>Another Coffee House ????</h2>
          </Link>
          <br /> <br /> <br />
        </div>
      )}
    </div>
  );
};

export default Profile;
