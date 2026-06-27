import React from 'react';
import { useHistory } from 'react-router-dom'
import auth from './Auth';
import swal from 'sweetalert';
import styles from './../styles.module.css';
import logo from './../logo.png';
import background from './../bg_images/bg1.jpg';
import firebase from 'firebase';
import { auth as firebaseAuth } from './../config';

const LoginPage = () => {

  if (document.addEventListener) {
    document.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    }, false);
  }

  const history = useHistory();

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebaseAuth.signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        sessionStorage.setItem("checkname", user.displayName);
        sessionStorage.setItem("checkemail", user.email);
        auth.login(() => {
          history.push("/systemcheck");
        });
      })
      .catch((error) => {
        swal("Login Failed", error.code + ': ' + error.message, "error");
        console.log('Auth error:', error.code, error.message);
      });
  };

  return (
    <div>
      <div style={{ backgroundImage: "url(" + background + ")" }} className={styles.bg}> </div>
      <div className={styles.appHeader}>
        <img src={logo} alt="logo" height="250" margin="0" className={styles.circle} /><br />
        <h2 style={{ color: 'white' }}>Sign In</h2>
        <small>Use your Gmail account</small><br /><br />
        <button
          onClick={signInWithGoogle}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 20px', fontSize: '16px', cursor: 'pointer',
            backgroundColor: 'white', border: '1px solid #dadce0',
            borderRadius: '4px', fontFamily: 'Roboto, sans-serif',
            margin: '0 auto'
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style={{ width: '20px', height: '20px' }}
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
