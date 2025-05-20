import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              © {new Date().getFullYear()} InstaSave. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm mr-2">
              Made with
            </p>
            <Heart size={16} className="text-pink-500 fill-pink-500 mr-2" />
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              for Instagram enthusiasts
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Not affiliated with Instagram or Meta Platforms, Inc.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
