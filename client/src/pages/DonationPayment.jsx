import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { useEffect, useState } from "react";
import { useDonationDATA_CONTEXT } from "../utils/DonationContext";
import { DONATION_CHECKOUT } from "../utils/queries";
import { useLazyQuery } from "@apollo/client";
import { loadStripe } from "@stripe/stripe-js";
import Auth from "../utils/auth";

function DonationPayment(props) {
  // const {donationData, setDonationData} = useDonationDATA_CONTEXT();
  // Initialize Stripe
  const { eventNameProp, eventIdProp } = props;

  const stripePromise = loadStripe("pk_test_TYooMQauvdEDq54NiTphI7jx"); // Replace with your actual Stripe public key

  const [formState, setFormState] = useState({
    nameOfdonator: "",
    donationAmount: "",
    message: "",
  });

  const [getCheckoutSession, { data }] = useLazyQuery(DONATION_CHECKOUT);

  const { setDonationData } = useDonationDATA_CONTEXT();

  useEffect(() => {
    if (data && data.donationCheckout && data.donationCheckout.session) {
      stripePromise.then((stripe) => {
        if (stripe) {
          stripe
            .redirectToCheckout({
              sessionId: data.donationCheckout.session,
            })
            .then((result) => {
              if (result.error) {
                console.error(result.error.message);
              }
            });
        } else {
          console.error("Stripe failed to load.");
        }
      });
    }
  }, [data, stripePromise]); // we need to use the stripePromise in the useEffect to ensure it is loaded before we call redirectToCheckout

  useEffect(() => {
    setFormState({
      nameOfdonator: Auth.loggedIn() ? Auth.getProfile().data.userName : "",
    });
  }, []); // Initialize form state when component mounts

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState({
      ...formState,
      [name]: value,
    });
  };
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    console.log(formState);
    console.log(eventNameProp, eventIdProp);

    //get checkout session from the server
    const { nameOfdonator, donationAmount, message } = formState;
    await getCheckoutSession({
      variables: {
        nameOfdonator,
        donationAmount: parseFloat(donationAmount),
        message,
        eventName: eventNameProp, // Pass the event name prop to the query
      },
    });

    console.log(data);

    setDonationData({
      nameOfdonator: formState.nameOfdonator,
      donationAmount: parseFloat(formState.donationAmount),
      message: formState.message,
      eventName: eventNameProp, // Pass the event name prop to the donation data
      eventId: eventIdProp, // Pass the event ID prop to the donation data
    });

    setFormState({
      nameOfdonator: "",
      donationAmount: "",
      message: "",
    });
  };
  // Helper to check if donationAmount is a valid positive number
  const isDonationAmountValid = () => {
    const amount = parseFloat(formState.donationAmount);
    return !isNaN(amount) && amount > 0;
  };

  return (
    <>
      <h2>Ready to support your favorite coffee house?</h2>
      <br />
      <h5 style={{ color: "white" }}>
        Please fill out the form below to make a donation.
      </h5>
      <form onSubmit={handleFormSubmit}>
        {Auth.loggedIn() ? (
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Name of Donator"
              aria-label="nameOfdonator"
              aria-describedby="basic-addon2"
              type="text"
              name="nameOfdonator"
              disabled
              defaultValue={Auth.getProfile().data.userName}
            />
          </InputGroup>
        ) : (
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Name of Donator"
              aria-label="nameOfdonator"
              aria-describedby="basic-addon2"
              type="text"
              name="nameOfdonator"
              value={formState.nameOfdonator}
              onChange={handleChange}
              required
            />
          </InputGroup>
        )}

        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Amount"
            aria-label="donationAmount"
            aria-describedby="basic-addon2"
            type="number"
            min="0.01"
            step="any"
            name="donationAmount"
            value={formState.donationAmount}
            onChange={handleChange}
            isInvalid={
              !isDonationAmountValid() && formState.donationAmount !== ""
            }
            required
          />
          <Form.Control.Feedback type="invalid">
            Please enter a valid donation amount (number greater than 0).
          </Form.Control.Feedback>
        </InputGroup>
        <InputGroup>
          <InputGroup.Text>Message for coffee owner</InputGroup.Text>
          <Form.Control
            as="textarea"
            aria-label="Message"
            placeholder="Message"
            name="message"
            aria-describedby="basic-addon2"
            type="text"
            value={formState.message}
            onChange={handleChange}
          />
        </InputGroup>
        <br />
        <button
          className="btn btn-block btn-primary"
          style={{ cursor: "pointer" }}
          type="submit"
          disabled={!isDonationAmountValid()}
        >
          Donation
        </button>
      </form>
    </>
  );
}

export default DonationPayment;

/*
  const [getCheckoutSession, { data, loading, error }] = useLazyQuery(DONATION_CHECKOUT, {
    onCompleted: async (data) => {
      const stripe = await stripePromise;
      const sessionId = data.donationCheckout.session;
      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        console.error(result.error.message);
      }
    },
    onError: (error) => {
      console.error("Error fetching checkout session:", error);
    }
  });
  */
