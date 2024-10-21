import { Image } from '@shared/types';
import { HiOutlineRefresh } from 'react-icons/hi';
import { Tooltip } from 'react-tooltip';

type Props = {
  image: Image;
};

const ImageDetails = ({ image }: Props) => {
  const handleRegenerateCaption = async (): Promise<void> => {
    await window.api.generateImageCaption(image);
  };

  return (
    <div className="flex flex-col bg-white p-4 rounded-lg shadow-lg max-w-3xl mx-auto relative max-h-[calc(100vh-5rem)] overflow-y-auto">
      <img src={image.src} alt={image.caption} className="w-full h-auto" />
      <div className="mt-8">
        <div className="flex items-center">
          <div className="text-sm flex-grow">{image.processing ? 'Processing...' : image.caption}</div>
          <div className={`${image.processing ? '' : 'cursor-pointer'} ml-4 shrink-0`}>
            {!image.processing && <Tooltip id="regenerate-caption" content="Regenerate caption" />}
            <HiOutlineRefresh
              data-tooltip-id="regenerate-caption"
              className={`${image.processing ? 'animate-spin-reverse' : ''} text-gray-600`}
              onClick={image.processing ? undefined : handleRegenerateCaption}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {image.tags.map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-200 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageDetails;
