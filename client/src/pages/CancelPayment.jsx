import { useEffect, useState} from "react";




function CancelPayment() {
  const [count, setCount] = useState(7);
 
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(interval);
          window.location.href = "/"; // Redirect to home page
        }
        return prevCount - 1;
      });
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }
  , []);
  

  return (
    <div>
      <h1 style={{ fontFamily: "'Pacifico', cursive", fontSize: "3.5rem", color: "#6f4e37", letterSpacing: "2px" }}>
        Payment Cancelled
      </h1>
      <h4 style={{ fontFamily: "'Montserrat', sans-serif", color: "orange" }}>
        Your payment has been cancelled. You will be redirected to the home page in {count} seconds.

      </h4>
      <p style={{ fontFamily: "'Fira Mono', monospace", color: "red" }}>
        If you have any questions, please contact support.
      </p>
      <img
        src="./uploads/cancel.gif"
        alt="Funny payment cancelled"
        style={{ width: "50%", marginTop: "2rem", marginLeft:"30%", borderRadius: "12px" }}
      />
     
    </div>

  );
}

export default CancelPayment;