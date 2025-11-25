import React, {Fragment} from 'react'
import Home from './pages/home/Home'; 
import {Route,Routes} from 'react-router-dom'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import Dashboard from './pages/dashboard/Dashboard';
import EmergencyButton from './Components/emergencyButton/EmergencyButton';
import AlertHistory from './Components/alertHistory/AlertHistory';
import MapTracking from './Components/mapTracking/MapTracking';

import PoliceRegisterPage from "./pages/register/policeregister";
import PoliceLoginPage from "./pages/login/policelogin";
import PoliceDashboardPage from "./pages/dashboard/policedashboard";



const App = () => {
  return (
    <Fragment>
          <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path='/login' element={<Login/>}/>
              <Route path='/register' element={<Register/>}/>
              <Route path='/dashboard' element={<Dashboard/>}/>
              <Route path='/emergency' element={<EmergencyButton/>}/>
              <Route path='/history' element={<AlertHistory/>}/>
              <Route path="/live-tracking" element={<MapTracking />} />
              <Route path='/police/register' element={<PoliceRegisterPage />} />
        <Route path='/police/login' element={<PoliceLoginPage />} />
        <Route path='/police/dashboard' element={<PoliceDashboardPage />} />
            </Routes>
    </Fragment>
  )
}

export default App