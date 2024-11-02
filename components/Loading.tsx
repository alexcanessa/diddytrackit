import { useEffect, useState } from "react";
import { FaCompactDisc } from "react-icons/fa";

const phrases = [
  "Did you know Diddy might be cashing in on more tracks than you think?",
  "Checking if Diddy’s royalty count is going up...",
  "The more you listen, the more he earns. Just saying!",
  "Seeing if Diddy has his hand in your tracks...",
  "Scanning for those Diddy royalties...",
  "Did you ever wonder where your streams are going?",
  "Almost there... uncovering the royalty secrets!",
];

type LoadingProps = {
  progress: number;
};

const Loading = ({ progress }: LoadingProps) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 3000); // change phrase every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-2">
      <FaCompactDisc className="animate-spin text-[#4a306d] text-4xl mb-2" />
      <p className="text-lg font-semibold text-gray-500">
        {phrases[currentPhraseIndex]}
      </p>
      {/* Progress Bar */}
      <div className="w-full max-w-md bg-gray-200 rounded-full h-3 mt-4">
        <div
          className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Loading tracks... ({Math.round(progress)}%)
      </p>
    </div>
  );
};

export default Loading;
