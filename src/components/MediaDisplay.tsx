import React from 'react';
import { Download, X } from 'lucide-react';
import { InstagramMediaType } from '../types';

interface MediaDisplayProps {
  media: InstagramMediaType;
  onDownload: (media: InstagramMediaType, quality: 'high' | 'medium' | 'low') => void;
  onClose: () => void;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ media, onDownload, onClose }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white capitalize">
          {media.type} Preview
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
      </div>

      <div className="aspect-video relative rounded-lg overflow-hidden mb-6">
        {media.thumbnail && (
          <img
            src={media.thumbnail}
            alt={`Instagram ${media.type} preview`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Download Options
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {media.downloadOptions.map((option) => (
            <button
              key={option.quality}
              onClick={() => onDownload(media, option.quality)}
              className="flex items-center justify-center space-x-2 px-4 py-3 rounded-lg
                         bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600
                         text-white font-medium transition-all duration-300"
            >
              <Download size={18} />
              <span className="capitalize">{option.quality}</span>
              {option.size && <span className="text-sm opacity-80">({option.size})</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaDisplay;