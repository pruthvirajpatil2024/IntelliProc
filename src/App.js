import React, { Component, Suspense, lazy } from 'react';

import './App.css';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
// import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

// Pages
// Here is where all the pages are connected to each other

import MainPage from './components/Home'
const Record = lazy(() => import('./views/pages/record').then(module => ({ default: module.Record })));
const LoginPage = lazy(() => import('./components/Login'));
const Instructions = lazy(() => import('./components/Instructions'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const QuestionsPage = lazy(() => import('./components/Questions'));
const ThankyouPage = lazy(() => import('./components/Thankyou'));
const PageNotFound = lazy(() => import('./components/404'));
const SystemCheckPage = lazy(() => import('./components/SystemCheck'));
const ValidatePage = lazy(() => import('./components/Validate'));
const DetectionsPage = lazy(() => import('./components/Detections'));
const DetectionPage2 = lazy(() => import('./components/Detections2'));
const FullScreenAlertPage = lazy(() => import('./components/FullScreenAlert'));
const Admin = lazy(() => import('./components/Admin'));
const Formvalid = lazy(() => import('./components/formvalid'));
const Results = lazy(() => import('./components/Results'));
const Dashboard2 = lazy(() => import('./components/Dashboard2'));
const AdminSignIn = lazy(() => import('./components/AdminSignIn'));
const PosenetPage = lazy(() => import('./components/Posenet'));
const CodeCheck = lazy(() => import('./components/CodeCheck'));
const EnrollPage = lazy(() => import('./components/Enroll'));
const RegisterPage = lazy(() => import('./components/Register'));
class App extends Component {
  render() {
    return (
      <Router>
        <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', marginTop: '2rem' }}>Loading...</div>}>
          <Switch>
            <Route exact path="/" component={MainPage} />
            <Route exact path="/microphone" component={Record} />
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/systemcheck" component={SystemCheckPage} />
            <Route exact path="/validate" component={ValidatePage} />
            <Route exact path="/instructions" component={Instructions} />
            <Route exact path='/dashboard' render={props =>
              <div>
                <Dashboard />
              </div>
            } />
            <Route exact path="/detections" component={DetectionsPage} />
            <Route exact path="/detections2" component={DetectionPage2} />
            <Route exact path="/questionpg" component={QuestionsPage} />
            <Route exact path="/thankyou" component={ThankyouPage} />
            <Route exact path="/fullscreenalert" component={FullScreenAlertPage} />
            <Route exact path="/admin" component={Admin} />
            <Route exact path="/formvalid" component={Formvalid} />
            <Route exact path="/results" component={Results} />
            <Route exact path="/dashboard2" component={Dashboard2} />
            <Route exact path="/adminsignin" component={AdminSignIn} />
            <Route exact path="/posenet" component={PosenetPage} />
            <Route exact path="/codecheck" component={CodeCheck} />
            <Route exact path="/enroll" component={EnrollPage} />
            <Route exact path="/register" component={RegisterPage} />
            <Route exact path="/404" component={PageNotFound} />
            <Redirect to="/404" />
          </Switch>
        </Suspense>
      </Router>
    );
  }
}

export default App;