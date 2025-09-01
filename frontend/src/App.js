import React, {Fragment} from 'react'
import Home from './pages/home/Home'; 
import {Route,Routes} from 'react-router-dom'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import Dashboard from './pages/dashboard/Dashboard';


const App = () => {
  return (
    <Fragment>
          <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path='/login' element={<Login/>}/>
              <Route path='/register' element={<Register/>}/>
              <Route path='/dashboard' element={<Dashboard/>}/>
            </Routes>
    </Fragment>
  )
}

export default App