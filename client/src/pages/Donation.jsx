import Accordion from "react-bootstrap/Accordion";
const Donation = ({ donations = [] }) => {

  const total_DonationsAmount = donations.reduce(
    (total, donation) => total + donation.donationAmount,
    0
  );

  return (
    <>
      <div className="flex-row my-4">
            <h3>
              <span
                style={{ fontFamily: "'Fira Mono', monospace", color: "#888" }}
              >
                Total Donations Amount: ${total_DonationsAmount}
              </span>
            </h3>
        {donations && donations.length > 0 ? (
          <>
            <h2>
              <span
                style={{ fontFamily: "'Fira Mono', monospace", color: "#888" }}
              ></span>
              <strong>Donations:</strong>
            </h2>
        
            
            {donations.map((donation, index) => (
              <div key={donation._id} className="col-12 mb-3 pb-3">
                <div className="p-3 bg-dark text-light">
                  <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        {index + 1}. {donation.nameOfdonator}
                      </Accordion.Header>
                      <Accordion.Body>
                        <h5 className="card-header">
                          Donation Detail:
                          <p className="card-body">
                            Amount: ${donation.donationAmount + " "}
                            <span style={{ fontSize: "0.825rem" }}>
                              on {donation.donation_Date}
                            </span>
                          </p>
                          Message: {donation.message}
                        </h5>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
              </div>
            ))}
          </>
        ) : (
          <h2> This event has no donations yet.</h2>
        )}
      </div>
    </>
  );
};

export default Donation;
