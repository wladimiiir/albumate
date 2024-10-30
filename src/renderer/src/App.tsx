import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { HiCog, HiHome } from 'react-icons/hi';
import { useEffect } from 'react';
import Home from './components/Home';
import SettingsScreen from './components/SettingsScreen';
import FolderSettings from './components/FolderSettings';
import Modal from 'react-modal';
import icon from './assets/icon.png';

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    Modal.setAppElement('#app');
    navigate('/home', { replace: true });
  }, []);

  return (
    <div id="app" className="flex h-screen bg-gray-100">
      <div className="md:block md:w-64 bg-white shadow-lg">
        <div className="p-6 flex items-center">
          <img src={icon} alt="icon" className="w-8 h-8 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800 uppercase">Albumate</h1>
        </div>
        <nav className="mt-6">
          <Link to="/home" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-200">
            <HiHome className="w-5 h-5 mr-3" />
            Home
          </Link>
          <Link to="/settings" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-200">
            <HiCog className="w-5 h-5 mr-3" />
            Settings
          </Link>
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="/folder-settings" element={<FolderSettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
