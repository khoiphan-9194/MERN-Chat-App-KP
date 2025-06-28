import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { useEffect, useState} from "react";
import { useLazyQuery } from '@apollo/client';
import {useDonationDATA_CONTEXT} from '../utils/DonationContext';






function DonationDetail() {
  const {donationData, setDonationData} = useDonationDATA_CONTEXT();
  const [formState, setFormState] = useState({ nameOfdonator: '', donationAmount:'', message: '' });
  useEffect(() => {
    setFormState({
      nameOfdonator: donationData.nameOfdonator,
      donationAmount: donationData.donationAmount,
      message: donationData.message
    });
  }
  , [donationData]);
  
  return (
    <>
      <h1>
        Donation Details
        <br />
        Donator Name: {formState.nameOfdonator}
        <br />
        Donation Amount: {formState.donationAmount}
        <br />
        Message: {formState.message}
      </h1>

      
    </>
  );
}

export default DonationDetail;


