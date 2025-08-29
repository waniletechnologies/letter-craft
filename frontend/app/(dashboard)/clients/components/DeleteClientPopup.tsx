import React from "react";

interface DeleteClientPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteClientPopup: React.FC<DeleteClientPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Are you sure you want to delete
          </h3>
          <p className="text-lg font-medium text-gray-900">this client?</p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            No, Keep
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Yes, Deleted
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteClientPopup;
