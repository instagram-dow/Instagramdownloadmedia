import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface InstagramInputProps {
  onFetchMedia: (url: string) => void;
  isLoading: boolean;
}

const InstagramInput: React.FC<InstagramInputProps> = ({ onFetchMedia, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFetchMedia(url);
  };

  const clearInput = () => {
    setUrl('');
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes('instagram.com')) {
      setUrl(pastedText);
      setTimeout(() => onFetchMedia(pastedText), 300);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 mb-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all transform hover:shadow-xl">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Enter Instagram URL
        </h2>
        
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPaste={handlePaste}
              placeholder="https://www.instagram.com/p/..."
              className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white
                         placeholder-gray-400 dark:placeholder-gray-300"
              disabled={isLoading}
            />
            
            {url && (
              <button 
                type="button" 
                onClick={clearInput}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          <button
            type="submit"
            className={`mt-4 w-full py-3 px-4 rounded-lg font-medium text-white
                      transition-all duration-300 ${
                        isLoading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600'
                      }`}
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? 'Fetching...' : 'Download'}
          </button>
        </form>
        
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Paste any public Instagram URL for reels, posts, stories, or highlights
        </p>
      </div>
    </div>
  );
};

export default InstagramInput;