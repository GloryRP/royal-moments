import React, { useState } from 'react';
import { Info, X, ExternalLink, Database } from 'lucide-react';

export function DemoNotice({ isDemo }) {
  const [dismissed, setDismissed] = useState(false);

  if (!isDemo || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-gold-900 via-royal-espresso to-gold-900 text-gold-100 px-4 py-2.5 text-xs font-sans border-b border-gold-600/40 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-gold-400 flex-shrink-0" />
          <span>
            <strong className="text-white font-semibold">Local Preview Mode:</strong> Supabase credentials are not connected yet. You can browse, upload, favourite, and test all features with local demo media. Connect your keys in <code className="bg-black/30 px-1.5 py-0.5 rounded text-gold-300">.env</code> to activate live Supabase cloud storage.
          </span>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-gold-300 hover:text-white p-1 rounded transition"
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
