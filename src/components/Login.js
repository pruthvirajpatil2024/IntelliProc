import React from 'react';
import { useHistory } from 'react-router-dom';
import firebase from 'firebase';
import { auth as firebaseAuth } from './../config';
import auth from './Auth';
import swal from 'sweetalert';
import styles from './../styles.module.css';
import logo from './../logo.png';
import background from './../bg_images/bg1.jpg';

const LoginPage = () => {
  const history = useHistory();
  const [loading, setLoading] = React.useState(false);

  // Already logged in — go straight to dashboard
  React.useEffect(() => {
    if (auth.isAuthenticated()) {
      history.replace('/dashboard');
    }
  }, [history]);

  if (document.addEventListener) {
    document.addEventListener('contextmenu', e => e.preventDefault(), false);
  }

  const handleGoogleAuth = async (isSignUp) => {
    setLoading(true);
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await firebaseAuth.signInWithPopup(provider);
      const user = result.user;

      // Check if this user already has a profile in DB
      const snapshot = await firebase.database().ref('users/' + user.uid).once('value');
      const userData = snapshot.val();

      if (userData) {
        // Returning user — restore session and go to dashboard
        localStorage.setItem('intelliproc_user', JSON.stringify(userData));
        sessionStorage.setItem('checkname', userData.name);
        sessionStorage.setItem('checkemail', userData.email);
        auth.login();
        history.push('/dashboard');
      } else {
        // New user — go to registration form
        history.push('/register', {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
        });
      }
    } catch (error) {
      swal('Authentication Failed', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ backgroundImage: 'url(' + background + ')' }} className={styles.bg} />

      <div style={pageWrap}>
        <img src={logo} alt="logo" height="180" style={logoStyle} />
        <h2 style={titleStyle}>Welcome to IntelliProc</h2>
        <p style={subtitleStyle}>Dual camera proctoring system</p>

        <div style={cardStyle}>
          <div style={sectionStyle}>
            <h3 style={sectionTitle}>New Student</h3>
            <p style={sectionDesc}>First time here? Create your account with Google.</p>
            <button
              onClick={() => handleGoogleAuth(true)}
              disabled={loading}
              style={btn('#3b82f6', loading)}
            >
              <GoogleIcon />
              {loading ? 'Please wait…' : 'Sign Up with Google'}
            </button>
          </div>

          <div style={divider} />

          <div style={sectionStyle}>
            <h3 style={sectionTitle}>Returning Student</h3>
            <p style={sectionDesc}>Already registered? Sign in to continue.</p>
            <button
              onClick={() => handleGoogleAuth(false)}
              disabled={loading}
              style={btn('#10b981', loading)}
            >
              <GoogleIcon />
              {loading ? 'Please wait…' : 'Sign In with Google'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoogleIcon = () => (
  <img
    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
    alt=""
    style={{ width: '18px', height: '18px' }}
  />
);

/* ── Styles ── */
const pageWrap = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '30px 20px',
  boxSizing: 'border-box',
};
const logoStyle = {
  borderRadius: '50%',
  marginBottom: '12px',
  border: '3px solid rgba(255,255,255,0.3)',
};
const titleStyle = {
  color: 'white', margin: '0 0 6px', fontSize: '26px', fontWeight: 700,
};
const subtitleStyle = {
  color: 'rgba(255,255,255,0.65)', margin: '0 0 32px', fontSize: '14px',
};
const cardStyle = {
  background: 'rgba(0,0,0,0.55)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '20px',
  padding: '32px',
  display: 'flex',
  gap: '0',
  flexWrap: 'wrap',
  maxWidth: '680px',
  width: '100%',
};
const sectionStyle = {
  flex: '1 1 220px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: '0 20px',
};
const sectionTitle = {
  color: 'white', margin: '0 0 8px', fontSize: '18px', fontWeight: 700,
};
const sectionDesc = {
  color: 'rgba(255,255,255,0.6)', margin: '0 0 20px', fontSize: '13px', lineHeight: 1.5,
};
const divider = {
  width: '1px',
  background: 'rgba(255,255,255,0.15)',
  margin: '0 8px',
  alignSelf: 'stretch',
  flexShrink: 0,
};
const btn = (color, disabled) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: 600,
  borderRadius: '10px',
  border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  backgroundColor: disabled ? 'rgba(255,255,255,0.15)' : color,
  color: disabled ? 'rgba(255,255,255,0.4)' : 'white',
  width: '100%',
  justifyContent: 'center',
});

export default LoginPage;
