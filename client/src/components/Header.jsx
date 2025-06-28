// TODO: Add a comment explaining how we are able to extract the key value pairs from props
//this currentPage and handlePageChange were destructed from props
import React, { useEffect, useState } from "react";
import NavTabs from "./NavTabs";
import { DateTime } from "./Date";
import { useTheme } from "../utils/ThemeContext";

function Header(props) {
  const { currentTab, handleTabChange } = props;
  const [quote, setQuotes] = useState();
  useEffect(() => {
    setQuotes(`"it's not about ideas. it's about making ideas happen."`);
  }, []); // [] means that this effect will only run once when the component mounts

  const { darkTheme, toggleTheme } = useTheme();

  const themeStyle = {
    background: `
  
      :root {
        background: ${
          darkTheme
            ? "linear-gradient(90deg, rgb(17, 17, 17) 60%, rgb(11, 16, 60) 100%)"
            : "linear-gradient(90deg, rgb(41, 57, 65) 60%, rgb(2, 28, 26) 100%)"
        }
   
      `,
  };

  const handleToggleTheme = () => {
    toggleTheme();
  };

  return (
    <div className="main-header">
      {/* <style>{themeStyle.background}</style>
      <button onClick={handleToggleTheme}>
        Toggle to {darkTheme ? "light" : "dark"} mode
      </button> */}
      

      <section>
        <header>
        
          
            <DateTime />
              <div className="navbar-main">
        <NavTabs />
      </div>
          
        </header>

        <div className="small-quote">
          <h1>
            <span>
              <em>{quote} </em>
            </span>
          </h1>
        </div>
      </section>

      <section className="text-center">
        <h5 className="neon" data-text="U">
          W<span className="flicker-slow">el</span>C
          <span className="flicker-fast">o</span>mE
          <span className="flicker-fast"> T</span>o B
          <span className="flicker-fast">r</span>eW
          <span className="flicker-fast">T</span>i
          <span className="flicker-fast">p!!!</span>
        </h5>
      </section>
    </div>
  );
}

export default Header;
