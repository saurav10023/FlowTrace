import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import AdminPage from './pages/Admin.jsx'
import Layout from './Layout.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/Home.jsx'
import AuthFlow from './pages/Login.jsx'



const router = createBrowserRouter([
    {
      path:"/",
      element:<Layout/>,
      children: [
        {index:true , element:<HomePage/>},
        {path:"/login" , element:<AuthFlow/>},
        // {path:"/register",element:<Register/>},
        // {path:"/profile", element:<Profile/>},
        {path:"/admin",element:<AdminPage/>},
  
      ]
    }
  ])

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <AuthProvider>
      <RouterProvider router ={router}/>
    </AuthProvider>
  </StrictMode>,
)
