import React, { useState, useEffect } from 'react';
import { X, Trash2, Lock, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ADMIN_PASSCODE_STORAGE_KEY = 'royal_moments_admin_passcode';

export function DeleteModal({ item, isOpen, onClose, onConfirmDelete }) {
  const [passcode, setPasscode] = useState('');
  const [rememberPasscode, setRememberPasscode] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load remembered passcode if available
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      try {
        const saved = localStorage.getItem(ADMIN_PASSCODE_STORAGE_KEY);
        if (saved) {
          setPasscode(saved);
        }
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setErrorMsg('Please enter the organizer passcode.');
      return;
    }

    setIsDeleting(true);
    setErrorMsg('');

    try {
      await onConfirmDelete(item, passcode.trim());

      // Save if remember is checked
      if (rememberPasscode) {
        try {
          localStorage.setItem(ADMIN_PASSCODE_STORAGE_KEY, passcode.trim());
        } catch (e) {}
      }

      toast.success('Memory deleted successfully.', {
        icon: '🗑️',
        style: {
          background: '#FAF6F0',
          color: '#2E231D',
          border: '1px solid #DFC278'
        }
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Incorrect passcode. Only authorized organizers can delete.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-gold-300 shadow-2xl p-6 text-royal-espresso">
        {/* Close button */}
        {!isDeleting && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-royal-espresso/50 hover:text-royal-espresso hover:bg-gold-50 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Icon */}
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-600" />
        </div>

        <h3 className="font-serif text-2xl text-center text-royal-espresso font-semibold mb-2">
          Delete Memory?
        </h3>
        <p className="font-sans text-xs text-center text-royal-espresso/70 mb-5 leading-relaxed">
          Are you sure you want to remove <span className="font-semibold text-royal-espresso">"{item.file_name}"</span> from the gallery? This cannot be undone.
        </p>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <label className="block font-sans text-xs uppercase tracking-wider font-semibold text-royal-espresso/80 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-gold-600" />
              Organizer Passcode
            </label>
            <input
              type="password"
              placeholder="Enter passcode (e.g. nov22)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gold-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
              autoFocus
              disabled={isDeleting}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberPasscode"
              checked={rememberPasscode}
              onChange={(e) => setRememberPasscode(e.target.checked)}
              className="rounded border-gold-300 text-gold-600 focus:ring-gold-400 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="rememberPasscode" className="font-sans text-xs text-royal-espresso/70 cursor-pointer select-none">
              Remember passcode on this device
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-full border border-gold-200 text-xs font-sans text-royal-espresso hover:bg-gold-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting}
              className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-sans font-semibold uppercase tracking-wider shadow-sm transition flex items-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirm Delete</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
