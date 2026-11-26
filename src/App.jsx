import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Gallery } from './components/Gallery';
import { UploadSection } from './components/UploadSection';
import { Lightbox } from './components/Lightbox';
import { DownloadModal } from './components/DownloadModal';
import { DeleteModal } from './components/DeleteModal';
import { Footer } from './components/Footer';
import { DemoNotice } from './components/DemoNotice';
import { useFavourites } from './hooks/useFavourites';
import { useGallery } from './hooks/useGallery';
import { downloadIndividualFile } from './services/downloadService';
import { deleteMediaRecord } from './services/mediaService';

export function App() {
  const {
    visitorId,
    favouritesSet,
    favouriteCount,
    isFavourited,
    getFavouriteCount,
    toggleFavourite
  } = useFavourites();

  const {
    media,
    filteredMedia,
    isLoading,
    error,
    isDemo,
    filter,
    setFilter,
    sortOrder,
    setSortOrder,
    refreshGallery,
    addMediaItem,
    removeMediaItem
  } = useGallery(favouritesSet);

  const [lightboxItem, setLightboxItem] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleOpenLightbox = (item) => {
    setLightboxItem(item);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxItem(null);
  };

  const handleDownloadIndividual = async (item) => {
    try {
      toast.loading(`Downloading ${item.file_name}...`, { id: 'download-single' });
      await downloadIndividualFile(item);
      toast.success(`Downloaded ${item.file_name}`, { id: 'download-single' });
    } catch (err) {
      toast.error(`Download failed: ${err.message}`, { id: 'download-single' });
    }
  };

  const handleUploadSuccess = (newRecord) => {
    addMediaItem(newRecord);
  };

  const handleRequestDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (item, passcode) => {
    await deleteMediaRecord(item.id, item.file_path, passcode);
    removeMediaItem(item.id);
    if (lightboxItem && lightboxItem.id === item.id) {
      handleCloseLightbox();
    }
  };

  return (
    <div className="min-h-screen bg-royal-ivory text-royal-espresso flex flex-col font-sans selection:bg-gold-200">
      {/* Toast Notification Provider */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#FAF6F0',
            color: '#2E231D',
            border: '1px solid #DFC278',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '13px',
            boxShadow: '0 10px 25px -5px rgba(197, 160, 89, 0.2)'
          }
        }}
      />

      {/* Demo Mode Notice Banner (Visible only when Supabase is in local fallback mode) */}
      <DemoNotice isDemo={isDemo} />

      {/* Sticky Royal Navigation */}
      <Navbar
        favouriteCount={favouriteCount}
        onOpenDownload={() => setIsDownloadModalOpen(true)}
        onNavigateFilter={(targetFilter) => setFilter(targetFilter)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Landing / Hero Section */}
        <Hero />

        {/* Memories Gallery */}
        <Gallery
          items={filteredMedia}
          isLoading={isLoading}
          error={error}
          isDemo={isDemo}
          filter={filter}
          setFilter={setFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          favouriteCount={favouriteCount}
          isFavourited={isFavourited}
          getFavouriteCount={getFavouriteCount}
          onToggleFavourite={toggleFavourite}
          onOpenLightbox={handleOpenLightbox}
          onDownload={handleDownloadIndividual}
          onRequestDelete={handleRequestDelete}
          onRefresh={refreshGallery}
        />

        {/* Upload Memories Section */}
        <UploadSection onUploadSuccess={handleUploadSuccess} />
      </main>

      {/* Full Album ZIP Download Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        mediaItems={media}
      />

      {/* Fullscreen Lightbox Modal */}
      <Lightbox
        item={lightboxItem}
        items={filteredMedia}
        isOpen={isLightboxOpen}
        onClose={handleCloseLightbox}
        isFavourited={isFavourited}
        favouriteCount={getFavouriteCount}
        onToggleFavourite={toggleFavourite}
        onDownload={handleDownloadIndividual}
        onRequestDelete={handleRequestDelete}
      />

      {/* Delete Confirmation Modal (Requires nov22) */}
      <DeleteModal
        item={itemToDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Elegant Footer */}
      <Footer />
    </div>
  );
}

export default App;
