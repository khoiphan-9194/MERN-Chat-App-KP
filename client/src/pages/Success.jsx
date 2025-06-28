import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_DONATION } from "../utils/mutations";
import { set } from "mongoose";

function Success() {
  const [formState, setFormState] = useState({
    nameOfdonator: "",
    donationAmount: "",
    message: "",
    eventName: "",
    eventId: "",
  });
  const [addDonation] = useMutation(ADD_DONATION);
  const [count, setCount] = useState(5);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const donationData = JSON.parse(sessionStorage.getItem("donationData"));
    console.log("Success component donationData", donationData);
    if (donationData) {
      setFormState({
        nameOfdonator: donationData.nameOfdonator,
        donationAmount: donationData.donationAmount,
        message: donationData.message,
        eventName: donationData.eventName,
        eventId: donationData.eventId,
      });
    }
  }, []);

  useEffect(() => {
    // Only call writeDonationData if formState has valid eventId (i.e., after session data is loaded)
    if (formState.eventId) {
      writeDonationData();
    }
    // eslint-disable-next-line
  }, [formState.eventId]);

  const writeDonationData = async () => {
    try {
      const { data } = await addDonation({
        variables: {
          eventId: formState.eventId,
          nameOfdonator: formState.nameOfdonator,
          donationAmount: parseFloat(formState.donationAmount),
          message: formState.message,
        },
      });
      console.log("Donation added successfully:", data);
      sessionStorage.removeItem("donationData"); // Clear session storage after successful write
    } catch (error) {
      console.error("Error adding donation:", error);
    }
  };

  const handleClick = async () => {
    setCount(5); // Reset count to 5 seconds
    const interval = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(interval);
          return 0;
        }
        setCount;
        console.log("Count:", prevCount);
        return prevCount - 1;
      });
    }, 1000);
  };

  // Move handleFormSubmit outside of handleClick
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setRedirect(true); // Set redirect state to true

    setTimeout(() => {
      window.location.href = "/event/" + formState.eventId; // Redirect to the event page or any other page you want
    }, 5000); // Redirect after 5 seconds
  };

  return (
    <div>
      <h1>
        *** Thanks you {formState.nameOfdonator} for the support of our coffee{" "}
        <br />
        payment made Sucessfully ***
        <br /> Your support should be posted on our event
      </h1>
      <h2> Receipt for your donation</h2>

      <form onSubmit={handleFormSubmit}>
        <p>Name of Donator: {formState.nameOfdonator}</p>
        <p>Donation Amount: ${formState.donationAmount}</p>
        <p>Message: {formState.message}</p>
        <p>Event Name: {formState.eventName}</p>
        <p>Event ID: {formState.eventId}</p>

        <button
          type="submit"
          disabled={redirect}
          className="btn btn-block btn-primary"
          onClick={handleClick}
        >
          Click here to go back to the event page
        </button>
        <br />
        {redirect && (
          <p>
            Redirecting in {count} seconds... If not redirected, refresh the
            page
          </p>
        )}
        {/* {redirect ? `Redirecting in ${count} seconds...` : ""} */}
      </form>
      <br />
      <br />
    </div>
  );
}

export default Success;
