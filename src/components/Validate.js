import React from 'react'
import Webcam from "react-webcam";
import { loadModels, getFullFaceDescription, createMatcher } from '../api/face';
import swal from 'sweetalert';
import { useHistory } from 'react-router-dom';
import styles from './../styles.module.css';
import background from './../bg_images/bg7.jpg';

const ValidatePage = () => {
  const [buttonfield, setbuttonfield] = React.useState(true);
  const [imgSrc, setImgSrc] = React.useState(null);
  const [status, setStatus] = React.useState(null); // 'success' | 'fail' | 'processing'

  if (document.addEventListener) {
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); }, false);
  }

  navigator.getMedia = (
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
  );

  const JSON_PROFILE = require('../descriptors/bnk48.json');

  const INIT_STATE = {
    imageURL: 'https://miro.medium.com/max/800/1*NOhvBhAvNH8EddaPhnMxiw.jpeg',
    fullDesc: null, detections: null, descriptors: null, match: null
  };

  var state = { ...INIT_STATE, faceMatcher: null };
  const webcamRef = React.useRef(null);
  const history = useHistory();

  const handleImage = async (image = state.imageURL) => {
    await getFullFaceDescription(image).then(fullDesc => {
      if (!!fullDesc) {
        state.fullDesc = fullDesc;
        state.detections = fullDesc.map(fd => fd.detection);
        state.descriptors = fullDesc.map(fd => fd.descriptor);
      }
    });
    if (!!state.descriptors && !!state.faceMatcher) {
      state.match = await state.descriptors.map(d => state.faceMatcher.findBestMatch(d));
    }
  };

  const componentWillMount = async () => {
    await loadModels();
    state.faceMatcher = await createMatcher(JSON_PROFILE);
    await handleImage(state.imageURL);
  };
  componentWillMount();

  var imageSrc;
  const capture = async () => {
    setStatus('processing');
    try {
      if (!!webcamRef.current) {
        await getFullFaceDescription(
          imageSrc = webcamRef.current.getScreenshot()
        ).then(fullDesc => {
          if (!!fullDesc) {
            state.fullDesc = fullDesc;
            state.detections = fullDesc.map(fd => fd.detection);
            state.descriptors = fullDesc.map(fd => fd.descriptor);
          }
        });
      }
    } catch (err) {
      setStatus(null);
      swal("Camera access denied", "Please provide access to your web camera to proceed.", "error");
      return;
    }

    if (!!state.descriptors && !!state.faceMatcher) {
      state.match = state.descriptors.map(d => state.faceMatcher.findBestMatch(d));
    }

    setImgSrc(imageSrc);
    sessionStorage.setItem("imageSrc", imageSrc);

    const name = sessionStorage.getItem("checkname");

    navigator.getMedia({ video: true }, function () {
      if (state.match == null || state.match === 0 || state.match[0]._label !== name) {
        setStatus('fail');
        swal({
          title: "Student not recognized as " + name,
          text: "You cannot proceed unless you are the authorized student.",
          icon: "error",
          buttons: {
            cancel: "OK",
            confirm: { text: "Confirm as Guest", value: "guest", visible: true }
          }
        }).then((value) => {
          if (value === "guest") {
            sessionStorage.setItem("checkname", "Guest User");
            sessionStorage.setItem("flag", 1);
            setbuttonfield(false);
            setStatus('success');
            swal("Proceeding as Guest", "You can now proceed to the exam.", "success");
          } else {
            setbuttonfield(true);
          }
        });
      } else {
        setStatus('success');
        swal("Success", "Student recognized as " + name);
        setbuttonfield(false);
      }
    }, function () {
      setStatus(null);
      setbuttonfield(true);
      swal("Camera access denied", "Please provide access to your web camera to proceed.", "error");
    });
  };

  const handleClick = () => history.push("/systemcheck");

  const statusBadge = () => {
    if (status === 'processing') return (
      <span style={badge('#f59e0b')}>⏳ Analyzing face...</span>
    );
    if (status === 'success') return (
      <span style={badge('#10b981')}>✓ Identity verified</span>
    );
    if (status === 'fail') return (
      <span style={badge('#ef4444')}>✗ Face not matched</span>
    );
    return null;
  };

  return (
    <div>
      <div style={{ backgroundImage: "url(" + background + ")" }} className={styles.bg} />

      <div style={pageWrap}>
        {/* Header */}
        <div style={headerBox}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, letterSpacing: '0.5px' }}>
            Facial Biometric Verification
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '14px', opacity: 0.8 }}>
            Position your face clearly in the webcam frame, then click Capture Photo
          </p>
        </div>

        {/* Steps */}
        <div style={stepsRow}>
          {['Position Face', 'Capture Photo', 'Verify Identity', 'Proceed'].map((s, i) => (
            <div key={i} style={stepItem}>
              <div style={stepCircle(i)}>{i + 1}</div>
              <span style={{ fontSize: '12px', marginTop: '4px', color: 'rgba(255,255,255,0.75)' }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Camera panels */}
        <div style={panelsRow}>
          {/* Webcam panel */}
          <div style={card}>
            <div style={cardHeader}>
              <span style={dot('#10b981')} />
              Live Camera
            </div>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              style={webcamStyle}
            />
          </div>

          {/* Captured image panel */}
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

        {/* Buttons */}
        <div style={buttonsRow}>
          <button onClick={capture} style={btnCapture}>
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
const pageWrap = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '30px 20px',
  boxSizing: 'border-box',
};

const headerBox = {
  textAlign: 'center',
  color: 'white',
  marginBottom: '24px',
};

const stepsRow = {
  display: 'flex',
  gap: '40px',
  marginBottom: '28px',
  alignItems: 'flex-start',
};

const stepItem = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
};

const stepCircle = (i) => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: i < 2 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
  border: '2px solid rgba(255,255,255,0.4)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '14px',
});

const panelsRow = {
  display: 'flex',
  gap: '24px',
  flexWrap: 'wrap',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '960px',
};

const card = {
  background: 'rgba(0,0,0,0.55)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.15)',
  padding: '16px',
  flex: '1 1 380px',
  maxWidth: '440px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const cardHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'white',
  fontWeight: 600,
  fontSize: '15px',
};

const dot = (color) => ({
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: color,
  display: 'inline-block',
  flexShrink: 0,
});

const webcamStyle = {
  width: '100%',
  borderRadius: '10px',
  display: 'block',
};

const placeholder = {
  width: '100%',
  aspectRatio: '4/3',
  background: 'rgba(255,255,255,0.05)',
  borderRadius: '10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const buttonsRow = {
  display: 'flex',
  gap: '16px',
  marginTop: '28px',
  flexWrap: 'wrap',
  justifyContent: 'center',
};

const btnCapture = {
  padding: '12px 28px',
  fontSize: '15px',
  fontWeight: 600,
  borderRadius: '10px',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: '#3b82f6',
  color: 'white',
  transition: 'opacity 0.2s',
};

const btnConfirm = (disabled) => ({
  padding: '12px 28px',
  fontSize: '15px',
  fontWeight: 600,
  borderRadius: '10px',
  border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  backgroundColor: disabled ? 'rgba(255,255,255,0.15)' : '#10b981',
  color: disabled ? 'rgba(255,255,255,0.4)' : 'white',
  transition: 'all 0.2s',
});

const badge = (color) => ({
  backgroundColor: color + '22',
  color: color,
  border: `1px solid ${color}55`,
  borderRadius: '20px',
  padding: '2px 10px',
  fontSize: '12px',
  fontWeight: 600,
});

export default ValidatePage;
