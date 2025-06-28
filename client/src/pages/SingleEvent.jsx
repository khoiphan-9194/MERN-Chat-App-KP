
import  { useEffect, useState, useRef } from "react";
import Accordion from 'react-bootstrap/Accordion';
import Donation from './Donation';
import DonationPayment from './DonationPayment';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import DONATION_PROVIDER from '../utils/DonationContext';




// Import the `useParams()` hook from React Router
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
// Import the QUERY_SINGLE_THOUGHT query from our utility file
import { QUERY_SINGLE_EVENT } from "../utils/queries";

const SingleEvent = () => {
  // Use `useParams()` to retrieve value of the route parameter `:thoughtId`
  const { eventId } = useParams();

  

  const { loading, data } = useQuery(QUERY_SINGLE_EVENT, {
    // Pass the `thoughtId` URL parameter into query to retrieve this thought's data
    variables: { eventId: eventId },
  });

  

  const event = data?.event || {};

  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <div className="my-3">
      <h4 style={{ fontFamily: "'Pacifico', cursive", fontSize: "3.5rem", color: "#6f4e37", letterSpacing: "2px" }}>
      Welcome to {event.coffeeEventHouse_Id.coffeeName}
      </h4>
      <br />

      <Accordion defaultActiveKey="0">
      <Accordion.Item eventKey="0">
      
        <Accordion.Header>
          <div style={{ display: "flex", flexDirection: "column" }}>
          <h2 style={{ color: '#1a1a1a', fontFamily: "'Montserrat', sans-serif", fontWeight: 700, marginBottom: 0 }}>
            {event.eventName}
          </h2>
          <br />
          <span style={{ fontFamily: "'Fira Mono', monospace", color: "#888" }}>
            Date Created: {event.Date}
          </span>
          </div>
        </Accordion.Header>
       

        <Accordion.Body>
        <span style={{ fontFamily: "'Roboto Slab', serif", fontSize: "1.5rem" }}>
          {event.eventDetail}
        </span>
        </Accordion.Body>
      </Accordion.Item>
      </Accordion>
      <br />
      <br />
        <div className="event_image-container">
      {event.event_Images &&
      event.event_Images.map((img, index) => (
        <div key={index} className="col-12 col-xl-6 event_image-card">

        <Card>
          <Card.Img style={{ height: 150 }} variant="top" src="../watergif.gif" />
          <Card.Body>
          <Card.Title style={{ fontFamily: "'Fira Mono', monospace" }}>{event.Date}</Card.Title>
          <Image style={{ width: 700, height:600 }} src={`../coffee/${img}`} fluid alt="picture not displayed" />
          </Card.Body>
        </Card>
       
        <br />
        </div>
      ))}
      </div>

      <br />
      <br />
    
      <div className="my-5">
      <Donation donations={event.donations} />
      </div>

      <DONATION_PROVIDER>
       <div className="m-3 p-4" style={{ border: '1px dotted #1a1a1a' }}>
      <DonationPayment eventNameProp={event.eventName} eventIdProp={event._id} />
      </div> 
      </DONATION_PROVIDER>
    
    </div>
    );
};

export default SingleEvent;