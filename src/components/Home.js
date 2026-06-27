import React from 'react';
import { useHistory } from 'react-router-dom';
import logo from './../logo.png';
import './../App.css';
import styles from './../styles.module.css';
import background from './../bg_images/bg2.jpg';
import Button from '@material-ui/core/Button';
import auth from './Auth';

const MainPage = () => {
  const history = useHistory();

  const isLoggedIn = auth.isAuthenticated();
  const userData = JSON.parse(localStorage.getItem('intelliproc_user') || '{}');
  const name = sessionStorage.getItem('checkname') || userData.name || '';

  const handleExamLogin = () => {
    if (isLoggedIn) {
      // Already registered — go to system check to start exam
      history.push('/systemcheck');
    } else {
      history.push('/login');
    }
  };

  const handleLogout = () => {
    auth.logout();
    sessionStorage.clear();
    history.push('/login');
  };

  return (
    <>
      <div style={{ backgroundImage: 'url(' + background + ')' }} className={styles.bg} />
      <header className={styles.appHeader}>
        <img src={logo} alt="logo" height="250" margin="0" className={styles.circle} /><br />
        <p>Welcome to IntelliProc</p>
        <small>Dual camera based proctoring system</small><br /><br />

        {isLoggedIn && name && (
          <small style={{ color: '#a5f3fc', marginBottom: '12px', display: 'block' }}>
            Signed in as <b>{name}</b>
          </small>
        )}

        <Button
          id="homeButtons"
          style={{ fontSize: '15px' }}
          variant="contained"
          size="medium"
          onClick={handleExamLogin}
        >
          {isLoggedIn ? 'Start Exam' : 'Student Exam Login'}
        </Button>

        {isLoggedIn && (
          <Button
            id="homeButtons"
            style={{ fontSize: '13px', marginTop: '10px', backgroundColor: '#ef4444', color: 'white' }}
            variant="contained"
            size="small"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        )}
      </header>
    </>
  );
};

export default MainPage;
