import React from 'react';
import Webcam from "react-webcam";
import firebase from 'firebase';
import { loadModels, getFullFaceDescription, createMatcher } from '../api/face';
import swal from 'sweetalert';
import { useHistory } from 'react-router-dom';
import styles from './../styles.module.css';
import background from './../bg_images/bg7.jpg';

const ValidatePage = () => {
  const [buttonfield, setbuttonfield] = React.useState(true);
  const [imgSrc, setImgSrc] = React.useState(null);
  const [status, setStatus] = React.useState(null);
  const [ready, setReady] = React.useState(false); // models + descriptors loaded

  const webcamRef = React.useRef(null);
  const history = useHistory();
  const faceMatcherRef = React.useRef(null);

  if (document.addEventListener) {
    document.addEventListener('contextmenu', e => e.preventDefault(), false);
  }

  navigator.getMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
  );

  // Load models and build face matcher from Firebase descriptors
  React.useEffect(() => {
    const init = async () => {
      await loadModels();

      const name = sessionStorage.getItem('checkname') || '';
      const userData = JSON.parse(localStorage.getItem('intelliproc_user') || '{}');
      const uid = userData.uid;

      let profile = null;

      // Try to load this student's own descriptors from Firebase
      if (uid) {
        try {
          const snap = await firebase.database()
            .ref('users/' + uid + '/faceDescriptors')
            .once('value');
          const descriptors = snap.val();
          if (descriptors && descriptors.length > 0) {
            profile = {
              [name]: { name, descriptors }
            };
          }
        } catch (e) {
          console.log('Firebase descriptor fetch failed:', e);
        }
      }

      // Fallback: use bnk48.json if no Firebase descriptors found
      if (!profile) {
        profile = require('../descriptors/bnk48.json');
      }

      faceMatcherRef.current = await createMatcher(profile);
      setReady(true);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  var imageSrc;
  const capture = async () => {
    if (!ready) {
      swal('Please wait', 'Face recognition models are still loading.', 'info');
      return;
    }
    setStatus('processing');

    let descriptors = null;
    try {
      if (webcamRef.current) {
        imageSrc = webcamRef.current.getScreenshot();
        const fullDesc = await getFullFaceDescription(imageSrc);
        if (fullDesc && fullDesc.length > 0) {
          descriptors = fullDesc.map(fd => fd.descriptor);
        }
      }
    } catch (err) {
      setStatus(null);
      swal('Camera error', 'Please allow webcam access and try again.', 'error');
      return;
    }

    let match = null;
    if (descriptors && faceMatcherRef.current) {
      match = descriptors.map(d => faceMatcherRef.current.findBestMatch(d));
    }

    setImgSrc(imageSrc);
    sessionStorage.setItem('imageSrc', imageSrc);

    const name = sessionStorage.getItem('checkname');

    navigator.getMedia({ video: true }, function () {
      const matched = match && match.length > 0 && match[0]._label === name;

      if (!matched) {
        setStatus('fail');
        swal({
          title: 'Student not recognized as ' + name,
          text: 'You cannot proceed unless you are the authorized student.',
          icon: 'error',
          buttons: {
            cancel: 'OK',
            confirm: { text: 'Confirm as Guest', value: 'guest', visible: true }
          }
        }).then(value => {
          if (value === 'guest') {
            sessionStorage.setItem('checkname', 'Guest User');
            sessionStorage.setItem('flag', 1);
            setbuttonfield(false);
            setStatus('success');
            swal('Proceeding as Guest', 'You can now proceed to the exam.', 'success');
          } else {
            setbuttonfield(true);
          }
        });
      } else {
        setStatus('success');
        swal('Success', 'Student recognized as ' + name);
        setbuttonfield(false);
      }
    }, function () {
      setStatus(null);
      setbuttonfield(true);
      swal('Camera access denied', 'Please allow webcam access to proceed.', 'error');
    });
  };

  const handleClick = () => history.push('/systemcheck');

  const statusBadge = () => {
    if (status === 'processing') return <span style={badge('#f59e0b')}>⏳ Analyzing face...</span>;
    if (status === 'success') return <span style={badge('#10b981')}>✓ Identity verified</span>;
    if (status === 'fail') return <span style={badge('#ef4444')}>✗ Face not matched</span>;
    return null;
  };

  return (
    <div>
      <div style={{ backgroundImage: 'url(' + background + ')' }} className={styles.bg} />
      <div style={pageWrap}>

        <div style={headerBox}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '0.5px' }}>
            Facial Biometric Verification
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '14px', opacity: 0.8 }}>
            Position your face clearly in the webcam frame, then click Capture Photo
          </p>
          {!ready && (
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#f59e0b' }}>
              ⏳ Loading face recognition models…
            </p>
          )}
        </div>

        <div style={stepsRow}>
          {['Position Face', 'Capture Photo', 'Verify Identity', 'Proceed'].map((s, i) => (
            <div key={i} style={stepItem}>
              <div style={stepCircle(i)}>{i + 1}</div>
              <span style={{ fontSize: '12px', marginTop: '4px', color: 'rgba(255,255,255,0.75)' }}>{s}</span>
            </div>
          ))}
        </div>

        <div style={panelsRow}>
          <div style={card}>
            <div style={cardHeader}>
              <span style={dot('#10b981')} /> Live Camera
            </div>
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={webcamStyle} />
          </div>

          <div style={card}>
            <div style={cardHeader}>
              <span style={dot(status === 'success' ? '#10b981' : status === 'fail' ? '#ef4444' : '#6b7280')} />
              Captured Image
              {status && <span style={{ marginLeft: 'auto' }}>{statusBadge()}</span>}
            </div>
            {imgSrc ? (
              <img src={imgSrc} alt="captured" style={webcamStyle} />
            ) : (
              <div style={placeholder}>
                <span style={{ fontSize: '48px' }}>📷</span>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                  No image captured yet
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={buttonsRow}>
          <button onClick={capture} disabled={!ready} style={btnCapture(!ready)}>
            📸 &nbsp;Capture Photo
          </button>
          <button onClick={handleClick} disabled={buttonfield} style={btnConfirm(buttonfield)}>
            ✓ &nbsp;Confirm &amp; Proceed to Exam
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Styles ── */
const pageWrap = { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 20px', boxSizing: 'border-box' };
const headerBox = { textAlign: 'center', color: 'white', marginBottom: '24px' };
const stepsRow = { display: 'flex', gap: '40px', marginBottom: '28px', alignItems: 'flex-start' };
const stepItem = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' };
const stepCircle = i => ({ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: i < 2 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.4)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' });
const panelsRow = { display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '960px' };
const card = { background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', padding: '16px', flex: '1 1 380px', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '12px' };
const cardHeader = { display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 600, fontSize: '15px' };
const dot = color => ({ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color, display: 'inline-block', flexShrink: 0 });
const webcamStyle = { width: '100%', borderRadius: '10px', display: 'block' };
const placeholder = { width: '100%', aspectRatio: '4/3', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const buttonsRow = { display: 'flex', gap: '16px', marginTop: '28px', flexWrap: 'wrap', justifyContent: 'center' };
const btnCapture = disabled => ({ padding: '12px 28px', fontSize: '15px', fontWeight: 600, borderRadius: '10px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', backgroundColor: disabled ? 'rgba(255,255,255,0.15)' : '#3b82f6', color: disabled ? 'rgba(255,255,255,0.4)' : 'white' });
const btnConfirm = disabled => ({ padding: '12px 28px', fontSize: '15px', fontWeight: 600, borderRadius: '10px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', backgroundColor: disabled ? 'rgba(255,255,255,0.15)' : '#10b981', color: disabled ? 'rgba(255,255,255,0.4)' : 'white' });
const badge = color => ({ backgroundColor: color + '22', color, border: `1px solid ${color}55`, borderRadius: '20px', padding: '2px 10px', fontSize: '12px', fontWeight: 600 });

export default ValidatePage;
