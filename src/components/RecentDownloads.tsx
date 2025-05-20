import React from 'react';
import { Clock, Download } from 'lucide-react';
import { InstagramMediaType } from '../types';

interface RecentDownloadsProps {
  downloads: InstagramMediaType[];
  onDownload: (media: InstagramMediaType) => void;
}

const RecentDownloads: React.FC<RecentDownloadsProps> = ({ downloads, onDownload }) => {
  if (downloads.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 mb-12">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Clock size={24} className="text-gray-500 dark:text-gray-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Recent Downloads
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {downloads.map((item, index) => (
            <div
              key={`${item.url}-${index}`}
              className="group relative rounded-lg overflow-hidden cursor-pointer"
              onClick={() => onDownload(item)}
            >
              {item.thumbnail && (
                <div className="aspect-video">
                  <img
                    src={item.thumbnail}
                    alt={`Instagram ${item.type}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white capitalize text-sm font-medium">
                      {item.type}
                    </span>
                    <Download size={18} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentDownloads;