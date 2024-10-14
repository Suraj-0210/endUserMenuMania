import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa"; // Social Icons
import { AiFillHeart } from "react-icons/ai"; // Heart Icon
import { Link } from "react-router-dom"; // Import Link

function Footer({ restaurantDetails }) {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-5">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Company Info Section */}
        <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
          <p to="#" className="text-2xl font-bold mb-2 hover:text-gray-300">
            {restaurantDetails ? restaurantDetails.restaurantname : "MenuMania"}
          </p>
          <p className="text-sm text-gray-400 text-center md:text-left">
            Your favorite restaurant in just a few clicks.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8 text-sm"></div>

        {/* Social Media Icons */}
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition duration-200"
            aria-label="Facebook"
          >
            <FaFacebookF className="w-5 h-5" />
          </a>
          <a
            href="https://www.twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition duration-200"
            aria-label="Twitter"
          >
            <FaTwitter className="w-5 h-5" />
          </a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition duration-200"
            aria-label="Instagram"
          >
            <FaInstagram className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} MenuMania. All Rights Reserved.
      </div>

      {/* Made with Love Section */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Made with <AiFillHeart className="inline text-red-600" /> by Suryakanta
        Prusty
      </div>
    </footer>
  );
}

export default Footer;
