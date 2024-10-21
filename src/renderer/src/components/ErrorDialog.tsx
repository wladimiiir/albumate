import Modal from 'react-modal';

type Props = {
  isOpen: boolean;
  onRequestClose: () => void;
  message: string;
};

const ErrorDialog = ({ isOpen, onRequestClose, message }: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Error Dialog"
      className="fixed inset-0 flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75"
      shouldCloseOnOverlayClick={true}
      ariaHideApp={false}
    >
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-4">{message}</p>
        <div className="flex justify-center mt-8">
          <button
            onClick={onRequestClose}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorDialog;
