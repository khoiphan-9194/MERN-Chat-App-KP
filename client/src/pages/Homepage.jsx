// TODO: Add a comment explaining how we are able to extract the key value pairs from props
//this currentPage and handlePageChange were destructed from props

import { useQuery } from '@apollo/client';
import React from 'react';
//import CoffeeList from './CoffeeList';
//import { QUERY_COFFEEHOUSES } from '../utils/queries';
import CoffeeHouseProvider from '../utils/CoffeeHouseContext';
import CoffeeHouseList from '../pages/CoffeeHouseList';
import { useTheme } from '../utils/ThemeContext';
import {useDonationDATA_CONTEXT} from '../utils/DonationContext';



function Homepage()  {

   const { darkTheme, toggleTheme } = useTheme();

  // Remove background image by not setting any backgroundImage property

  const handleToggleTheme = () => {
    toggleTheme();
  };


  return (
    <main>
     
    <div>

      

        
      <CoffeeHouseProvider>
        <CoffeeHouseList />
      </CoffeeHouseProvider>
   
 
      </div>
    </main>
  );
}

export default Homepage;


