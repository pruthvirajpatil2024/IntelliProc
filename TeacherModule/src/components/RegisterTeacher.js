import React, { useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import { auth } from '../config';
import swal from 'sweetalert';
import './Results.css';
import styles from './../styles.module.css';
import logo from './../logo.png';
import background from './../bg_images/bg8.jpg';
import { FaAngleRight } from 'react-icons/fa';
import { FaRedo } from 'react-icons/fa';

const TEACHER_REGISTRATION_CODE = 'TEACHER-2026';

const RegisterTeacher = () => {
  const history = useHistory();
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !adminCode) {
      swal('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      swal('Passwords do not match.');
      return;
    }

    if (adminCode !== TEACHER_REGISTRATION_CODE) {
      swal('Invalid registration code. Please contact the admin for the correct code.');
      return;
    }

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        setCurrentUser(userCredential.user);
        swal('Registration successful. You are now signed in.');
      })
      .catch((error) => {
        let message = 'Unable to register. Please try again.';
        if (error && error.code) {
          switch (error.code) {
            case 'auth/email-already-in-use':
              message = 'This email is already registered. Please sign in instead.';
              break;
            case 'auth/invalid-email':
              message = 'Invalid email address. Please check and try again.';
              break;
            case 'auth/weak-password':
              message = 'Password should be at least 6 characters.';
              break;
            default:
              message = error.message || message;
          }
        }
        swal(message);
      });
  };

  if (currentUser) {
    return <Redirect to="/admin" />;
  }

  return (
    <>
      <div style={{ backgroundImage: 'url(' + background + ')' }} className={styles.bg}></div>
      <div className={styles.appHeader}>
        <img src={logo} alt="logo" height="200" margin="0" className={styles.circle} /><br />
        <h2 style={{ color: 'white' }}><i>Teacher Registration</i></h2><br />

        <form onSubmit={handleSubmit}>
          <label htmlFor="email" style={{ color: 'white', fontSize: '20px' }}>Email: </label><br />
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Teacher email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control-lg"
            autoComplete="email"
            autoFocus
          />
          <br /><br />

          <label htmlFor="password" style={{ color: 'white', fontSize: '20px' }}>Password: </label><br />
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control-lg"
            autoComplete="new-password"
          />
          <br /><br />

          <label htmlFor="confirmPassword" style={{ color: 'white', fontSize: '20px' }}>Confirm Password: </label><br />
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-control-lg"
            autoComplete="new-password"
          />
          <br /><br />

          <label htmlFor="adminCode" style={{ color: 'white', fontSize: '20px' }}>Admin Code: </label><br />
          <input
            type="text"
            name="adminCode"
            id="adminCode"
            placeholder="Enter registration code"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            className="form-control-lg"
          />
          <br /><br />

          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '30px 0' }}>
            <button type="reset" className="btn btn-primary"><FaRedo /> Reset</button>
            <button type="submit" className="btn btn-success">Register <FaAngleRight /></button>
          </div>
        </form>

        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <button type="button" className="btn btn-link" style={{ color: 'white' }} onClick={() => history.push('/adminsignin')}>
            Already registered? Sign in
          </button>
        </div>
      </div>
    </>
  );
};

export default RegisterTeacher;
