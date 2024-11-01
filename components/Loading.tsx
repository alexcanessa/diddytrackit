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

const Loading = () => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 3000); // change phrase every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <FaCompactDisc className="animate-spin text-[#4a306d] text-4xl mb-4" />
      <p className="text-lg font-semibold text-gray-500">
        {phrases[currentPhraseIndex]}
      </p>
    </div>
  );
};

export default Loading;
