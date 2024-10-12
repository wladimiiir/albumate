import React, { useState, useEffect } from 'react';
import { HiSearch, HiFolderAdd } from 'react-icons/hi';

interface Image {
  id: string;
  src: string;
  caption: string;
  tags: string[];
}

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<Image[]>([]);

  useEffect(() => {
    const loadImages = async (): Promise<void> => {
      const fetchedImages = await window.api.getImages();
      setImages(fetchedImages || []);
    };
    loadImages();
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // The filtering is now done in the filteredImages variable
  };

  const handleAddFolder = async (): Promise<void> => {
    const result = await window.api.addFolder();
    if (result.success) {
      alert(result.message);
      // Refresh the images after adding a new folder
      const updatedImages = await window.api.getImages();
      setImages(updatedImages);
    } else {
      alert(result.message);
    }
  };

  const filteredImages = images.filter(image =>
    image.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
    image.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Your Photos</h2>

      <div className="flex space-x-4">
        <form onSubmit={handleSearch} className="flex-grow">
          <div className="relative">
            <input
              type="text"
              placeholder="Search your photos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <HiSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </form>
        <button
          onClick={handleAddFolder}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <HiFolderAdd className="mr-2 h-5 w-5" />
          Add Folder
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredImages.map(image => (
          <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={image.src} alt={image.caption} className="w-full h-48 object-cover" />
            <div className="p-4">
              <p className="text-sm text-gray-600">{image.caption}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {image.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-200 text-xs rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <p className="text-center text-gray-500">No images found. Try adding a folder or adjusting your search.</p>
      )}
    </div>
  );
};

export default Home;
