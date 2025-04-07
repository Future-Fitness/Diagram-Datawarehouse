
import { useNavigate } from "react-router-dom";
import { FaGithub, FaBook, FaServer, FaDatabase, FaSearch, FaCloud, FaCode, FaArrowRight } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Hero Section with Gradient Background */}
      <header className="bg-gradient-to-r from-cyan-600 to-blue-800 py-20 px-6 text-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Diagram Data Warehouse</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            An advanced cloud-based solution for storing, retrieving, and analyzing academic diagrams
            with powerful search capabilities using MongoDB Atlas Search.
          </p>
          
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              className="bg-white text-blue-900 px-6 py-3 rounded-lg shadow-lg font-semibold flex items-center hover:bg-blue-50 transition-colors"
              onClick={() => navigate('/upload')}
            >
              Upload Diagram <FaArrowRight className="ml-2" />
            </button>
            <button
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg shadow-lg font-semibold flex items-center hover:bg-white/10 transition-colors"
              onClick={() => navigate('/imagecollection')}
            >
              Browse Collection <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">

      

        <h2 className="text-3xl font-bold text-center mb-2 text-cyan-400">Key Technologies</h2>
        <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
          We've integrated cutting-edge technologies to create a powerful diagram management system
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 hover:border-cyan-500 transition-colors">
            <div className="bg-cyan-600 text-white p-3 rounded-lg inline-block mb-4">
              <FaCloud className="text-2xl" />
            </div>
            <h3 className="font-semibold text-xl text-white mb-2">AWS S3 & CloudFront</h3>
            <p className="text-slate-400">
              Fast, reliable, and secure storage for diagram images with global content delivery.
            </p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 hover:border-cyan-500 transition-colors">
            <div className="bg-cyan-600 text-white p-3 rounded-lg inline-block mb-4">
              <FaDatabase className="text-2xl" />
            </div>
            <h3 className="font-semibold text-xl text-white mb-2">MongoDB Atlas</h3>
            <p className="text-slate-400">
              Robust cloud database with advanced search capabilities and rich metadata storage.
            </p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 hover:border-cyan-500 transition-colors">
            <div className="bg-cyan-600 text-white p-3 rounded-lg inline-block mb-4">
              <FaSearch className="text-2xl" />
            </div>
            <h3 className="font-semibold text-xl text-white mb-2">Atlas Search</h3>
            <p className="text-slate-400">
              Powerful full-text search with autocomplete, filtering, and machine learning capabilities.
            </p>
          </div>
        </div>
        <section className="flex justify-center items-center">
          <img src="/image.png" alt="Diagram" className="rounded-lg h-200 w-full shadow-xl mb-8" />
        </section>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-800 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2 text-cyan-400">How It Works</h2>
          <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
            Our system combines several technologies to provide a seamless diagram management experience
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-600 text-white rounded-full text-3xl font-bold mb-4">1</div>
              <h3 className="font-semibold text-xl mb-2">Upload & Analysis</h3>
              <p className="text-slate-400">
                Diagrams are uploaded, analyzed for quality metrics, and text extraction is performed.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-600 text-white rounded-full text-3xl font-bold mb-4">2</div>
              <h3 className="font-semibold text-xl mb-2">Storage & Indexing</h3>
              <p className="text-slate-400">
                Images are stored in S3, metadata in MongoDB, and indexed with Atlas Search for retrieval.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-600 text-white rounded-full text-3xl font-bold mb-4">3</div>
              <h3 className="font-semibold text-xl mb-2">Advanced Search</h3>
              <p className="text-slate-400">
                Powerful search capabilities let you find diagrams by text, category, quality, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API and Documentation Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
  <h2 className="text-3xl font-bold text-center mb-2 text-cyan-400">API & Documentation</h2>
  <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
    Comprehensive references and documentation for developers
  </p>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {/* REST API Section */}
    <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 hover:border-cyan-500 transition-colors">
      <h3 className="font-semibold text-xl text-white mb-4 flex items-center">
        <FaServer className="mr-2 text-cyan-400" /> REST API
      </h3>
      <p className="text-slate-400 mb-4">
        Our REST API provides endpoints for diagram upload, retrieval, and search operations.
      </p>
      <div className="bg-slate-900 p-4 rounded-lg text-slate-300 font-mono text-sm mb-4">
        <div className="mb-2">GET /api/v1/getAllDiagrams</div>
        <div className="mb-2">GET /api/v1/getAllDiagrams?text=&#123;&#125;</div>
      </div>
      <div
        onClick={() => navigate('/documentation')}
        className="inline-block text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
      >
        API Documentation →
      </div>
    </div>

    {/* GraphQL API Section */}
    <div className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 hover:border-cyan-500 transition-colors">
      <h3 className="font-semibold text-xl text-white mb-4 flex items-center">
        <FaCode className="mr-2 text-cyan-400" /> GraphQL API
      </h3>
      <p className="text-slate-400 mb-4">
        Our GraphQL API provides flexible querying capabilities for diagram metadata.
      </p>
      <div className="bg-slate-900 p-4 rounded-lg text-slate-300 font-mono text-sm mb-4">
        <div className="mb-2">query getAllDiagrams(page: 1, limit: 10) &#123;</div>
        <div className="mb-2">&nbsp;&nbsp;diagrams &#123;</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;title, image_url, category &#123; name &#125;</div>
        <div className="mb-2">&nbsp;&nbsp;&#125;</div>
        <div>&#125;</div>
      </div>
      <div
        onClick={() => navigate('/documentation')}
        className="inline-block text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
      >
        Explore GraphQL Schema →
      </div>
    </div>
  </div>
