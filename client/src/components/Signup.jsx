import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Alert, Modal } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { USER_SIGNUP } from '../utils/mutations';
import Auth from '../utils/auth';

const Signup = () => {
  // set initial form state
  const [userFormData, setUserFormData] = useState({ userName: '', userEmail: '', password: '' });
  const [signedUpUserName, setSignedUpUserName] = useState('');
  // set state for form validation
  const [validated] = useState(false);
  // set state for alert
  const [showAlert, setShowAlert] = useState(false);

  // SETUP THE ADD_USER MUTATION
  const [addUser, { error, data }] = useMutation(USER_SIGNUP);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  }


  const handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log(userFormData);
    // check if form has everything (as per react-bootstrap docs)
    try {

  
      const { data } = await addUser({
        variables: { ...userFormData },
      });

      console.log(data);

      if (!data) {
        throw new Error('something went wrong!');
      }

      const { token, user } = data.addUser;
      
      console.log(user);
      console.log(token)
    
      Auth.login(token);
    
   
      


    }
    catch (err) {
      console.error(err);
      
      setShowAlert(true);
    }
    console.log(Auth.loggedIn());
    // clear form values

    setSignedUpUserName(userFormData.userName);
 
    setUserFormData({
      userName: '',
      userEmail: '',
      password: '',
    });


  };

  const handleClose = () => {
    setSignedUpUserName('');
    // If you are using a Modal, control its visibility with state instead of Modal.hide()
    // For now, this just resets the signedUpUserName
  }



  
  
  return (
  
    <main className="flex-row justify-center mb-4">
      <div className="col-12 col-lg-12">
        <div className="card">
          <h4 className="card-header bg-dark text-light p-2">Sign Up</h4>
          <div className="card-body">
            {data ? (
            <h4 className="card-header bg-dark text-light p-2">
              
              Welcome {signedUpUserName}!
              Your signup was successful!
              
            </h4>
          ) : (
              <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        {/* show alert if server response is bad */}
        <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
          Something went wrong with your signup!
        </Alert>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='userName'>Username</Form.Label>
          <Form.Control
            type='text'
            placeholder='Your Username'
            name='userName'
            onChange={handleInputChange}
            value={userFormData.userName}
            required
          />
          <Form.Control.Feedback type='invalid'>Username is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='userEmail'>Email</Form.Label>
          <Form.Control
            type='userEmail'
            placeholder='Your email address'
            name='userEmail'
            onChange={handleInputChange}
            value={userFormData.userEmail}
            required
          />
          <Form.Control.Feedback type='invalid'>userEmail is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='password'>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Your password'
            name='password'
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={!(userFormData.userName && userFormData.userEmail && userFormData.password)}
          type='submit'
          variant='success'>
          Submit
        </Button>
      </Form>
            )}

            {error && (
              <div className="my-3 p-3 bg-danger text-white">
                {error.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Signup;
