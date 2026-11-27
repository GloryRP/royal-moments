import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Gallery } from './components/Gallery';
import { UploadSection } from './components/UploadSection';
import { Lightbox } from './components/Lightbox';
import { DownloadModal } from './components/DownloadModal';
import { DeleteModal } from './components/DeleteModal';
import { InstallAppModal } from './components/InstallAppModal';
import { Footer } from './components/Footer';
import { DemoNotice } from './components/DemoNotice';
import { BackgroundMusic } from './components/BackgroundMusic';
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
    removeMediaItem,
    reorderMedia
  } = useGallery(favouritesSet);

  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator?.standalone === true;
    const isStored = localStorage.getItem('royal_moments_app_installed') === 'true';
    return Boolean(isStandalone || isStored);
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem('royal_moments_app_installed', 'true');
      } catch (e) {}
    };

    if (typeof window !== 'undefined') {
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator?.standalone) {
        setIsInstalled(true);
      }
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      const mql = window.matchMedia('(display-mode: standalone)');
      const handleModeChange = (e) => {
        if (e.matches) {
          setIsInstalled(true);
          try {
            localStorage.setItem('royal_moments_app_installed', 'true');
          } catch (err) {}
        }
      };
      if (mql?.addEventListener) {
        mql.addEventListener('change', handleModeChange);
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, []);

  const handlePromptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallModalOpen(false);
        try {
          localStorage.setItem('royal_moments_app_installed', 'true');
        } catch (e) {}
      }
      setDeferredPrompt(null);
    }
  };

  const handleMarkInstalled = () => {
    setIsInstalled(true);
    setIsInstallModalOpen(false);
    try {
      localStorage.setItem('royal_moments_app_installed', 'true');
    } catch (e) {}
    toast.success('App saved! The install icon has been removed from the menu.', {
      icon: '📱',
      duration: 3500
    });
  };

  // Envelope open/close handlers with history state
  const handleOpenEnvelope = () => {
    setIsEnvelopeOpen(true);
    window.history.pushState({ page: 'invitation' }, '');
  };

  const handleCloseEnvelope = () => {
    setIsEnvelopeOpen(false);
    if (window.history.state?.page === 'invitation') {
      window.history.back();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mobile Back Button Management (Prevents exiting the web app on back swipe/press)
  useEffect(() => {
    const handlePopState = () => {
      // 1. If Lightbox is open, close it first without leaving website
      if (isLightboxOpen) {
        setIsLightboxOpen(false);
        setLightboxItem(null);
        return;
      }

      // 2. If Delete modal is open, close it
      if (isDeleteModalOpen) {
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        return;
      }

      // 3. If Download modal is open, close it
      if (isDownloadModalOpen) {
        setIsDownloadModalOpen(false);
        return;
      }

      // 4. If Envelope is open, return to sealed envelope gate
      if (isEnvelopeOpen) {
        setIsEnvelopeOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isLightboxOpen, isDeleteModalOpen, isDownloadModalOpen, isEnvelopeOpen]);

  const handleOpenLightbox = (item) => {
    setLightboxItem(item);
    setIsSlideshowActive(false);
    setIsLightboxOpen(true);
    window.history.pushState({ modal: 'lightbox' }, '');
  };

  const handleStartSlideshow = () => {
    if (filteredMedia.length === 0) {
      toast.error('No photos available to play slideshow.');
      return;
    }
    setLightboxItem(filteredMedia[0]);
    setIsSlideshowActive(true);
    setIsLightboxOpen(true);
    window.history.pushState({ modal: 'lightbox' }, '');
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
    setLightboxItem(null);
    setIsSlideshowActive(false);
    if (window.history.state?.modal === 'lightbox') {
      window.history.back();
    }
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
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden bg-royal-ivory text-royal-espresso flex flex-col font-sans selection:bg-gold-200 ${!isEnvelopeOpen ? 'h-screen overflow-hidden' : ''}`}>
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

      {/* Demo Mode Notice Banner (Visible only when envelope is open and Supabase is in local fallback mode) */}
      {isEnvelopeOpen && <DemoNotice isDemo={isDemo} />}

      {/* Sticky Royal Navigation - Visible only once envelope is opened */}
      {isEnvelopeOpen && (
        <Navbar
          favouriteCount={favouriteCount}
          onOpenDownload={() => setIsDownloadModalOpen(true)}
          onNavigateFilter={(targetFilter) => setFilter(targetFilter)}
          onOpenInstall={() => setIsInstallModalOpen(true)}
          isInstalled={isInstalled}
        />
      )}

      {/* Main Content Sections */}
      <main className={`flex-1 ${!isEnvelopeOpen ? 'h-screen overflow-hidden' : ''}`}>
        {/* Landing / Hero Section */}
        <Hero
          isOpen={isEnvelopeOpen}
          onOpen={handleOpenEnvelope}
          onClose={handleCloseEnvelope}
        />

        {/* Memories Gallery & Upload Sections - Unlocked only after opening the envelope */}
        {isEnvelopeOpen && (
          <>
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
              onStartSlideshow={handleStartSlideshow}
              onDownload={handleDownloadIndividual}
              onRequestDelete={handleRequestDelete}
              onRefresh={refreshGallery}
              onReorderMedia={reorderMedia}
            />

            <UploadSection onUploadSuccess={handleUploadSuccess} />
            <Footer />
          </>
        )}
      </main>

      {/* Full Album ZIP Download Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        mediaItems={media}
      />

      {/* PWA App Installation Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onPromptInstall={handlePromptInstall}
        onMarkInstalled={handleMarkInstalled}
        isInstalled={isInstalled}
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
        initialSlideshow={isSlideshowActive}
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
      {/* Continuous Looping Background Music */}
      <BackgroundMusic isEnvelopeOpen={isEnvelopeOpen} />
    </div>
  );
}

export default App;
