import { auth } from "../config";
import React, { useState } from "react";
//import TextField from "@material-ui/core/TextField";
import { Redirect, useHistory } from "react-router-dom";
import swal from 'sweetalert';
import './Results.css';
import styles from './../styles.module.css';
import logo from './../logo.png';
import background from './../bg_images/bg8.jpg';
import { FaAngleRight } from "react-icons/fa";
import { FaRedo } from "react-icons/fa";
//import Button from '@material-ui/core/Button';

const AdminSignIn = () => {
  const history = useHistory();
  const [currentUser, setCurrentUser] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = e.target.elements;
    try {
      auth.signInWithEmailAndPassword(email.value, password.value)
        .then(() => {
          setCurrentUser(true);
        })
        .catch((error) => {
          let message = "Unable to sign in. Please try again.";
          const errorCode = error && (error.code || error?.response?.data?.error?.message);
          const errorMsg = error && (error.message || error?.response?.data?.error?.message);

          switch (errorCode) {
            case 'auth/user-not-found':
              message = 'Teacher not registered. Please contact admin to register.';
              break;
            case 'auth/wrong-password':
              message = 'Incorrect password. Please try again.';
              break;
            case 'auth/invalid-email':
              message = 'Invalid email address. Please check and try again.';
              break;
            case 'auth/too-many-requests':
              message = 'Too many failed attempts. Please wait and try again later.';
              break;
            case 'INVALID_LOGIN_CREDENTIALS':
            case 'INVALID_PASSWORD':
              message = 'Invalid email or password. Please try again.';
              break;
            default:
              message = errorMsg || message;
          }
          swal(message);
        });

    } catch (error) {
      alert(error.message || error);
    }
  };

  if (currentUser) {
    return <Redirect to="/admin" />;
  }

  // const handleLogout=() =>{
  //   config.auth.signOut();
  // };

  return (
    <><div style={{ backgroundImage: "url(" + background + ")" }} className={styles.bg}>

    </div>
      <div className={styles.appHeader}>
        <img src={logo} alt="logo" height="200" margin="0" className={styles.circle} /><br />
        <h2 style={{ color: 'white' }}>Sign In</h2><br />

        <form onSubmit={handleSubmit}>
          <label htmlFor="email" style={{ color: 'white', fontSize: '20px' }}>Email: </label><br />
          <input type="email"
            name="email"
            id="email"
            placeholder="Enter email"
            className="form-control-lg"
            autoComplete="email"
            autoFocus />
          <br /><br />

          <label htmlFor="password" style={{ color: 'white', fontSize: '20px' }}>Password: </label><br />
          <input type="password"
            name="password"
            id="password"
            placeholder="Password"
            autoComplete="current-password"
            className="form-control-lg" />
          <br /><br />

          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '30px 0' }}>
            <button type="reset" className="btn btn-primary"><FaRedo /> Reset</button>
            <button type="submit" className="btn btn-success">Submit <FaAngleRight /></button>
            {/* <input type="submit" className="btn btn-success"/> */}
          </div>
        </form>
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <button type="button" className="btn btn-link" style={{ color: 'white' }} onClick={() => history.push('/register')}>
            Not registered? Create a teacher account
          </button>
        </div>
      </div></>
  );
}

export default AdminSignIn;