import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Route, Router, Routes } from 'react-router-dom'
import Home from './pages/Home'
import UploadForm from './pages/UploadPage'
import ViewAllImages from './pages/ImageViewerPage'

function App() {


  return (

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<UploadForm />} />
        <Route path="/imagecollection" element={<ViewAllImages />} />
        {/* <Route path="/about" element={<About />} /> */}
      </Routes>

  )
}

export default App
