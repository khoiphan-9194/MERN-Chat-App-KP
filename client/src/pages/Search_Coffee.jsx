import { useState } from "react";
import {hashSearch} from "../utils/helpers"; // Assuming hashSearch is defined in helpers.js
import { Link } from "react-router-dom";

const Search_Coffee = (props) => {
const { coffeeHousesArr } = props; // Assuming coffeeHousesArr is passed as a prop
const [searchTerm, setSearchTerm] = useState("");
const [searchResults, setSearchResults] = useState([]);
  const handleChange = (event) => {
    event.preventDefault();
    const { value } = event.target;
    setSearchTerm(value);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Search Term:", searchTerm);
    console.log("Coffee Houses Array:", coffeeHousesArr);
    const searchResults = hashSearch(coffeeHousesArr, searchTerm);
    if (searchResults !== -1) {
      console.log("Search Results:", searchResults);
      setSearchResults([coffeeHousesArr[searchResults]]);
    } else {
      alert("No coffeehouse found with that name.");
      setSearchResults([]);
    }
    setSearchTerm("");
  };

  return (
    <div>
      <div className="search-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "2rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
          <input
            type="text"
            name="searchTerm"
            value={searchTerm}
            onChange={handleChange}
            placeholder="Search Coffee House"
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "1rem",
              width: "250px"
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.5rem 1.5rem",
              borderRadius: "4px",
              border: "none",
              background: "#6f4e37",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            Search
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="search-results" style={{ width: "100%", maxWidth: "500px", background: "#faf7f2", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", padding: "1.5rem" }}>
            {searchResults.map((coffeehouse) => (
              <div key={coffeehouse._id} style={{ textAlign: "center" }}>
                <h3 style={{ margin: "0.5rem 0", color: "#6f4e37" }}>{coffeehouse.coffeeName}</h3>
                <p style={{ margin: "0.5rem 0", color: "#555" }}>{coffeehouse.address}</p>
                <img
                  src={"../uploads/" + coffeehouse.image}
                  alt={coffeehouse.coffeeName}
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    height: "250px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "1rem"
                  }}
                />
                <Link to={`/coffeehouse/${coffeehouse._id}`}>
                  <button
                    style={{
                      padding: "0.5rem 1.5rem",
                      borderRadius: "4px",
                      border: "none",
                      background: "#4e342e",
                      color: "#fff",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "1rem"
                    }}
                  >
                    View Coffeehouse
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Search_Coffee;
