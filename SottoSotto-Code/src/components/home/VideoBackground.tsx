'use client';

import { useEffect, useRef, useState } from 'react';
import { Picture } from '@/components/shared/Picture';
import type { VideoEntry } from '@/content/schemas';
import { pickHeight, posterReason, type PosterReason } from '@/lib/playback';
import styles from './VideoBackground.module.css';

interface Props {
  video: VideoEntry;
}

type State = 'poster' | 'loading' | 'playing' | 'paused';

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: 'change', fn: () => void) => void;
  removeEventListener?: (type: 'change', fn: () => void) => void;
}

const PAUSE_KEY = 'sotto.heroMotion';

function readPaused(): boolean {
  try {
    return sessionStorage.getItem(PAUSE_KEY) === 'paused';
  } catch {
    return false;
  }
}

function writePaused(paused: boolean) {
  try {
    if (paused) sessionStorage.setItem(PAUSE_KEY, 'paused');
    else sessionStorage.removeItem(PAUSE_KEY);
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
}

/**
 * Hero background (ARCHITECTURE §6.2, D37). The poster is in the HTML and is the LCP
 * element. After `load`, sources are added and the loop plays only when motion is allowed,
 * Save-Data is off, the connection is not slow and the hero is on screen. The pause
 * button (WCAG 2.2.2) stops the video and every other hero motion (the rotating badge),
 * and the choice is kept for the session.
 */
export function VideoBackground({ video }: Props) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const toggleRef = useRef<() => void>(() => {});
  const [state, setState] = useState<State>('poster');
  const [reason, setReason] = useState<PosterReason | null>(null);
  const [paused, setPaused] = useState(false);
  const [shown, setShown] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    const media = mediaRef.current;
    if (!el || !media) return;
    const hero = media.closest<HTMLElement>('[data-hero]');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;

    let loaded = document.readyState === 'complete';
    let onScreen = true;
    let sourcesAdded = false;
    let userPaused = readPaused();

    const addSources = () => {
      const height = pickHeight(
        video.mp4.map((s) => s.height),
        window.innerWidth,
      );
      for (const [type, list] of [
        ['video/webm', video.webm],
        ['video/mp4', video.mp4],
      ] as const) {
        const match = list.find((s) => s.height === height) ?? list.at(-1);
        if (!match) continue;
        const source = document.createElement('source');
        source.src = match.src;
        source.type = type;
        el.append(source);
      }
      sourcesAdded = true;
      el.load();
    };

    const sync = () => {
      const why = posterReason({
        reducedMotion: reduce.matches,
        saveData: conn?.saveData,
        effectiveType: conn?.effectiveType,
      });
      setReason(why);
      setPaused(userPaused);
      hero?.toggleAttribute('data-motion-paused', userPaused);
      if (why || userPaused) {
        el.pause();
        setState(why ? 'poster' : 'paused');
        return;
      }
      if (!loaded || !onScreen || document.visibilityState === 'hidden') {
        el.pause();
        return;
      }
      if (!sourcesAdded) {
        setState('loading');
        addSources();
      }
      el.muted = true;
      el.play().catch(() => setState('poster'));
    };

    toggleRef.current = () => {
      userPaused = !userPaused;
      writePaused(userPaused);
      sync();
    };

    const onPlaying = () => {
      setShown(true);
      setState('playing');
    };
    const onLoad = () => {
      loaded = true;
      sync();
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true;
      sync();
    });

    el.addEventListener('playing', onPlaying);
    window.addEventListener('load', onLoad);
    document.addEventListener('visibilitychange', sync);
    reduce.addEventListener('change', sync);
    conn?.addEventListener?.('change', sync);
    io.observe(media);
    setReady(true);
    sync();

    return () => {
      el.removeEventListener('playing', onPlaying);
      window.removeEventListener('load', onLoad);
      document.removeEventListener('visibilitychange', sync);
      reduce.removeEventListener('change', sync);
      conn?.removeEventListener?.('change', sync);
      io.disconnect();
      el.pause();
    };
  }, [video]);

  // The button controls all hero motion, so it is offered whenever motion is allowed,
  // including Save-Data and slow connections (the badge still turns there).
  const showButton = ready && reason !== 'reduced-motion';

  return (
    <>
      <div
        ref={mediaRef}
        className={styles.media}
        data-video-state={state}
        data-poster-reason={reason ?? undefined}
        data-video-shown={shown ? '' : undefined}
      >
        <Picture image={video.poster} alt="" sizes="100vw" priority className={styles.poster} />
        <video
          ref={videoRef}
          className={styles.video}
          muted
          playsInline
          loop
          preload="none"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className={styles.overlay} aria-hidden="true" />
        <div className={styles.grain} aria-hidden="true" />
      </div>
      {showButton ? (
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={paused}
          onClick={() => toggleRef.current()}
        >
          <span aria-hidden="true" className={styles.icon} data-icon={paused ? 'play' : 'pause'} />
          <span className="sr-only">Pause background motion</span>
        </button>
      ) : null}
    </>
  );
}
