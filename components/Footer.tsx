import { FaHeart } from "react-icons/fa";
import BuyMeACoffee from "./BuyMeACoffee";

const Footer = () => {
  return (
    <footer className="py-4 text-center text-gray-600 text-sm">
      <div className="flex justify-center items-center space-x-2">
        <span>Built with</span>
        <FaHeart className="text-red-500" aria-label="love" />
        <span>
          by{" "}
          <a
            href="https://github.com/alexcanessa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:underline"
          >
            alexcanessa
          </a>
        </span>
        <a
          href="https://buymeacoffee.com/alexcanessa"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-yellow-600 text-yellow-500 ml-1 flex space-x-2 items-center"
        >
          <span className="w-5 block">
            <BuyMeACoffee />
          </span>
          <span>help the project</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
