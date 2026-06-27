import React from 'react';
import Webcam from 'react-webcam';
import { useHistory } from 'react-router-dom';
import firebase from 'firebase';
import { loadModels, getFullFaceDescription } from '../api/face';
import swal from 'sweetalert';
import styles from './../styles.module.css';
import background from './../bg_images/bg7.jpg';

const MIN_CAPTURES = 3;

const EnrollPage = () => {
  const history = useHistory();
  const webcamRef = React.useRef(null);
  const [modelsLoaded, setModelsLoaded] = React.useState(false);
  const [captures, setCaptures] = React.useState([]);
  const [processing, setProcessing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [done, setDone] = React.useState(false);

  // Name from session (set during registration)
  const name = sessionStorage.getItem('checkname') || '';

  React.useEffect(() => {
    if (!name) { history.replace('/login'); return; }
    loadModels().then(() => setModelsLoaded(true));
  }, [name, history]);

  const capturePhoto = async () => {
    if (!webcamRef.current) return;
    setError('');
    setProcessing(true);

    try {
      const imgSrc = webcamRef.current.getScreenshot();
      const fullDesc = await getFullFaceDescription(imgSrc);

      if (!fullDesc || fullDesc.length === 0) {
        setError('No face detected. Ensure good lighting and face the camera directly.');
        setProcessing(false);
        return;
      }
      if (fullDesc.length > 1) {
        setError('Multiple faces detected. Only you should be in frame.');
        setProcessing(false);
        return;
      }

      const descriptor = Array.from(fullDesc[0].descriptor);
      setCaptures(prev => [...prev, { imgSrc, descriptor }]);
    } catch (err) {
      setError('Camera error: ' + err.message);
    }
    setProcessing(false);
  };

  const saveAndProceed = async () => {
    setSaving(true);
    try {
      // UID stored in localStorage during registration — more reliable than currentUser
      const stored = JSON.parse(localStorage.getItem('intelliproc_user') || '{}');
      const uid = stored.uid;
      if (!uid) throw new Error('User ID not found. Please log in again.');

      const descriptors = captures.map(c => c.descriptor);

      await firebase.database()
        .ref('users/' + uid + '/faceDescriptors')
        .set(descriptors);

      localStorage.setItem('intelliproc_user', JSON.stringify({ ...stored, faceEnrolled: true }));

      setDone(true);
    } catch (err) {
      swal('Error', err.message || 'Could not save face data. Please try again.', 'error');
      console.error(err);
    }
    setSaving(false);
  };

  if (done) {
    return (
      <div>
        <div style={{ backgroundImage: 'url(' + background + ')' }} className={styles.bg} />
        <div style={{ ...pageWrap, justifyContent: 'center' }}>
          <div style={successCard}>
            <div style={{ fontSize: '60px' }}>✅</div>
            <h2 style={{ color: 'white', margin: '16px 0 8px', fontSize: '24px' }}>
              Enrollment Complete!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 28px', fontSize: '14px' }}>
              Your face has been registered successfully, <b style={{ color: 'white' }}>{name}</b>.
            </p>
            <button onClick={() => history.push('/')} style={btnGo}>
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ backgroundImage: 'url(' + background + ')' }} className={styles.bg} />

      <div style={pageWrap}>
        <div style={headerBox}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'white' }}>
            Face Enrollment
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
            Hi <b>{name}</b> — capture {MIN_CAPTURES} photos so we can recognize you during exams
          </p>
        </div>

        {!modelsLoaded && (
          <div style={infoBanner('#f59e0b')}>⏳ Loading face recognition models…</div>
        )}

        {/* Progress */}
        <div style={progressRow}>
          {Array.from({ length: MIN_CAPTURES }).map((_, i) => (
            <div key={i} style={progressDot(i < captures.length)} />
          ))}
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginLeft: '10px' }}>
            {captures.length} / {MIN_CAPTURES} captured
          </span>
        </div>

        <div style={panelsRow}>
          {/* Webcam */}
          <div style={card}>
            <div style={cardHeader}>
              <span style={dot('#10b981')} /> Live Camera
            </div>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              style={{ width: '100%', borderRadius: '10px' }}
            />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '4px 0 0', textAlign: 'center' }}>
              Tips: Good lighting · Look slightly left/right/tilt between captures
            </p>
            <button
              onClick={capturePhoto}
              disabled={!modelsLoaded || processing || done}
              style={btnCapture(!modelsLoaded || processing)}
            >
              {processing ? '⏳ Analyzing…' : '📸 Capture Photo'}
            </button>
            {error && <div style={infoBanner('#ef4444')}>{error}</div>}
          </div>

          {/* Thumbnails */}
          {captures.length > 0 && (
            <div style={card}>
              <div style={cardHeader}>
                <span style={dot('#3b82f6')} /> Captured ({captures.length})
              </div>
              <div style={thumbGrid}>
                {captures.map((c, i) => (
                  <div key={i} style={thumbWrap}>
                    <img src={c.imgSrc} alt="" style={thumbImg} />
                    <span style={thumbBadge}>✓</span>
                  </div>
                ))}
              </div>

              {captures.length >= MIN_CAPTURES && (
                <>
                  <div style={infoBanner('#10b981')}>
                    ✓ Enough captures! You can add more photos for better accuracy, or save now.
                  </div>
                  <button
                    onClick={saveAndProceed}
                    disabled={saving}
                    style={btnSave(saving)}
                  >
                    {saving ? '⏳ Saving…' : '✓ Save & Go to Dashboard'}
                  </button>
                </>
              )}
            </div>
          )}
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
  gap: '20px',
};
const headerBox = { textAlign: 'center' };
const panelsRow = {
  display: 'flex', gap: '24px', flexWrap: 'wrap',
  justifyContent: 'center', width: '100%', maxWidth: '860px',
};
const card = {
  background: 'rgba(0,0,0,0.55)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.15)',
  padding: '16px',
  flex: '1 1 360px',
  maxWidth: '440px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  color: 'white',
};
const cardHeader = { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '15px' };
const dot = color => ({
  width: '10px', height: '10px', borderRadius: '50%',
  backgroundColor: color, display: 'inline-block', flexShrink: 0,
});
const thumbGrid = { display: 'flex', flexWrap: 'wrap', gap: '8px' };
const thumbWrap = { position: 'relative', width: '80px', height: '60px' };
const thumbImg = { width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' };
const thumbBadge = {
  position: 'absolute', top: '2px', right: '2px',
  background: '#10b981', borderRadius: '50%',
  fontSize: '10px', width: '16px', height: '16px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const progressRow = { display: 'flex', alignItems: 'center', gap: '8px' };
const progressDot = filled => ({
  width: '20px', height: '20px', borderRadius: '50%',
  background: filled ? '#10b981' : 'rgba(255,255,255,0.2)',
  border: '2px solid ' + (filled ? '#10b981' : 'rgba(255,255,255,0.3)'),
  transition: 'all 0.3s',
});
const infoBanner = color => ({
  background: color + '22', border: `1px solid ${color}55`,
  color, borderRadius: '8px', padding: '8px 12px', fontSize: '13px',
});
const btnCapture = disabled => ({
  padding: '11px 20px', fontSize: '14px', fontWeight: 600,
  borderRadius: '10px', border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  backgroundColor: disabled ? 'rgba(255,255,255,0.15)' : '#3b82f6',
  color: disabled ? 'rgba(255,255,255,0.4)' : 'white',
});
const btnSave = disabled => ({
  padding: '12px 20px', fontSize: '14px', fontWeight: 700,
  borderRadius: '10px', border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  backgroundColor: disabled ? 'rgba(255,255,255,0.15)' : '#10b981',
  color: disabled ? 'rgba(255,255,255,0.4)' : 'white',
});
const successCard = {
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '20px',
  padding: '48px 40px',
  textAlign: 'center',
  maxWidth: '400px',
  width: '100%',
};
const btnGo = {
  padding: '14px 32px', fontSize: '16px', fontWeight: 700,
  borderRadius: '10px', border: 'none', cursor: 'pointer',
  backgroundColor: '#3b82f6', color: 'white',
};

export default EnrollPage;
