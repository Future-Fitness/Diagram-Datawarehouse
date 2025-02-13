import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
//   const [image, setImage] = useState(null);

//   const handleImageUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setImage(URL.createObjectURL(file));
//     }
//   };
const navigate = useNavigate()

  return (
    <div className="min-h-screen w-full max-h-screen overflow-y-hidden  bg-gray-100 text-gray-900">
      {/* Hero Section */}
      <header className="bg-orange-600 text-white py-16 text-center">
        <h1 className="text-4xl font-bold">Diagram Data Warehouse</h1>
        <p className="mt-4 text-lg">
          A cloud-based solution for storing and analyzing academic diagrams.
        </p>
      </header>

      {/* Features Section */}
      <section className="py-4 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center">Key Features</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-lg p-6 rounded-lg">
            <h3 className="font-semibold text-lg">AWS S3 + CloudFront</h3>
            <p className="mt-2 text-gray-600">Fast and secure image storage.</p>
          </div>
          <div className="bg-white shadow-lg p-6 rounded-lg">
            <h3 className="font-semibold text-lg">PostgreSQL & Prisma</h3>
            <p className="mt-2 text-gray-600">Structured metadata storage.</p>
          </div>
          <div className="bg-white shadow-lg p-6 rounded-lg">
            <h3 className="font-semibold text-lg">Machine Learning Ready</h3>
            <p className="mt-2 text-gray-600">Supports AI-based image analysis.</p>
          </div>
        </div>
      </section>

      <section className="py-8 px-6 text-center">
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg mr-4"
          onClick={() => navigate('/upload')}
        >
          Upload Image
        </button>
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        //   onClick={() => navigate('/view')}
        >
          View All Images
        </button>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-200 py-6 px-6">
        <h2 className="text-3xl font-bold text-center">How It Works</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="text-center">
            <span className="text-4xl text-orange-600">1</span>
            <h3 className="mt-2 font-semibold text-lg">Upload Diagram</h3>
            <p className="text-gray-600">Securely upload diagrams via our API.</p>
          </div>
          <div className="text-center">
            <span className="text-4xl text-orange-600">2</span>
            <h3 className="mt-2 font-semibold text-lg">Store Metadata</h3>
            <p className="text-gray-600">Metadata is stored in PostgreSQL.</p>
          </div>
          <div className="text-center">
            <span className="text-4xl text-orange-600">3</span>
            <h3 className="mt-2 font-semibold text-lg">Retrieve & Analyze</h3>
            <p className="text-gray-600">Easily query diagrams and run ML models.</p>
          </div>
        </div>
      </section>
    

      {/* Upload Preview Section */}
      {/* <section className="py-12 px-6 text-center">
        <h2 className="text-3xl font-bold">Try It Out</h2>
        <p className="mt-2 text-gray-600">Upload a sample diagram to preview.</p>
        <label className="mt-6 inline-block bg-orange-600 text-white px-6 py-3 rounded-lg cursor-pointer">
          Choose File
          <input type="file" className="hidden" onChange={handleImageUpload} />
        </label>
        {image && (
          <div className="mt-6">
            <img src={image} alt="Preview" className="max-w-sm mx-auto shadow-lg rounded-lg" />
          </div>
        )}
      </section> */}

      {/* Footer */}
      {/* <footer className="bg-orange-600 text-white py-6 text-center">
        <p>&copy; 2025 Diagram Data Warehouse. All rights reserved.</p>
      </footer> */}
    </div>
  );
}
