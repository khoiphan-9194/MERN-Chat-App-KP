import { useState, useEffect } from 'react';

const DateTime = () => {

    var [date, setDate] = useState(new Date());
    
    useEffect(() => {
        var timer = setInterval(() => setDate(new Date()), 1000);
        return function cleanup() {
            clearInterval(timer);
        };
    }, []);

    return (
      <div className="time-display">
      <p>
        <span role="img" aria-label="date">🗓️</span>  {date.toLocaleDateString()}
      </p>
      <p>
        <span role="img" aria-label="time">🕒</span> {date.toLocaleTimeString()}
      </p>
      </div>
    );
};

export default DateTime;