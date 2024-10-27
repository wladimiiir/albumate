import React, { useState } from 'react';
import Modal from 'react-modal';
import { HiFolderAdd } from 'react-icons/hi';

type Props = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmit: (folderPath: string, includeSubdirs: boolean) => void;
};

const AddFolderModal = ({ isOpen, onRequestClose, onSubmit }: Props) => {
  const [folderPath, setFolderPath] = useState('');
  const [includeSubdirectories, setIncludeSubdirectories] = useState(false);

  const handleSelectFolder = async () => {
    const result = await window.api.selectFolder();
    if (result.success && result.path) {
      setFolderPath(result.path);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(folderPath, includeSubdirectories);
    setFolderPath('');
    setIncludeSubdirectories(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75"
      ariaHideApp={false}
    >
      <h2 className="text-xl font-bold mb-4">Add Folder</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Folder Path</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              value={folderPath}
              readOnly
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 bg-gray-50"
              placeholder="Select a folder..."
            />
            <button
              type="button"
              onClick={handleSelectFolder}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100"
            >
              <HiFolderAdd className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeSubdirs"
            checked={includeSubdirectories}
            onChange={(e) => setIncludeSubdirectories(e.target.checked)}
            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
          />
          <label htmlFor="includeSubdirs" className="ml-2 block text-sm text-gray-900">
            Include subdirectories
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onRequestClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!folderPath}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFolderModal;
