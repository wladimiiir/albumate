import React, { useEffect, useState } from 'react';
import { HiFolderAdd, HiSearch, HiArrowLeft, HiArrowRight, HiOutlineRefresh } from 'react-icons/hi';
import Modal from 'react-modal';
import { Image } from '@shared/types';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage, setImagesPerPage] = useState(10);

  useEffect(() => {
    const loadImages = async (): Promise<void> => {
      setIsLoading(true);
      const fetchedImages = await window.api.getImages();
      setImages(fetchedImages || []);
      setIsLoading(false);
    };
    void loadImages();
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

  const filteredImages = images
    .filter(
      (image) =>
        image.caption.toLowerCase().includes(searchQuery.toLowerCase()) || image.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .map((image) => ({
      ...image,
      src: image.src.startsWith('file://') || image.src.startsWith('http://') || image.src.startsWith('https://') ? image.src : `file://${image.src}`,
    }));

  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);

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

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-4">
          <select
            value={imagesPerPage}
            onChange={(e) => {
              setImagesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {Math.ceil(filteredImages.length / imagesPerPage)}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <HiArrowLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={indexOfLastImage >= filteredImages.length}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <HiArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentImages.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={image.src}
              alt={image.caption}
              className="w-full h-48 object-cover transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer"
              onClick={() => setSelectedImage(image)}
            />
            <div className="p-4">
              {image.processing ? (
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">Processing...</span>
                  <HiOutlineRefresh className="ml-2 animate-spin-reverse text-gray-600" />
                </div>
              ) : (
                <p className="text-sm text-gray-600">{image.caption}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {image.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-200 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <HiOutlineRefresh className="animate-spin-reverse text-gray-600 text-4xl" />
        </div>
      ) : filteredImages.length === 0 ? (
        <p className="text-center text-gray-500">No images found. Try adding a folder or adjusting your search.</p>
      ) : null}

      <Modal
        isOpen={selectedImage !== null}
        onRequestClose={() => setSelectedImage(null)}
        contentLabel="Full Image"
        className="fixed inset-0 flex items-center justify-center"
        overlayClassName="fixed inset-0 bg-black bg-opacity-75"
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
      >
        <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setSelectedImage(null)} />
        {selectedImage && (
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-3xl mx-auto relative">
            <img src={selectedImage.src} alt={selectedImage.caption} className="w-full h-auto max-h-[calc(100vh-10rem)]" />
            <div className="mt-4">
              <p className="text-md">{selectedImage.caption}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedImage.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-200 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
