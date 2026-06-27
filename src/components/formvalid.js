import React, { useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/database';
import config from '../config';
import { useHistory } from 'react-router-dom'
import "./formvalid.css"
import styles from './../styles.module.css';
import logo from './../logo.png';
import background from './../bg_images/bg5.jpg';
import swal from 'sweetalert';

const Formvalid = () => {
  const history = useHistory();

  //Disable Right click
  if (document.addEventListener) {
    document.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    }, false);
  }

  const [formvalid, setFormvalid] = useState('');

  function onChangeformvalid(e) {
    setFormvalid(e.target.value);
  }

  function handleClickformvalid() {
    if (!formvalid || !formvalid.trim()) {
      swal("Invalid Exam Code", "Please enter an exam code.", "error");
      return;
    }
    firebase.database().ref("exam_records").once('value').then((snapshot) => {
      const s = snapshot.val();
      const d = s ? s[formvalid] : null;
      if (d != null) {
        const exam_timer = d["duration"];
        sessionStorage.setItem("exam_timer", exam_timer);
        sessionStorage.setItem("formvalid", formvalid);
        sessionStorage.setItem("proctortype", d["proctortype"]);
        history.push("/dashboard");
      } else {
        swal("Invalid Exam Code", "Please enter a valid exam code.", "error");
      }
    }).catch((error) => {
      console.error('Firebase exam_records lookup failed:', error);
      swal("Database Error", error.message || "Unable to validate exam code.", "error");
    });
  };

  return (
    <><div style={{ backgroundImage: "url(" + background + ")" }} className={styles.bg}> </div>
      <div className={styles.appHeader}>
        <img src={logo} alt="logo" height="200" margin="0" className={styles.circle} /><br />
        <h2 style={{ color: 'white' }}>
          <i>Welcome Student!</i>
        </h2><br />

        <div style={{ padding: '0 63px' }}>
          <label style={{ color: 'white', fontSize: '20px' }}>Enter exam code to proceed: </label>
          <input type="text"
            name="formvalid"
            id="formvalid"
            placeholder="Exam Code"
            value={formvalid}
            onChange={onChangeformvalid}
            class="form-control-lg"
            autofocus />
          <br /><br />


          <div style={{ display: 'flex', justifyContent: 'space-evenly', margin: '30px 0' }}>
            <button class="btn btn-primary" onClick={handleClickformvalid} style={{ width: '100%' }}>Submit</button>
          </div>
        </div>

      </div></>

  )
}

export default Formvalid;