'use client';

import { useState, useRef, useCallback } from 'react';
import { postsApi, aiApi } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { usePlatforms } from '@/contexts/PlatformsContext';
import { PLATFORMS } from '@/lib/platforms';
import Modal from '@/components/ui/Modal';
import styles from './PostComposer.module.scss';

interface PostComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Tone = 'professional' | 'casual' | 'marketing';

const MAX_CHARS = 3000;

export default function PostComposer({ isOpen, onClose, onSuccess }: PostComposerProps) {
  const { toast } = useToast();
  const { isConnected } = usePlatforms();
  const fileRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [tone, setTone] = useState<Tone>('professional');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 4 - mediaFiles.length);
    setMediaFiles((prev) => [...prev, ...arr]);
    arr.forEach((f) => {
      if (f.type.startsWith('image/')) {
        const url = URL.createObjectURL(f);
        setMediaPreviews((prev) => [...prev, url]);
      } else {
        setMediaPreviews((prev) => [...prev, '']);
      }
    });
  }, [mediaFiles.length]);

  const removeMedia = (i: number) => {
    setMediaFiles((prev) => prev.filter((_, idx) => idx !== i));
    setMediaPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleGenerateCaption = async () => {
    if (!content.trim() && selectedPlatforms.length === 0) {
      toast('Add a topic or select platforms first', 'info');
      return;
    }
    setIsGenerating(true);
    try {
      const data = await aiApi.generateCaption({
        topic: content || 'social media post',
        tone,
        platform: selectedPlatforms[0],
      });
      setContent(data.caption);
    } catch {
      toast('Caption generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const buildScheduledAt = (): string | undefined => {
    if (!scheduledDate) return undefined;
    const time = scheduledTime || '09:00';
    // Build ISO string respecting the selected timezone
    const dt = new Date(`${scheduledDate}T${time}:00`);
    return dt.toISOString();
  };

  const handleSubmit = async (postNow: boolean) => {
    setError('');
    if (!content.trim()) { setError('Post content is required.'); return; }
    if (selectedPlatforms.length === 0) { setError('Select at least one platform.'); return; }
    if (!postNow && !scheduledDate) { setError('Pick a date to schedule.'); return; }

    setIsSubmitting(true);
    try {
      let mediaUrl: string | undefined;
      if (mediaFiles[0]) {
        const { mediaApi } = await import('@/lib/api');
        const up = await mediaApi.upload(mediaFiles[0]).catch(() => null);
        mediaUrl = up?.url;
      }

      await postsApi.create({
        text: content,
        platforms: selectedPlatforms,
        mediaUrl,
        scheduledAt: postNow ? undefined : buildScheduledAt(),
      });

      toast(postNow ? 'Post published!' : 'Post scheduled!');
      onSuccess?.();
      handleClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {    setContent('');
    setSelectedPlatforms([]);
    setMediaFiles([]);
    setMediaPreviews([]);
    setScheduledDate('');
    setScheduledTime('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Post" size="lg">
      <div className={styles.composer}>
        <div className={styles.body}>
          {/* ── Left: editor ── */}
          <div className={styles.left}>
            {/* Content */}
            <div>
              <div className={styles.label}>Caption</div>
              <textarea
                className={styles.textarea}
                placeholder="What do you want to share?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={MAX_CHARS}
                aria-label="Post content"
              />
              <div className={`${styles.charCount} ${content.length > MAX_CHARS * 0.9 ? styles.warn : ''}`}>
                {content.length} / {MAX_CHARS}
              </div>
            </div>

            {/* AI caption */}
            <div className={styles.aiRow}>
              <button
                type="button"
                className={styles.aiBtn}
                onClick={handleGenerateCaption}
                disabled={isGenerating}
                aria-label="Generate caption with AI"
              >
                {isGenerating ? <span className={styles.spinner} /> : '✨'}
                Generate Caption
              </button>
              <select
                className={styles.toneSelect}
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                aria-label="Tone"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            {/* Platforms */}
            <div>
              <div className={styles.label}>Platforms</div>
              <div className={styles.platforms}>
                {PLATFORMS.map((p) => {
                  const sel = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`${styles.platformBtn} ${sel ? styles.selected : ''}`}
                      data-color={sel ? p.color : undefined}
                      onClick={() => togglePlatform(p.id)}
                      aria-pressed={sel ? 'true' : 'false'}
                      aria-label={`${sel ? 'Deselect' : 'Select'} ${p.name}`}
                    >
                      {p.icon}
                      {p.name}
                      {!isConnected(p.provider) && (
                        <span className={styles.notConnected}>(not connected)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Media */}
            <div>
              <div className={styles.label}>Media</div>
              <div
                className={`${styles.mediaZone} ${isDragging ? styles.dragging : ''}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
                aria-label="Upload media"
              >
                <div className={styles.mediaIcon}>🖼️</div>
                <div>Drag & drop or click to upload</div>
                <div className={styles.mediaHint}>Images & videos · Max 4 files</div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className={styles.hiddenInput}
                aria-label="File upload"
                onChange={(e) => addFiles(e.target.files)}
              />
              {mediaPreviews.length > 0 && (
                <div className={styles.mediaPreviews}>
                  {mediaPreviews.map((url, i) => (
                    <div key={i} className={styles.mediaThumb}>
                      {url
                        ? <img src={url} alt={`Media ${i + 1}`} />
                        : <span className={styles.mediaVideoIcon}>🎬</span>
                      }
                      <button
                        type="button"
                        className={styles.mediaRemove}
                        onClick={() => removeMedia(i)}
                        aria-label={`Remove media ${i + 1}`}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Schedule */}
            <div>
              <div className={styles.label}>Schedule (optional)</div>
              <div className={styles.scheduleRow}>
                <div className={styles.field}>
                  <label htmlFor="sched-date" className={styles.scheduleLabel}>Date</label>
                  <input
                    id="sched-date"
                    type="date"
                    className={styles.input}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="sched-time" className={styles.scheduleLabel}>Time</label>
                  <input
                    id="sched-time"
                    type="time"
                    className={styles.input}
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="sched-tz" className={styles.scheduleLabel}>Timezone</label>
                  <input
                    id="sched-tz"
                    type="text"
                    className={styles.input}
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="e.g. America/New_York"
                  />
                </div>
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}
          </div>

          {/* ── Right: preview ── */}
          <div className={styles.right}>
            <div className={styles.previewTitle}>Preview</div>
            {content || mediaPreviews[0] ? (
              <LinkedInPreview content={content} mediaUrl={mediaPreviews[0]} />
            ) : (
              <div className={styles.emptyPreview}>
                Start typing to see a preview
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            type="button"
            className={`${styles.submitBtn} ${styles.secondary}`}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          {scheduledDate && (
            <button
              type="button"
              className={`${styles.submitBtn} ${styles.secondary}`}
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? <span className={styles.spinner} /> : '🗓 Schedule Post'}
            </button>
          )}
          <button
            type="button"
            className={`${styles.submitBtn} ${styles.primary}`}
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className={styles.spinner} /> : '🚀 Post Now'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function LinkedInPreview({ content, mediaUrl }: { content: string; mediaUrl?: string }) {
  return (
    <div className={styles.linkedinCard}>
      <div className={styles.linkedinHeader}>
        <div className={styles.linkedinAvatar}>AL</div>
        <div>
          <div className={styles.linkedinName}>AutoLaunch</div>
          <div className={styles.linkedinMeta}>Just now · 🌐</div>
        </div>
      </div>
      {mediaUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl} alt="Post media" className={styles.linkedinMedia} />
      )}
      <div className={styles.linkedinBody}>{content}</div>
      <div className={styles.linkedinActions}>
        {['👍 Like', '💬 Comment', '🔁 Repost', '📤 Send'].map((a) => (
          <div key={a} className={styles.linkedinAction}>{a}</div>
        ))}
      </div>
    </div>
  );
}
