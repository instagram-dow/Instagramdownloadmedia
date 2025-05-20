import React, { useState } from 'react';
import Header from './components/Header';
import InstagramInput from './components/InstagramInput';
import MediaDisplay from './components/MediaDisplay';
import Notification from './components/Notification';
import RecentDownloads from './components/RecentDownloads';
import Footer from './components/Footer';
import { useInstagramMedia } from './hooks/useInstagramMedia';

function App() {
  const {
    isLoading,
    error,
    media,
    fetchMedia,
    downloadMedia,
    clearError,
    clearMedia,
    recentDownloads,
  } = useInstagramMedia();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="container mx-auto py-8">
        <InstagramInput onFetchMedia={fetchMedia} isLoading={isLoading} />
        
        {media && (
          <MediaDisplay
            media={media}
            onDownload={downloadMedia}
            onClose={clearMedia}
          />
        )}
        
        <RecentDownloads
          downloads={recentDownloads}
          onDownload={(media) => downloadMedia(media, 'high')}
        />
      </main>

      {error && (
        <Notification
          message={error}
          type="error"
          onClose={clearError}
        />
      )}
      
      <Footer />
    </div>
  );
}

export default App;