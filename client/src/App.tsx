
import './App.css'
import { Route, Router, Routes } from 'react-router-dom'
import Home from './pages/Home'
import UploadForm from './pages/UploadPage'
import ViewAllImages from './pages/ImageViewerPage'
import Auth from './pages/Auth'

function App() {


  return (

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Auth isSignUp= {false}  />} />
        <Route path="/signup" element={<Auth isSignUp= {true} />} />
        <Route path="/upload" element={<UploadForm />} />
        <Route path="/imagecollection" element={<ViewAllImages />} />
        {/* <Route path="/about" element={<About />} /> */}
      </Routes>

  )
}


export const BASE_URL = 'http://localhost:4000/api/v1'
export default App
