import { Link, Route, Routes } from 'react-router-dom';
import { HiCog, HiHome } from 'react-icons/hi';
import React, { useEffect } from 'react';
import Home from './components/Home';
import SettingsScreen from './components/SettingsScreen';
import Modal from 'react-modal';

const App: React.FC = () => {
  useEffect(() => {
    Modal.setAppElement('#app');
  }, []);

  return (
    <div id="app" className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="md:block md:w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Albumate</h1>
        </div>
        <nav className="mt-6">
          <Link to="/" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-200">
            <HiHome className="w-5 h-5 mr-3" />
            Home
          </Link>
          <Link to="/settings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-200">
            <HiCog className="w-5 h-5 mr-3" />
            Settings
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/settings" element={<SettingsScreen />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
