import { FaCompactDisc } from "react-icons/fa";

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="flex flex-col items-center text-white">
        <FaCompactDisc className="animate-spin text-white text-4xl mb-2" />
        <p className="text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
