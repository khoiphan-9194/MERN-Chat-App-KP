import  { useState, useRef} from "react";
import emailjs from '@emailjs/browser';
import { validateEmail } from '../utils/helpers';


export default function Contact() {
  const form = useRef();// form reference to reset form after submission 
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorSubject, setVisitorSubject] = useState("");
  const [visitorMessage, setVisitorMessage] = useState("");
  const [errorMessages, setErrorMessages] = useState();
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setVisitorName(value);
    } else if (name === "email") {
      setVisitorEmail(value);
    } else if (name === "subject") {
      setVisitorSubject(value);
    } else if (name === "message") {
      setVisitorMessage(value);
    }
  }

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
    .sendForm('service_r6bgx5t', 'template_7ohq5j8', form.current, {
      publicKey: 'SvOsJ6PhCbqN6LyDj'
    }
    )
    .then(
      (result) => {
        console.log(result);
        console.log(`${result.text} was sent sucessfully`);

     alert(`Hello! ${visitorName}, Your message has been sent successfully!`);
      },
      (error) => {
        console.log('FAILED...', error.text);
        alert('FAILED...', error.text)
      },
    );


  }


  const handleSubmission = (e) => {
    e.preventDefault();
    if (visitorName === "" || visitorEmail === "" || visitorSubject === "" || visitorMessage === "") {
      setErrorMessages("All fields are required");
      return;
    }
    if (!validateEmail(visitorEmail)) {
      setErrorMessages("Please enter a valid email address");
      return;
    }
    sendEmail(e);

    
  
  
    form.current.reset(); // reset the form after submission
    setVisitorName("");
    setVisitorEmail("");
    setVisitorSubject("");
    setVisitorMessage("");
    setErrorMessages("");

    
  }






  return (
    <div className="contact-container">


{/* <!--Section: Contact v.2--> */}
<section className="mb-4">
{/* 
  <!--Section heading--> */}
  <h2 className="h1-responsive font-weight-bold text-center my-4">Contact Me</h2>
  {/* <!--Section description--> */}
  <p className="text-center w-responsive mx-auto mb-5">Do you have any questions? Please do not hesitate to contact me directly.</p>

  <div className="row">

      {/* <!--Grid column--> */}
      <div className="col-md-9 mb-md-0 mb-5">
          <form id="contact-form" name="contact-form" ref={form}>

              {/* <!--Grid row--> */}
              <div className="row">

                  {/* <!--Grid column--> */}
                  <div className="col-md-6">
                      <div className="md-form mb-0">
                        
                        <input
                          type="text"
                          id="name"
                          name="name"
                          className="form-control"
                          value={visitorName}
                          onChange={handleInputChange}
                          placeholder='Enter your name'
                        />     
                      </div>
                      <br />
                      <br />
                  </div>

                  {/* <!--Grid column-->

                  <!--Grid column--> */}
                      <div className="col-md-6">
                      <div className="md-form mb-0">
                        
                        <input
                          type="text"
                          id="email"
                          name="email"
                          className="form-control"
                          value={visitorEmail}
                          onChange={handleInputChange}
                          placeholder='Enter your email'
                        />     
                      </div>
                      <br />
                      <br />
                  </div>
                  {/* <!--Grid column--> */}

              </div>
              {/* <!--Grid row-->

              <!--Grid row--> */}
              <div className="row">
                  <div className="col-md-12">
                      <div className="md-form mb-0">
                      <input
                          type="text"
                          id="subject"
                          name="subject"
                          className="form-control"
                          value={visitorSubject}
                          onChange={handleInputChange}
                          placeholder='Enter your subject'
                        />     
                      </div>
                      <br />
                      <br />
                  </div>   
              </div>
              {/* <!--Grid row-->

              <!--Grid row--> */}
              <div className="row">
{/* 
                  <!--Grid column--> */}
                  <div className="col-md-12">

                      <div className="md-form">
                          <textarea 
                          type="text"
                          id="message"
                          name="message"
                          rows="2"
                          className="form-control md-textarea"
                          value={visitorMessage}
                          onChange={handleInputChange}
                          placeholder='Enter your message'
                          ></textarea>
                      </div>
                      <br />
                      <br />
                  </div>
              
              </div>
              {/* <!--Grid row--> */}


              {errorMessages && (
        <div>
          <p className="error-text">{errorMessages}</p>
        </div>
      )}
          <button className="btn btn-primary  btn-warning btn-lg" onClick={handleSubmission}>
            Submit
          </button>
        </form>
     
      </div>


     
      {/* <!--Grid column-->

      <!--Grid column--> */}
      <div className="col-md-3 text-center">
          <ul className="list-unstyled mb-0">
              <li><i className="fas fa-map-marker-alt fa-2x"></i>
                  <p>San Jose, CA 95128, USA</p>
              </li>

              <li><i className="fas fa-phone mt-4 fa-2x"></i>
                  <p>(626)-784-8544</p>
              </li>

              <li><i className="fas fa-envelope mt-4 fa-2x"></i>
                  <p>phanminhkhoi91@gmail.com</p>
              </li>
          </ul>
      </div>
      {/* <!--Grid column--> */}

  </div>
  

</section>




    </div>
    
  );
}

