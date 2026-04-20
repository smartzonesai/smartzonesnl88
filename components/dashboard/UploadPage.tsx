'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from '@/lib/gsap';

import { compressVideo } from '@/lib/compress-video';
import { extractFramesBrowser } from '@/lib/extract-frames-browser';

const storeTypes = ['Mode', 'Supermarkt', 'Woonwinkel', 'Electronica', 'Overig'];

const checklistItems = [
  'Compleet vloerplan op maat',
  'Productplaatsingsadvies',
  'Klantenstroom-optimalisatie',
  'Heatmap van uw winkel',
  'Stap-voor-stap implementatieplan',
  'Toegang tot persoonlijk dashboard',
];

const focusAreaOptions = [
  'Klantenstroom',
  'Productplaatsing',
  'Verlichting',
  'Etalage',
  'Kassa-indeling',
  'Schapindeling',
];

const priceSegments = ['Budget', 'Midden', 'Premium'];

interface FormData {
  file: File | null;
  winkelnaam: string;
  type: string;
  oppervlakte: string;
  opmerkingen: string;
  doelgroep: string;
  concurrenten: string;
  focusgebieden: string[];
  prijssegment: string;
}

export default function UploadPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    file: null,
    winkelnaam: '',
    type: '',
    oppervlakte: '',
    opmerkingen: '',
    doelgroep: '',
    concurrenten: '',
    focusgebieden: [],
    prijssegment: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Initial mount animation */
  useEffect(() => {
    if (!containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.upload-animate');
    gsap.set(els, { opacity: 0, y: 20 });
    gsap.to(els, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
      delay: 0.1,
    });
  }, []);

  /* Animate step transitions */
  useEffect(() => {
    if (!stepContentRef.current) return;
    gsap.fromTo(
      stepContentRef.current,
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' },
    );
  }, [step]);

  const handleFileSelect = useCallback((file: File) => {
    setFormData((prev) => ({ ...prev, file }));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const goNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const goPrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [statusText, setStatusText] = useState('');

  const handleSubmit = async () => {
    if (!formData.file) return;
    setIsSubmitting(true);
    setUploadError(null);
    setUploadProgress(5);
    setStatusText('Voorbereiden...');

    try {
      // Auth is verified server-side — no need to pass email in body
      let file: File = formData.file;

      // Step 0: Compress video if over 45MB
      const MAX_SIZE = 45 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setStatusText('Video comprimeren...');
        setUploadProgress(5);
        file = await compressVideo(file, (pct) => {
          setUploadProgress(5 + Math.round(pct * 0.3)); // 5-35%
        });
        setUploadProgress(35);
      }

      // Step 1: Create analysis record on server (metadata only)
      setStatusText('Upload voorbereiden...');
      setUploadProgress(40);

      const metaRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winkelnaam: formData.winkelnaam,
          type: formData.type,
          oppervlakte: formData.oppervlakte,
          opmerkingen: formData.opmerkingen,
          doelgroep: formData.doelgroep,
          concurrenten: formData.concurrenten,
          focusgebieden: formData.focusgebieden,
          prijssegment: formData.prijssegment,
          fileName: file.name || 'video.webm',
          fileType: file.type || 'video/webm',
        }),
      });

      if (!metaRes.ok) {
        const err = await metaRes.json();
        throw new Error(err.error || 'Upload voorbereiden mislukt');
      }

      const { analysisId, storagePath } = await metaRes.json();

      // Step 2: Extract frames from video in the browser
      // Use the (possibly compressed) file so frames match what gets uploaded
      setStatusText('Frames extraheren...');
      setUploadProgress(45);

      const frames = await extractFramesBrowser(file, 10, (pct) => {
        setUploadProgress(45 + Math.round(pct * 0.15)); // 45-60%
      });

      // Step 3: Upload video + frames via server-signed URLs (private bucket)
      setStatusText('Video uploaden...');
      setUploadProgress(60);

      // Get signed upload URL for the video from our server
      const signedVideoRes = await fetch('/api/storage/signed-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: storagePath, bucket: 'videos' }),
      });
      if (!signedVideoRes.ok) throw new Error('Kon geen upload URL aanmaken voor video');
      const { signedUrl: videoSignedUrl } = await signedVideoRes.json();

      // Upload video directly to Supabase using the signed URL
      const videoUploadRes = await fetch(videoSignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'video/mp4' },
        body: file,
      });
      if (!videoUploadRes.ok) throw new Error('Video upload mislukt');

      setUploadProgress(75);

      // Upload frames
      setStatusText('Frames uploaden...');
      const frameUrls: string[] = [];
      for (let i = 0; i < frames.length; i++) {
        const framePath = `${analysisId}/frame-${String(i + 1).padStart(3, '0')}.jpg`;

        const signedFrameRes = await fetch('/api/storage/signed-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: framePath, bucket: 'videos' }),
        });

        if (signedFrameRes.ok) {
          const { signedUrl: frameSignedUrl } = await signedFrameRes.json();
          const frameUploadRes = await fetch(frameSignedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'image/jpeg' },
            body: frames[i],
          });
          if (frameUploadRes.ok) {
            // Store the storage path — server will fetch via service-role client
            frameUrls.push(framePath);
          }
        }
        setUploadProgress(75 + Math.round(((i + 1) / frames.length) * 10)); // 75-85%
      }

      setUploadProgress(85);

      // Step 4: Save frame URLs so the webhook can use them after payment
      setStatusText('Betaling voorbereiden...');
      setUploadProgress(90);
      await fetch('/api/upload/frames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId, frameUrls }),
      }).catch(() => {});

      // Step 5: Mollie betaalpagina aanmaken en doorsturen
      setStatusText('Doorsturen naar betaling...');
      setUploadProgress(95);
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId }),
      });
      if (!checkoutRes.ok) {
        const err = await checkoutRes.json();
        throw new Error(err.error || 'Betaling aanmaken mislukt');
      }
      const { url } = await checkoutRes.json();
      setUploadProgress(100);
      window.location.href = url;
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Er ging iets mis');
      setIsSubmitting(false);
      setUploadProgress(0);
      setStatusText('');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canProceedStep1 = formData.file !== null;
  const canProceedStep2 = formData.winkelnaam.trim() !== '' && formData.type !== '';

  /* Shared styles */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(26,25,23,0.7)',
    border: '1px solid rgba(232,228,220,0.1)',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    color: '#E8E4DC',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'border-color 0.3s',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: 'rgba(232,228,220,0.6)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    marginBottom: '0.5rem',
    letterSpacing: '0.02em',
  };

  const primaryBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: '#E87A2E',
    color: '#fff',
    padding: '0.85rem 2rem',
    borderRadius: '10px',
    fontWeight: 600,
    fontSize: '0.9rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(232,122,46,0.3)',
    transition: 'background 0.3s, transform 0.2s',
    fontFamily: 'inherit',
  };

  const secondaryBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'transparent',
    color: 'rgba(232,228,220,0.6)',
    padding: '0.85rem 1.5rem',
    borderRadius: '10px',
    fontWeight: 500,
    fontSize: '0.9rem',
    border: '1px solid rgba(232,228,220,0.12)',
    cursor: 'pointer',
    transition: 'border-color 0.3s, color 0.3s',
    fontFamily: 'inherit',
  };

  const disabledBtnStyle: React.CSSProperties = {
    ...primaryBtnStyle,
    opacity: 0.4,
    cursor: 'not-allowed',
    boxShadow: 'none',
  };

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100vh',
        background: '#111110',
        color: '#E8E4DC',
        padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 3rem)',
      }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Step indicator */}
        <div className="upload-animate" style={{ marginBottom: '3rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0',
            }}
          >
            {[
              { num: 1, label: 'Upload video' },
              { num: 2, label: 'Details invullen' },
              { num: 3, label: 'Bevestigen' },
            ].map((s, i) => (
              <div
                key={s.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      background: step >= s.num ? '#E87A2E' : 'rgba(232,228,220,0.08)',
                      color: step >= s.num ? '#fff' : 'rgba(232,228,220,0.35)',
                      transition: 'all 0.3s',
                    }}
                  >
                    {step > s.num ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      s.num
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: step >= s.num ? '#E8E4DC' : 'rgba(232,228,220,0.3)',
                      whiteSpace: 'nowrap',
                      fontWeight: step === s.num ? 600 : 400,
                      transition: 'color 0.3s',
                    }}
                  >
                    {s.num}. {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    style={{
                      width: 'clamp(40px, 8vw, 80px)',
                      height: '2px',
                      background: step > s.num ? '#E87A2E' : 'rgba(232,228,220,0.08)',
                      margin: '0 0.75rem',
                      marginBottom: '1.75rem',
                      borderRadius: '2px',
                      transition: 'background 0.3s',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div ref={stepContentRef}>
          {/* Step 1: Upload */}
          {step === 1 && (
            <div>
              <div
                className="upload-animate"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{
                  background: isDragging ? 'rgba(232,122,46,0.06)' : 'rgba(26,25,23,0.5)',
                  border: `2px dashed ${isDragging ? '#E87A2E' : 'rgba(232,228,220,0.12)'}`,
                  borderRadius: '20px',
                  padding: 'clamp(2.5rem, 6vw, 4rem) 2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.mov,.avi,video/mp4,video/quicktime,video/x-msvideo"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />

                {!formData.file ? (
                  <>
                    {/* Upload cloud icon */}
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#E87A2E"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ margin: '0 auto 1.25rem', display: 'block' }}
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p
                      style={{
                        fontFamily: 'var(--font-syne), system-ui, sans-serif',
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#E8E4DC',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Sleep uw video hierheen
                    </p>
                    <p style={{ color: 'rgba(232,228,220,0.45)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                      of klik om te selecteren
                    </p>
                    <p style={{ color: 'rgba(232,228,220,0.3)', fontSize: '0.8rem' }}>
                      MP4, MOV of AVI &middot; Max 500MB
                    </p>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#34D399"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ color: '#E8E4DC', fontWeight: 600, fontSize: '0.9375rem' }}>
                        {formData.file.name}
                      </p>
                      <p style={{ color: 'rgba(232,228,220,0.4)', fontSize: '0.8125rem' }}>
                        {formatFileSize(formData.file.size)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="upload-animate" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={canProceedStep1 ? goNext : undefined}
                  style={canProceedStep1 ? primaryBtnStyle : disabledBtnStyle}
                  onMouseEnter={(e) => {
                    if (canProceedStep1) (e.currentTarget as HTMLElement).style.background = '#D06820';
                  }}
                  onMouseLeave={(e) => {
                    if (canProceedStep1) (e.currentTarget as HTMLElement).style.background = '#E87A2E';
                  }}
                >
                  Volgende <span>&rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div>
              <div
                style={{
                  background: 'rgba(26,25,23,0.5)',
                  border: '1px solid rgba(232,228,220,0.08)',
                  borderRadius: '20px',
                  padding: 'clamp(1.5rem, 4vw, 2.5rem)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Winkelnaam */}
                  <div>
                    <label style={labelStyle}>
                      Winkelnaam <span style={{ color: '#E87A2E' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="winkelnaam"
                      value={formData.winkelnaam}
                      onChange={handleInputChange}
                      placeholder="Bijv. Modezaak Amsterdam"
                      style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.4)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; }}
                    />
                  </div>

                  {/* Type winkel */}
                  <div>
                    <label style={labelStyle}>
                      Type winkel <span style={{ color: '#E87A2E' }}>*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      style={{
                        ...inputStyle,
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(232,228,220,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        paddingRight: '2.5rem',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.4)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; }}
                    >
                      <option value="" style={{ background: '#1a1917', color: 'rgba(232,228,220,0.4)' }}>
                        Selecteer type...
                      </option>
                      {storeTypes.map((t) => (
                        <option key={t} value={t} style={{ background: '#1a1917', color: '#E8E4DC' }}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Oppervlakte */}
                  <div>
                    <label style={labelStyle}>Oppervlakte m&sup2;</label>
                    <input
                      type="number"
                      name="oppervlakte"
                      value={formData.oppervlakte}
                      onChange={handleInputChange}
                      placeholder="Bijv. 120"
                      style={inputStyle}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.4)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; }}
                    />
                  </div>

                  {/* Opmerkingen */}
                  <div>
                    <label style={labelStyle}>Opmerkingen</label>
                    <textarea
                      name="opmerkingen"
                      value={formData.opmerkingen}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Optioneel: aanvullende informatie over uw winkel..."
                      style={{
                        ...inputStyle,
                        resize: 'vertical',
                        minHeight: '80px',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.4)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; }}
                    />
                  </div>

                  {/* Doelgroep */}
                  <div>
                    <label style={labelStyle}>Doelgroep</label>
                    <textarea
                      name="doelgroep"
                      value={formData.doelgroep}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Wie zijn uw klanten? Bijv. jonge gezinnen, senioren, studenten..."
                      style={{
                        ...inputStyle,
                        resize: 'vertical',
                        minHeight: '60px',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.4)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; }}
                    />
                  </div>

                  {/* Concurrenten */}
                  <div>
                    <label style={labelStyle}>Concurrenten</label>
                    <textarea
                      name="concurrenten"
                      value={formData.concurrenten}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Wie zijn uw directe concurrenten in de buurt?"
                      style={{
                        ...inputStyle,
                        resize: 'vertical',
                        minHeight: '60px',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(232,122,46,0.4)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(232,228,220,0.1)'; }}
                    />
                  </div>

                  {/* Focusgebieden */}
                  <div>
                    <label style={labelStyle}>Focusgebieden</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {focusAreaOptions.map((area) => {
                        const checked = formData.focusgebieden.includes(area);
                        return (
                          <label
                            key={area}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.5rem 0.85rem',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              background: checked ? 'rgba(232,122,46,0.12)' : 'rgba(26,25,23,0.7)',
                              border: `1px solid ${checked ? 'rgba(232,122,46,0.4)' : 'rgba(232,228,220,0.1)'}`,
                              color: checked ? '#E87A2E' : 'rgba(232,228,220,0.6)',
                              transition: 'all 0.2s',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  focusgebieden: checked
                                    ? prev.focusgebieden.filter((f) => f !== area)
                                    : [...prev.focusgebieden, area],
                                }));
                              }}
                              style={{ display: 'none' }}
                            />
                            <span style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '4px',
                              border: `1.5px solid ${checked ? '#E87A2E' : 'rgba(232,228,220,0.25)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: checked ? '#E87A2E' : 'transparent',
                              transition: 'all 0.2s',
                              flexShrink: 0,
                            }}>
                              {checked && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </span>
                            {area}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prijssegment */}
                  <div>
                    <label style={labelStyle}>Prijssegment</label>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {priceSegments.map((segment) => {
                        const selected = formData.prijssegment === segment;
                        return (
                          <label
                            key={segment}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.55rem 1rem',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              cursor: 'pointer',
                              background: selected ? 'rgba(232,122,46,0.12)' : 'rgba(26,25,23,0.7)',
                              border: `1px solid ${selected ? 'rgba(232,122,46,0.4)' : 'rgba(232,228,220,0.1)'}`,
                              color: selected ? '#E87A2E' : 'rgba(232,228,220,0.6)',
                              transition: 'all 0.2s',
                            }}
                          >
                            <input
                              type="radio"
                              name="prijssegment"
                              value={segment}
                              checked={selected}
                              onChange={handleInputChange}
                              style={{ display: 'none' }}
                            />
                            <span style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              border: `1.5px solid ${selected ? '#E87A2E' : 'rgba(232,228,220,0.25)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s',
                              flexShrink: 0,
                            }}>
                              {selected && (
                                <span style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  background: '#E87A2E',
                                }} />
                              )}
                            </span>
                            {segment}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: '2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <button
                  onClick={goPrev}
                  style={secondaryBtnStyle}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,228,220,0.25)';
                    (e.currentTarget as HTMLElement).style.color = '#E8E4DC';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,228,220,0.12)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(232,228,220,0.6)';
                  }}
                >
                  &larr; Vorige
                </button>
                <button
                  onClick={canProceedStep2 ? goNext : undefined}
                  style={canProceedStep2 ? primaryBtnStyle : disabledBtnStyle}
                  onMouseEnter={(e) => {
                    if (canProceedStep2) (e.currentTarget as HTMLElement).style.background = '#D06820';
                  }}
                  onMouseLeave={(e) => {
                    if (canProceedStep2) (e.currentTarget as HTMLElement).style.background = '#E87A2E';
                  }}
                >
                  Volgende <span>&rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm + Pay */}
          {step === 3 && (
            <div>
              {/* Summary card */}
              <div
                style={{
                  background: 'rgba(26,25,23,0.5)',
                  border: '1px solid rgba(232,228,220,0.08)',
                  borderRadius: '20px',
                  padding: 'clamp(1.5rem, 4vw, 2.5rem)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-syne), system-ui, sans-serif',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#E8E4DC',
                    marginBottom: '1.5rem',
                  }}
                >
                  Overzicht
                </h3>

                {/* Details rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
                  {[
                    { label: 'Video', value: formData.file?.name || '' },
                    { label: 'Winkel', value: formData.winkelnaam },
                    { label: 'Type', value: formData.type },
                    ...(formData.oppervlakte ? [{ label: 'Oppervlakte', value: `${formData.oppervlakte} m\u00B2` }] : []),
                    ...(formData.opmerkingen ? [{ label: 'Opmerkingen', value: formData.opmerkingen }] : []),
                    ...(formData.doelgroep ? [{ label: 'Doelgroep', value: formData.doelgroep }] : []),
                    ...(formData.concurrenten ? [{ label: 'Concurrenten', value: formData.concurrenten }] : []),
                    ...(formData.focusgebieden.length > 0 ? [{ label: 'Focusgebieden', value: formData.focusgebieden.join(', ') }] : []),
                    ...(formData.prijssegment ? [{ label: 'Prijssegment', value: formData.prijssegment }] : []),
                  ].map((row, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        padding: '0.6rem 0',
                        borderBottom: '1px solid rgba(232,228,220,0.04)',
                      }}
                    >
                      <span style={{ color: 'rgba(232,228,220,0.45)', fontSize: '0.875rem', flexShrink: 0 }}>
                        {row.label}
                      </span>
                      <span
                        style={{
                          color: '#E8E4DC',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          textAlign: 'right',
                          wordBreak: 'break-word',
                        }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div
                  style={{
                    textAlign: 'center',
                    padding: '1.25rem 0',
                    marginBottom: '1.5rem',
                    borderTop: '1px solid rgba(232,228,220,0.06)',
                    borderBottom: '1px solid rgba(232,228,220,0.06)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-syne), system-ui, sans-serif',
                      fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                      fontWeight: 800,
                      color: '#E87A2E',
                      lineHeight: 1,
                    }}
                  >
                    &euro;199
                  </span>
                  <span
                    style={{
                      display: 'block',
                      color: 'rgba(232,228,220,0.4)',
                      fontSize: '0.8125rem',
                      marginTop: '0.35rem',
                    }}
                  >
                    eenmalig per analyse
                  </span>
                </div>

                {/* Checklist */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
                  {checklistItems.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem 0',
                        fontSize: '0.875rem',
                        color: 'rgba(232,228,220,0.65)',
                      }}
                    >
                      <span style={{ color: '#34D399', fontSize: '1rem', flexShrink: 0 }}>&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Submit button */}
                <button
                  onClick={!isSubmitting ? handleSubmit : undefined}
                  style={{
                    ...primaryBtnStyle,
                    width: '100%',
                    justifyContent: 'center',
                    padding: '1.1rem 2rem',
                    fontSize: '1rem',
                    opacity: isSubmitting ? 0.7 : 1,
                    cursor: isSubmitting ? 'wait' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = '#D06820';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = '#E87A2E';
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        style={{ animation: 'spin 1s linear infinite' }}
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      {statusText || 'Doorsturen naar betaling...'}
                    </>
                  ) : (
                    <>Betalen &amp; starten &mdash; &euro;199</>
                  )}
                </button>

                {/* Upload progress bar */}
                {isSubmitting && uploadProgress > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{
                      width: '100%',
                      height: '4px',
                      background: 'rgba(232,228,220,0.08)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${uploadProgress}%`,
                        height: '100%',
                        background: '#E87A2E',
                        borderRadius: '2px',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                )}

                {/* Error message */}
                {uploadError && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(229,62,62,0.1)',
                    border: '1px solid rgba(229,62,62,0.3)',
                    borderRadius: '8px',
                    color: '#E53E3E',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                  }}>
                    {uploadError}
                  </div>
                )}

                {/* Mollie text */}
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(232,228,220,0.3)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(232,228,220,0.3)' }}>
                    Veilige betaling via Mollie
                  </span>
                </div>
              </div>

              {/* Back button */}
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  onClick={!isSubmitting ? goPrev : undefined}
                  style={{
                    ...secondaryBtnStyle,
                    opacity: isSubmitting ? 0.4 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,228,220,0.25)';
                      (e.currentTarget as HTMLElement).style.color = '#E8E4DC';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,228,220,0.12)';
                      (e.currentTarget as HTMLElement).style.color = 'rgba(232,228,220,0.6)';
                    }
                  }}
                >
                  &larr; Vorige
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
