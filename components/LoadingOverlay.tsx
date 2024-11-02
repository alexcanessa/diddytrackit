import { FaSpinner } from "react-icons/fa";

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center text-white">
        <FaSpinner className="text-4xl animate-spin mb-4" />
        <p className="text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
