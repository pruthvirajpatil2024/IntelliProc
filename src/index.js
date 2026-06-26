import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
// import 'bootstrap/dist/css/bootstrap.min.css';

window.addEventListener('error', function (event) {
  console.error('Global error:', event.error || event.message);
  if (document.body) {
    document.body.innerHTML = '<pre style="white-space: pre-wrap; color: red; background: black; padding: 1rem;">' +
      (event.error ? event.error.stack || event.error.message : event.message) + '</pre>';
  }
});

window.addEventListener('unhandledrejection', function (event) {
  console.error('Unhandled rejection:', event.reason);
  if (document.body) {
    document.body.innerHTML = '<pre style="white-space: pre-wrap; color: red; background: black; padding: 1rem;">Unhandled Rejection: ' +
      (event.reason && event.reason.stack ? event.reason.stack : event.reason) + '</pre>';
  }
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
