import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import firebase from 'firebase';
import auth from './Auth';
import swal from 'sweetalert';
import styles from './../styles.module.css';
import logo from './../logo.png';
import background from './../bg_images/bg1.jpg';

const RegisterPage = () => {
  const history = useHistory();
  const location = useLocation();
  const { uid, name: googleName, email: googleEmail } = location.state || {};

  // Guard: if landed here without Google auth state, go back to login
  React.useEffect(() => {
    if (!uid) history.replace('/login');
  }, [uid, history]);

  const [form, setForm] = React.useState({
    name: googleName || '',
    college: '',
    email: googleEmail || '',
    mobile: '',
  });
  const [saving, setSaving] = React.useState(false);

  const set = field => e => {
    const value = e.target.value;
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.college.trim() || !form.mobile.trim()) {
      swal('Incomplete', 'Please fill all the fields.', 'warning');
      return;
    }
    if (!/^\d{10}$/.test(form.mobile.trim())) {
      swal('Invalid', 'Mobile number must be exactly 10 digits.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const userData = {
        uid,
        name: form.name.trim(),
        college: form.college.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        createdAt: new Date().toISOString(),
      };

      await firebase.database().ref('users/' + uid).set(userData);

      localStorage.setItem('intelliproc_user', JSON.stringify(userData));
      sessionStorage.setItem('checkname', userData.name);
      sessionStorage.setItem('checkemail', userData.email);
      auth.login();

      history.push('/enroll');
    } catch (err) {
      swal('Error', 'Could not save your profile. Please try again.', 'error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ backgroundImage: 'url(' + background + ')' }} className={styles.bg} />

      <div style={pageWrap}>
        <img src={logo} alt="logo" height="100" style={logoStyle} />
        <h2 style={titleStyle}>Complete Your Profile</h2>
        <p style={subtitleStyle}>Just a few details before you proceed</p>

        <form onSubmit={handleSubmit} style={cardStyle}>
          <Field
            label="Full Name"
            value={form.name}
            onChange={set('name')}
            placeholder="As shown in your Google account"
          />
          <Field
            label="College / Institution Name"
            value={form.college}
            onChange={set('college')}
            placeholder="e.g. ABC Engineering College"
          />
          <Field
            label="Email Address"
            value={form.email}
            onChange={set('email')}
            placeholder="Your email"
            type="email"
            disabled
          />
          <Field
            label="Mobile Number"
            value={form.mobile}
            onChange={set('mobile')}
            placeholder="10-digit mobile number"
            type="tel"
            maxLength={10}
          />

          <button type="submit" disabled={saving} style={btnSubmit(saving)}>
            {saving ? '⏳ Saving…' : 'Save & Proceed to Face Enrollment →'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder, type = 'text', disabled, maxLength }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={labelStyle}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      style={inputStyle(disabled)}
      required
    />
  </div>
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
const titleStyle = { color: 'white', margin: '0 0 6px', fontSize: '24px', fontWeight: 700 };
const subtitleStyle = { color: 'rgba(255,255,255,0.65)', margin: '0 0 28px', fontSize: '14px' };
const cardStyle = {
  background: 'rgba(0,0,0,0.55)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '20px',
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  maxWidth: '480px',
  width: '100%',
};
const labelStyle = { color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: 600 };
const inputStyle = disabled => ({
  padding: '11px 14px',
  fontSize: '15px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.2)',
  background: disabled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
  color: disabled ? 'rgba(255,255,255,0.4)' : 'white',
  outline: 'none',
  boxSizing: 'border-box',
  width: '100%',
  cursor: disabled ? 'not-allowed' : 'text',
});
const btnSubmit = disabled => ({
  marginTop: '8px',
  padding: '13px 24px',
  fontSize: '15px',
  fontWeight: 700,
  borderRadius: '10px',
  border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  backgroundColor: disabled ? 'rgba(255,255,255,0.15)' : '#3b82f6',
  color: disabled ? 'rgba(255,255,255,0.4)' : 'white',
});

export default RegisterPage;
