import { useEffect, useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import EventList from "./EventList";

// Import the `useParams()` hook from React Router
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
// Import the QUERY_SINGLE_THOUGHT query from our utility file
import { GET_SINGLE_COFFEE_HOUSE } from "../utils/queries";

const SingleCoffeeHouse = () => {
  // Use `useParams()` to retrieve value of the route parameter `:thoughtId`
  const { coffeeHouseId } = useParams();

  const { loading, data } = useQuery(GET_SINGLE_COFFEE_HOUSE, {
    // Pass the `thoughtId` URL parameter into query to retrieve this thought's data
    variables: { coffeeHouseId: coffeeHouseId },
  });

  const coffeehouse = data?.coffeehouse || {};
  console.log(coffeehouse);
  const [searchMap, setSearchMap] = useState(coffeehouse.address);
  const handleChange = (event) => {
    event.preventDefault();
    const { value } = event.target;
    setSearchMap(value);
  };
  useEffect(() => {
    setSearchMap(coffeehouse.address);
  }, [coffeehouse]);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!coffeehouse) {
    return <h2>Something went wrong</h2>;
  }

  // const { coffeeHouseId } = useParams();

  return (
    <div className="my-3">
      <h2>Search Map</h2>
      <input value={searchMap} onChange={handleChange} />
      <br />
      <br />

      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div>
              <h1 style={{ color: "black" }}>{coffeehouse.coffeeName}</h1>
               Owned by:{" "}
              <span style={{ color: "black" }}>
                {coffeehouse.coffeeOwnerId.userName}
              </span>
            </div>
          </Accordion.Header>
          <br />

          <Accordion.Body>{coffeehouse.address}</Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <div className="bg-light py-4">
        <blockquote
          className="p-4"
          style={{
            fontSize: "1.5rem",
            fontStyle: "italic",
            border: "2px dotted #1a1a1a",
            lineHeight: "1.5",
          }}
        >
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Image</Accordion.Header>
              <Accordion.Body>
                <div className="img-singlecoffee">
                  <img
                    src={"../uploads/" + coffeehouse.image}
                    alt="picture not displayed"
                  />
                  <br />
                  <br />
                  {coffeehouse.bio}
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </blockquote>

        <div id="google-map" class="map-responsive">
          <iframe
            style={{ width: 600, height: 400 }}
            src={
              "https://www.google.com/maps/embed/v1/place?key=AIzaSyA0s1a7phLN0iaD6-UE7m4qP-z21pH0eSc&q=" +
              searchMap
            }
          ></iframe>
        </div>
      </div>
      <br />
      <br />
      <h1>Exciting Events: </h1>
      <div className="my-5">
        <EventList events={coffeehouse.events} ownerID={coffeehouse.coffeeOwnerId._id}  coffeeHouseID={coffeehouse._id}
        /> 
     
      </div>
    </div>
  );
};

export default SingleCoffeeHouse;
