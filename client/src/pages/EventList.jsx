import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { REMOVE_EVENT } from "../utils/mutations";
import Auth from "../utils/auth";

const EventList = ({ events = [], ownerID, coffeeHouseID }) => {
  // EVENTS = [] MEANS THAT IF NO EVENTS ARE PASSED, IT WILL DEFAULT TO AN EMPTY ARRAY

  console.log("Events in EventList:", events);
  const [removeEvent] = useMutation(REMOVE_EVENT);
  const handleRemoveEvent = async (eventId) => {
    console.log("Removing event with ID:", eventId);
    console.log("Current events:", events);
    if (!window.confirm("Are you sure you want to remove this event?")) {
      alert(`Event ${eventId} removal cancelled.`);
      return;
    }

    try {
      await removeEvent({
        variables: { eventId },
      });
      //reload the page to reflect the changes
      window.location.reload();
      console.log("Event removed successfully");
      alert("Event removed successfully!");
    } catch (err) {
      console.error("Error removing event:", err);
      alert("Failed to remove event. Please try again.");
    }
    console.log("Event removal process completed.");
  };

  return (
    <>
      <div className="flex-row my-4">
        {events &&
          events.map((event, index) => (
            <div key={event._id} className="col-12 mb-3 pb-3">
              <div className="p-3 bg-dark text-light">
                <Accordion defaultActiveKey="0">
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>
                      {index + 1}. {event.eventName}
                      <br />
                    </Accordion.Header>

                    <Accordion.Body>
                      <div className="img-singlecoffee">
                        <img
                          src={"../coffee/" + event.event_Images[0]}
                          alt={event.event_Images[0] + " not displayed"}
                          style={{
                            width: "550px",
                            height: "420px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      </div>
                      <br />

                      <h5 className="card-header">
                        Event Detail:
                        <br /> <p className="card-body">{event.eventDetail}</p>
                        <span style={{ fontSize: "0.825rem" }}>
                          on {event.Date}
                        </span>
                      </h5>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>

                <div className="d-flex gap-5 mt-4">
                  <Link
                    className="btn btn-primary btn-squared flex-fill"
                    to={`/event/${event._id}`}
                  >
                    See Details
                  </Link>
                  {Auth.loggedIn() && Auth.getProfile().data._id === ownerID ? (
                    <>
                      <button
                        className="btn btn-danger btn-squared flex-fill"
                        onClick={() => {
                          handleRemoveEvent(event._id);
                        }}
                      >
                        Remove Event
                      </button>
                      <Link to={`/coffeehouse/${coffeeHouseID}/edit-event/${event._id}`}>
                        <Button
                          variant="outline-secondary"
                          size="md"
                          style={{ marginLeft: "10px", verticalAlign: "middle" }}
                          title="Edit Event"
                        >
                          <span role="img" aria-label="edit">
                            ✏️ 
                          </span>
                        </Button>
                      </Link>
                    </>
                  ) : null}
                
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default EventList;
