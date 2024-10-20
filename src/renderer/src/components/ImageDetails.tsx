import React from 'react';
import { Image } from '@shared/types';

type Props = {
  image: Image;
};

const ImageDetails: React.FC<Props> = ({ image }) => {
  const handleRegenerateCaption = async (): Promise<void> => {
    await window.api.generateImageCaption(image);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg max-w-3xl mx-auto relative">
      <img src={image.src} alt={image.caption} className="w-full h-auto max-h-[calc(100vh-10rem)]" />
      <div className="mt-4">
        <p className="text-md">{image.caption}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {image.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-200 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
        <button
          onClick={handleRegenerateCaption}
          className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Regenerate Caption
        </button>
      </div>
    </div>
  );
};

export default ImageDetails;
