import { Routes, Route, Link } from 'react-router-dom';
import { HiHome, HiCog, HiMenu, HiX } from 'react-icons/hi';
import { useState } from 'react';
import Home from './components/Home';
import SettingsScreen from './components/SettingsScreen';

function App(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block md:w-64 bg-white shadow-lg`}>
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
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {sidebarOpen ? (
                <HiX className="h-6 w-6" aria-hidden="true" />
              ) : (
                <HiMenu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Albumate</h1>
          </div>
        </header>

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
}

export default App;
