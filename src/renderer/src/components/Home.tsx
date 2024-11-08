import React, { useEffect, useMemo, useState } from 'react';
import { HiFolderAdd, HiOutlineRefresh, HiSearch, HiCog } from 'react-icons/hi';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { Image } from '@shared/types';
import ImageDetails from './ImageDetails';
import { useSnackbar } from 'notistack';
import Pager from './Pager';
import AddFolderModal from './AddFolderModal';

const Home = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<Image[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage, setImagesPerPage] = useState(10);
  const imagesToProcess = useMemo(() => images.filter((image) => image.processing).length, [images]);

  useEffect(() => {
    const loadImages = async (): Promise<void> => {
      setIsLoading(true);
      const fetchedImages = await window.api.getImages();
      setImages(fetchedImages || []);
      setIsLoading(false);
    };
    void loadImages();
  }, []);

  useEffect(() => {
    const onImageUpdated = (_event, image: Image) => {
      setImages((prevImages) => prevImages.map((prevImage) => (prevImage.id === image.id ? image : prevImage)));
      if (selectedImage && selectedImage.id === image.id) {
        setSelectedImage(image);
      }
    };

    const listenerId = window.api.addImageUpdatedListener(onImageUpdated);
    return () => {
      window.api.removeImageUpdatedListener(listenerId);
    };
  }, [selectedImage]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
  };

  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);

  const handleAddFolder = async (folderPath: string, includeSubdirectories: boolean): Promise<void> => {
    const result = await window.api.addFolder(folderPath, includeSubdirectories);
    if (result.success) {
      setIsAddFolderModalOpen(false);
      const updatedImages = await window.api.getImages();
      setImages(updatedImages);
    } else if (result.message) {
      enqueueSnackbar(result.message, { variant: 'error' });
    }
  };

  const filteredImages = images.filter(
    (image) =>
      image.caption.toLowerCase().includes(searchQuery.toLowerCase()) || image.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Your Photos ({images.length})</h2>
        {imagesToProcess > 0 && <div className="text-sm text-gray-600">{`Remaining ${imagesToProcess} images to process...`}</div>}
      </div>

      <div className="flex space-x-4">
        <form onSubmit={handleSearch} className="flex-grow">
          <div className="relative">
            <input
              type="text"
              placeholder="Search your photos by caption or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <HiSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </form>
        <button
          onClick={() => setIsAddFolderModalOpen(true)}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <HiFolderAdd className="mr-2 h-5 w-5" />
          Add folder
        </button>
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                onClick={() => navigate('/folder-settings')}
                className="p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <HiCog className="h-5 w-5" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="bg-gray-900 text-white px-2 py-1 rounded text-sm" sideOffset={5}>
                Folder Settings
                <Tooltip.Arrow className="fill-gray-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </div>

      <Pager
        currentPage={currentPage}
        totalPages={Math.ceil(filteredImages.length / imagesPerPage)}
        itemsPerPage={imagesPerPage}
        onItemsPerPageChange={setImagesPerPage}
        onPageChange={setCurrentPage}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentImages.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={`file://${image.path}`}
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

      <Pager
        currentPage={currentPage}
        totalPages={Math.ceil(filteredImages.length / imagesPerPage)}
        itemsPerPage={imagesPerPage}
        onItemsPerPageChange={setImagesPerPage}
        onPageChange={setCurrentPage}
      />

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
        {selectedImage && <ImageDetails image={selectedImage} />}
      </Modal>

      <AddFolderModal isOpen={isAddFolderModalOpen} onRequestClose={() => setIsAddFolderModalOpen(false)} onSubmit={handleAddFolder} />
    </div>
  );
};

export default Home;