</section>

      {/* Project Links Section */}
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-16 px-6">
        <div className="max-w-6xl mx-auto ">
          <h2 className="text-3xl font-bold text-center mb-2 text-cyan-400">Project Resources</h2>
          <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
            Access our codebase, documentation, and other resources
          </p>
          
          <div className="flex justify-center items-center gap-8">
            <a 
              href="https://github.com/Future-Fitness/Diagram-Datawarehouse" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 hover:border-cyan-500 transition-colors group"
            >
              <div className="flex items-center mb-4">
                <FaGithub className="text-3xl mr-3 text-white" />
                <h3 className="font-semibold text-xl text-white">GitHub Repository</h3>
              </div>
              <p className="text-slate-400 mb-3">
                Explore our full codebase, contribute, or fork the project for your own use.
              </p>
              <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
                View Repository →
              </span>
            </a>
            
            <div
  onClick={() => navigate('/documentation')}
  className="bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700 hover:border-cyan-500 transition-colors group cursor-pointer"
>
  <div className="flex items-center mb-4">
    <FaBook className="text-3xl mr-3 text-white" />
    <h3 className="font-semibold text-xl text-white">Documentation</h3>
  </div>
  <p className="text-slate-400 mb-3">
    Comprehensive guides, tutorials, and reference documentation for the system.
  </p>
  <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
    Read Documentation →
  </span>
</div>   
            
            
          </div>
        </div>
      </section>

      {/* Project Details Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2 text-cyan-400">Project Details</h2>
        <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
          Information about our college project
        </p>
        
        <div className="bg-slate-800 p-8 rounded-xl shadow-xl border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-xl text-white mb-4">Team Members</h3>
              <ul className="text-slate-300 space-y-2">
                <li>• Harsh kumar saw - Full Stack Developer</li>
                <li>• Allen - Backend Developer</li>
                <li>• Parag - Frontend Developer</li>

              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-xl text-white mb-4">Technology Stack</h3>
              <ul className="text-slate-300 space-y-2">
                <li>• Frontend: React, TailwindCSS</li>
                <li>• Backend: Node.js, Express</li>
                <li>• Database: MongoDB Atlas</li>
                <li>• Search: Atlas Search</li>
                <li>• Storage: AWS S3, CloudFront</li>
                <li>• API: REST, GraphQL</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="font-semibold text-xl text-white mb-4">Project Goals</h3>
            <p className="text-slate-300 mb-4">
              This project aims to create a comprehensive system for managing academic diagrams with powerful search capabilities. 
              The system leverages MongoDB Atlas Search to provide advanced text search, filtering, and autocomplete functionality.
            </p>
            <p className="text-slate-300">
              The project demonstrates integration of multiple technologies including cloud storage, database systems, 
              and search engines to create a cohesive and powerful application for educational purposes.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cyan-600 to-blue-800 py-16 px-6 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-xl opacity-90 mb-8">
            Start uploading and searching diagrams with our powerful platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              className="bg-white text-blue-900 px-6 py-3 rounded-lg shadow-lg font-semibold hover:bg-blue-50 transition-colors"
              onClick={() => navigate('/upload')}
            >
              Upload Diagram
            </button>
            <button
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg shadow-lg font-semibold hover:bg-white/10 transition-colors"
              onClick={() => navigate('/imagecollection')}
            >
              Browse Collection
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <p>© 2025 Diagram Data Warehouse - A College Project</p>
          <p className="mt-2">
            Created using React, MongoDB Atlas Search, AWS S3, and Node.js
          </p>
        </div>
      </footer>
    </div>
  );
}