import { useState } from 'react'

import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/Home'
import { AuthProvider } from './context/AuthContext'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <AuthProvider>
        <Navbar></Navbar>
        <HomePage></HomePage>
        <Footer></Footer>
      </AuthProvider>
    
    </>
  )
}

export default App
