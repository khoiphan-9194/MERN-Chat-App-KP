import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import {USER_LOGIN} from '../utils/mutations';
import { Form, Button, Alert } from 'react-bootstrap';


import Auth from '../utils/auth';

const Login = () => {
  const [formState, setFormState] = useState({ userEmail: '', password: '' });
  const [login, { error, data }] = useMutation(USER_LOGIN);
  const [validated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // update state based on form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // submit form
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log(formState);
    try {
      const { data } = await login({
        variables: { ...formState },
      });

      if(!data) {
        throw new Error('something went wrong!');
      }
      const { token, user } = data.userLogin;
      console.log(user)
      console.log(token)
      Auth.login(token);
      console.log(token);
    } catch (e) {
      console.error(e);
    }

    // clear form values
    setFormState({
      userEmail: '',
      password: '',
    });
  };

  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        <Alert
          dismissible
          onClose={() => setShowAlert(false)}
          show={showAlert}
          variant='danger'
          style={{ color: 'white', backgroundColor: '#dc3545', borderColor: '#dc3545' }}
        >
          Something went wrong with your login credentials!
        </Alert>
        <Form.Group className='mb-3'>
          <Form.Label htmlFor='userEmail' style={{ color: 'white' }}>Email</Form.Label>
          <Form.Control
            type='text'
            placeholder='Your email'
            name='userEmail'
            onChange={handleChange}
            value={formState.userEmail}
            required
            style={{ color: 'black', backgroundColor: 'white', borderColor: '#444' }}
          />
          <Form.Control.Feedback type='invalid' style={{ color: 'white' }}>Email is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='password' style={{ color: 'white' }}>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Your password'
            name='password'
            onChange={handleChange}
            value={formState.password}
            required
            style={{ color: 'black', backgroundColor: 'white', borderColor: '#444' }}
          />
          <Form.Control.Feedback type='invalid' style={{ color: 'white' }}>Password is required!</Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={!(formState.userEmail && formState.password)}
          type='submit'
          variant='success'
          style={{ color: 'white' }}
        >
          Submit
        </Button>
      </Form>

      {error && (
        <div className="my-3 p-3 bg-danger text-white">
          {error.message}
        </div>
      )}
      {data ? (
        <p className="my-3 p-3 bg-success text-white">
          Success! You may now head{' '}
          <Link to="/" style={{ color: 'white', textDecoration: 'underline' }}>back to the homepage</Link>.
        </p>
      ) : (
        <p className="my-3 p-3 bg-info text-white">
          Please login to continue.
        </p>
      )}
    </>
  );
};

export default Login;


/*
    <input
                  className="form-input"
                  placeholder="Your userEmail"
                  name="userEmail"
                  type="userEmail"
                  value={formState.userEmail}
                  onChange={handleChange}
                />
                <input
                  className="form-input"
                  placeholder="******"
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleChange}
                />
*/