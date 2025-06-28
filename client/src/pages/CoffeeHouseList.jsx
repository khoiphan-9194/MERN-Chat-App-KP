import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


import { useCoffeeHouseContext } from "../utils/CoffeeHouseContext"; // Import the context
// import { hashSearch } from "../utils/helpers";

function CoffeeHouseList() {
  
  // const [searchTerm, setSearchTerm] = useState("");
  // const [searchResults, setSearchResults] = useState([]);
const { coffeeHousesArr } = useCoffeeHouseContext(); // Fetch coffee houses
  const [filteredCoffeeHouses, setFilteredCoffeeHouses] = useState(coffeeHousesArr);

  useEffect(() => {
    setFilteredCoffeeHouses(coffeeHousesArr);
  }, [coffeeHousesArr]);

  const handleFilter = (event) => {
    const filterValue = event.target.value;
    const filtered = coffeeHousesArr.filter((coffeehouse) =>
      coffeehouse.coffeeName.toLowerCase().includes(filterValue.toLowerCase())
    );
    setFilteredCoffeeHouses(filtered);
  };
/*
  const handleChange = (event) => {
    event.preventDefault();
    const { value } = event.target;
    setSearchTerm(value);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Search Term:", searchTerm);
    const searchResults = hashSearch(coffeeHousesArr, searchTerm);
    if (searchResults !== -1) {
      console.log("Search Results:", searchResults);
      setSearchResults([coffeeHousesArr[searchResults]]);
    } else {
      setSearchResults([]);
    }
    setSearchTerm("");
  };
  */

  return (
    <main>
      <div>
        <div className="coffee-house-list">
     
            <div id="portfolio" className="main-portfolio">
              <input
                type="text"
                placeholder=" Search Coffee House"
                onChange={handleFilter}
              />
              <div className="grid-portfolio">
                {filteredCoffeeHouses && filteredCoffeeHouses.length > 0 ? (
                  filteredCoffeeHouses.map((coffeehouse) => {
                    return (
                      <div className="grid-item" key={coffeehouse._id}>
                        <div className="row">
                          <div className="col-lg-4 col-md-12 mb-4 mb-lg-0">
                            <img
                              src={"./uploads/" + coffeehouse.image}
                              className="shadow-1-strong rounded mb-4"
                              alt="picture not displayed"
                              style={{  height: "250px", objectFit: "cover" }}
                            />

                            <div>
                              <h3 className="Main-Text"
                                style={{
                                  color: "black",
                                  textShadow: "0 0 5px #fff, 0 0 10px #fff",
                                  fontSize: "1.5rem",
                                  fontWeight: "bold",
                                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                                }}>
                                {coffeehouse.coffeeName}
                              </h3>

                              <div className="Extra-Text">
                                <p>
                                  <strong>Owner:</strong>{" "}
                                  {coffeehouse.coffeeOwnerId.userName}
                                </p>
                                <p>{coffeehouse.address}</p>
                              </div>
                            </div>
                          </div>

                          <br />
                          <br />

                          <Link
                            className="btn btn-primary btn-block btn-squared"
                            style={{ width: "50%", margin: "0 auto" }}
                            to={`/coffeehouse/${coffeehouse._id}`}
                          >
                            Click to see details.
                             <h6>---------------</h6>
                          </Link>

                         
                        </div>

                        <br />
                      </div>
                    );
                  })
                ) : (
                  <div className="no-coffee-houses">
                    <h1>No Coffee Houses Found </h1>
                    <p>Please try again later.</p>
                  </div>
                )}

                {/* search */}
                {/* <div className="search">
                  <form onSubmit={handleSubmit}>
                    <input
                      type="text"
                      name="searchTerm"
                      value={searchTerm}
                      onChange={handleChange}
                      placeholder="Search Coffee House"
                    />
                    <button type="submit">Search</button>
                  </form>

                  {searchResults.length > 0 && (
                    <div>
                      {searchResults.map((coffeehouse) => (
                        <div key={coffeehouse._id}>
                          <h3>{coffeehouse.coffeeName}</h3>
                          <p>{coffeehouse.address}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div> */}

                {/* search */}
              </div>
            </div>
        </div>
      </div>
    </main>
  );
}

export default CoffeeHouseList;
