
import './App.css'
import { Route,  Routes } from 'react-router-dom'
import Home from './pages/Home'
import UploadForm from './pages/UploadPage'
import ViewAllImages from './pages/ImageViewerPage'
import Auth from './pages/Auth'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


const queryClient = new QueryClient();
function App() {


  return (
    <QueryClientProvider client={queryClient}>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Auth isSignUp= {false}  />} />
        <Route path="/signup" element={<Auth isSignUp= {true} />} />
        <Route path="/upload" element={<UploadForm />} />
        <Route path="/imagecollection" element={<ViewAllImages />} />
        <Route path="/documentation" element={<ViewAllImages />} />
        

      </Routes>

    </QueryClientProvider>
  )
}



export default App
