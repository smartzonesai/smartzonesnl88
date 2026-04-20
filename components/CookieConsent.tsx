'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CookiePreferences {
  noodzakelijk: boolean;
  analytisch: boolean;
  marketing: boolean;
  functioneel: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  noodzakelijk: true,
  analytisch: false,
  marketing: false,
  functioneel: false,
};

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function savePreferences(prefs: CookiePreferences) {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    setVisible(false);
  }

  function acceptAll() {
    savePreferences({
      noodzakelijk: true,
      analytisch: true,
      marketing: true,
      functioneel: true,
    });
  }

  function rejectAll() {
    savePreferences({
      noodzakelijk: true,
      analytisch: false,
      marketing: false,
      functioneel: false,
    });
  }

  function saveCustom() {
    savePreferences({ ...preferences, noodzakelijk: true });
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[998] p-4 sm:p-6"
      role="dialog"
      aria-label="Cookie toestemming"
    >
      <div className="mx-auto max-w-3xl rounded-lg border border-[var(--border)] bg-[var(--bg-elevated,#fff)] p-6 shadow-lg">
        <p className="text-sm leading-relaxed text-[var(--text-secondary,#555)]">
          Wij gebruiken cookies om uw ervaring te verbeteren en het siteverkeer
          te analyseren. Lees meer in ons{' '}
          <Link href="/privacy" className="underline hover:text-[var(--text-primary,#111)]">
            privacybeleid
          </Link>{' '}
          en{' '}
          <Link href="/cookies" className="underline hover:text-[var(--text-primary,#111)]">
            cookiebeleid
          </Link>
          .
        </p>

        {showCustomize && (
          <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked
                disabled
                className="accent-[var(--color-primary,#E85D2C)]"
              />
              <span className="text-[var(--text-secondary,#555)]">
                <strong className="text-[var(--text-primary,#111)]">Noodzakelijk</strong> — altijd
                actief
              </span>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.analytisch}
                onChange={(e) =>
                  setPreferences((p) => ({ ...p, analytisch: e.target.checked }))
                }
                className="accent-[var(--color-primary,#E85D2C)]"
              />
              <span className="text-[var(--text-secondary,#555)]">
                <strong className="text-[var(--text-primary,#111)]">Analytisch</strong> —
                siteverkeer en -gebruik meten
              </span>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) =>
                  setPreferences((p) => ({ ...p, marketing: e.target.checked }))
                }
                className="accent-[var(--color-primary,#E85D2C)]"
              />
              <span className="text-[var(--text-secondary,#555)]">
                <strong className="text-[var(--text-primary,#111)]">Marketing</strong> —
                gepersonaliseerde advertenties
              </span>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.functioneel}
                onChange={(e) =>
                  setPreferences((p) => ({ ...p, functioneel: e.target.checked }))
                }
                className="accent-[var(--color-primary,#E85D2C)]"
              />
              <span className="text-[var(--text-secondary,#555)]">
                <strong className="text-[var(--text-primary,#111)]">Functioneel</strong> —
                verbeterde functionaliteit en personalisatie
              </span>
            </label>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={acceptAll}
            className="rounded-lg bg-[var(--color-primary,#E85D2C)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-text,#fff)] transition-opacity hover:opacity-90"
          >
            Alles accepteren
          </button>
          <button
            onClick={rejectAll}
            className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary,#111)] transition-colors hover:bg-[var(--bg-subtle,#f5f5f0)]"
          >
            Alles weigeren
          </button>
          {showCustomize ? (
            <button
              onClick={saveCustom}
              className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary,#111)] transition-colors hover:bg-[var(--bg-subtle,#f5f5f0)]"
            >
              Voorkeuren opslaan
            </button>
          ) : (
            <button
              onClick={() => setShowCustomize(true)}
              className="px-2 py-2.5 text-sm font-medium text-[var(--text-secondary,#555)] underline transition-colors hover:text-[var(--text-primary,#111)]"
            >
              Aanpassen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
