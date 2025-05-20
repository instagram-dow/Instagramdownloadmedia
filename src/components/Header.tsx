import React from 'react';
import { Instagram } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-500 to-pink-500 text-white p-4 sm:p-6">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <Instagram size={32} className="mr-2" />
          <h1 className="text-2xl font-bold">InstaSave</h1>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-sm sm:text-base opacity-80">
            Download Instagram reels, posts, stories and highlights easily
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
