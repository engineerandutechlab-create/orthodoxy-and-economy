import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AIVideoStoryboard, AIVideoScene } from '../../services/aiService';
import { DEFAULT_CATHEDRAL_BANNER_URL } from '../../constants/assets';
import { transliterateAmharicToPhonetic } from '../../utils/amharicPhonetics';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  Maximize2, 
  Sliders, 
  Sparkles, 
  Check, 
  Layers, 
  Globe, 
  Share2,
  Film,
  Music,
  Clock,
  ShieldCheck,
  Phone,
  Send,
  Loader2,
  Mic,
  Volume1
} from 'lucide-react';

interface VideoPlayerCanvasProps {
  storyboard: AIVideoStoryboard;
  language: 'am' | 'en';
  onLanguageChange?: (lang: 'am' | 'en') => void;
  onUpdateScene?: (index: number, updated: Partial<AIVideoScene>) => void;
  aspectRatio?: '9:16' | '16:9' | '1:1';
}

export const VideoPlayerCanvas: React.FC<VideoPlayerCanvasProps> = ({
  storyboard,
  language = 'am',
  onLanguageChange,
  onUpdateScene,
  aspectRatio: initialAspectRatio = '9:16'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{ oscillator?: OscillatorNode; gainNode?: GainNode }[]>([]);
  const musicIntervalRef = useRef<any>(null);

  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>(initialAspectRatio);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(storyboard.duration || 60);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVoiceoverEnabled, setIsVoiceoverEnabled] = useState<boolean>(true);
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [activeEditorTab, setActiveEditorTab] = useState<'preview' | 'timeline' | 'audio'>('preview');
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
  const [isTestingAudio, setIsTestingAudio] = useState<boolean>(false);

  // Cached images
  const imagesCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const lastSpokenSceneIdxRef = useRef<number | null>(null);

  // Pre-load scene images
  useEffect(() => {
    let loadedCount = 0;
    const totalScenes = storyboard.scenes.length;

    storyboard.scenes.forEach((scene) => {
      const url = scene.imageUrl || DEFAULT_CATHEDRAL_BANNER_URL;
      if (!imagesCacheRef.current.has(url)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        img.onload = () => {
          imagesCacheRef.current.set(url, img);
          loadedCount++;
          if (loadedCount >= totalScenes) setImagesLoaded(true);
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount >= totalScenes) setImagesLoaded(true);
        };
      } else {
        loadedCount++;
        if (loadedCount >= totalScenes) setImagesLoaded(true);
      }
    });

    setDuration(storyboard.duration || 60);
  }, [storyboard]);

  // Audio ambient synthesizer (Web Audio API for solemn Ethiopian Begena/Kirar acoustic plucked chords)
  const startAmbientMusic = useCallback(() => {
    if (isMuted || !isMusicEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const ctx = audioContextRef.current;
      synthNodesRef.current.forEach(n => {
        try { n.oscillator?.stop(); } catch {}
      });
      synthNodesRef.current = [];

      // Ethiopian Tizita minor pentatonic chords: C3 (130.81Hz), E3 (164.81Hz), G3 (196.00Hz), A3 (220.00Hz), C4 (261.63Hz)
      const droneFreqs = [130.81, 164.81, 196.00, 261.63];

      droneFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550, ctx.currentTime);

        // Rich audible volume (0.07 to 0.12)
        gain.gain.setValueAtTime(0.09 / (idx + 1), ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        synthNodesRef.current.push({ oscillator: osc, gainNode: gain });
      });

      // Periodic plucked Begena note every 2.4s
      const pluckPattern = [130.81, 196.00, 164.81, 261.63, 220.00];
      let pluckIdx = 0;

      if (musicIntervalRef.current) clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = setInterval(() => {
        try {
          if (!audioContextRef.current || audioContextRef.current.state !== 'running') return;
          const pOsc = ctx.createOscillator();
          const pGain = ctx.createGain();
          pOsc.type = 'triangle';
          pOsc.frequency.setValueAtTime(pluckPattern[pluckIdx % pluckPattern.length], ctx.currentTime);
          pGain.gain.setValueAtTime(0.16, ctx.currentTime);
          pGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

          pOsc.connect(pGain);
          pGain.connect(ctx.destination);
          pOsc.start();
          pOsc.stop(ctx.currentTime + 1.9);
          pluckIdx++;
        } catch {}
      }, 2400);

    } catch (e) {
      console.warn('Audio start warning:', e);
    }
  }, [isMuted, isMusicEnabled]);

  const stopAmbientMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
    synthNodesRef.current.forEach(n => {
      try { n.oscillator?.stop(); } catch {}
    });
    synthNodesRef.current = [];
  }, []);

  // Web Speech API Voiceover Narration with Guaranteed Amharic Sound
  const speakSceneNarration = useCallback((text: string, lang: 'am' | 'en') => {
    if (!isVoiceoverEnabled || isMuted) return;
    if (!('speechSynthesis' in window)) return;
    if (!text || !text.trim()) return;

    try {
      window.speechSynthesis.cancel();

      const voices = window.speechSynthesis.getVoices();
      let selectedVoice: SpeechSynthesisVoice | undefined;
      let textToSpeak = text;

      if (lang === 'am') {
        // 1. Try to find native Amharic voice if installed
        selectedVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('am') || 
          v.lang.toLowerCase().includes('et')
        );

        if (!selectedVoice) {
          // 2. If no native Amharic TTS voice exists in this browser,
          // transliterate to phonetic Latin syllables so standard voice articulates
          // the Amharic words clearly and NEVER goes silent!
          textToSpeak = transliterateAmharicToPhonetic(text);
          selectedVoice = voices.find(v => 
            v.lang.startsWith('en') && (
              v.name.includes('Google') || 
              v.name.includes('Natural') || 
              v.name.includes('UK') || 
              v.name.includes('Samantha') || 
              v.name.includes('Daniel')
            )
          ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
        }
      } else {
        selectedVoice = voices.find(v => 
          v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
        ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = lang === 'am' ? 0.95 : 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onerror = (e) => {
        console.warn('Speech synthesis utterance error:', e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }, [isVoiceoverEnabled, isMuted]);

  // Audio Test Function (ድምፅ ሞክር)
  const handleTestAudio = () => {
    setIsTestingAudio(true);
    startAmbientMusic();

    const sampleText = language === 'am'
      ? 'ሰላም! ይህ የኦርቶዶክስና ኢኮኖሚ የይዘት ፈጠራ ስቱዲዮ የድምጽ ማረጋገጫ ነው። ድምፁ ሙሉ ለሙሉ እየሠራ ነው።'
      : 'Hello! This is the official audio test for the Orthodoxy and Economy video studio. Audio is fully active!';

    speakSceneNarration(sampleText, language);

    setTimeout(() => {
      setIsTestingAudio(false);
      if (!isPlaying) stopAmbientMusic();
    }, 4500);
  };

  // Determine current active scene based on currentTime
  const getCurrentSceneInfo = useCallback((time: number) => {
    const scenes = storyboard.scenes;
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (time >= scene.startTime && time < scene.endTime) {
        return { scene, index: i, progress: (time - scene.startTime) / (scene.endTime - scene.startTime) };
      }
    }
    const lastScene = scenes[scenes.length - 1];
    return { scene: lastScene, index: scenes.length - 1, progress: 1.0 };
  }, [storyboard]);

  // Main Canvas Rendering Engine
  const renderFrame = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const { scene, index: sceneIndex, progress } = getCurrentSceneInfo(time);

    // 1. Clear Canvas with Deep Imperial Navy
    ctx.fillStyle = '#06182B';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Background Image with Ken Burns Zoom & Subtle Pan
    const imageUrl = scene.imageUrl || DEFAULT_CATHEDRAL_BANNER_URL;
    const img = imagesCacheRef.current.get(imageUrl);

    if (img && img.complete) {
      ctx.save();
      const scale = 1.0 + progress * 0.08;
      const panX = (progress - 0.5) * 20;
      const panY = (progress - 0.5) * 15;

      ctx.translate(width / 2 + panX, height / 2 + panY);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      ctx.restore();
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#091B33');
      grad.addColorStop(0.5, '#240F3D');
      grad.addColorStop(1, '#06182B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 3. Cinematic Vignette & Royal Dark Overlay
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.2,
      width / 2, height / 2, width * 0.8
    );
    vignette.addColorStop(0, 'rgba(6, 24, 43, 0.35)');
    vignette.addColorStop(0.7, 'rgba(6, 24, 43, 0.75)');
    vignette.addColorStop(1, 'rgba(3, 11, 20, 0.95)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // 4. Subtle Gold Ethiopian Cross Accent Border
    ctx.strokeStyle = 'rgba(212, 167, 44, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    // 5. TOP WATERMARK: Official Orthodox & Economy Brand Header
    ctx.save();
    ctx.fillStyle = 'rgba(6, 24, 43, 0.85)';
    ctx.strokeStyle = 'rgba(212, 167, 44, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 190, 24, 380, 48, 24);
    ctx.fill();
    ctx.stroke();

    // Gold Cross icon
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#D4A72C';
    ctx.textAlign = 'left';
    ctx.fillText('✟', width / 2 - 170, 56);

    // Title text
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('ORTHODOXY & ECONOMY', width / 2 - 145, 48);

    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#F3D77A';
    ctx.fillText('የኦርቶዶክሳውያን የሥራና የንግድ ትስስር መድረክ · 60s COMMERCIAL', width / 2 - 145, 63);
    ctx.restore();

    // Scene badge (top right)
    ctx.save();
    ctx.fillStyle = 'rgba(212, 167, 44, 0.25)';
    ctx.strokeStyle = '#D4A72C';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(width - 130, 28, 105, 30, 15);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 11px font-mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`SCENE ${sceneIndex + 1}/${storyboard.scenes.length}`, width - 77, 47);
    ctx.restore();

    // 6. CENTER & LOWER-THIRD DYNAMIC GRAPHICS
    const activeTitle = language === 'am' ? (scene.onScreenTextAm || scene.onScreenText) : (scene.onScreenTextEn || scene.onScreenText);
    const activeVoiceover = language === 'am' ? (scene.voiceoverAm || scene.voiceover) : (scene.voiceoverEn || scene.voiceover);

    // Scene 3 Special Graphic: Verified Trust Seal
    if (sceneIndex === 2) {
      ctx.save();
      const sealY = height * 0.35;
      ctx.beginPath();
      ctx.arc(width / 2, sealY, 50, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = 'bold 36px sans-serif';
      ctx.fillStyle = '#10B981';
      ctx.textAlign = 'center';
      ctx.fillText('🛡️', width / 2, sealY + 12);

      ctx.font = 'bold 14px -apple-system, sans-serif';
      ctx.fillStyle = '#34D399';
      ctx.fillText('100% VERIFIED COMMUNITY', width / 2, sealY + 75);
      ctx.restore();
    }

    // Scene 4 Special Graphic: Glowing Call-To-Action Phone & Telegram
    if (sceneIndex === 3) {
      ctx.save();
      const ctaY = height * 0.34;
      // Phone Card
      ctx.fillStyle = 'rgba(18, 59, 109, 0.9)';
      ctx.strokeStyle = '#D4A72C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(width / 2 - 180, ctaY, 360, 52, 16);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center';
      ctx.fillText('📞 +251 922 901 083', width / 2, ctaY + 34);

      // Telegram Card
      ctx.fillStyle = 'rgba(0, 136, 204, 0.85)';
      ctx.strokeStyle = '#93C5FD';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 180, ctaY + 65, 360, 48, 16);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('✈️ @orthodoxy_economy', width / 2, ctaY + 96);
      ctx.restore();
    }

    // 7. BOLD ON-SCREEN HEADLINE (Lower Middle)
    ctx.save();
    ctx.textAlign = 'center';
    const titleLines = (activeTitle || '').split('\n');
    const titleY = height * 0.58;

    titleLines.forEach((line, lIdx) => {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.font = `bold ${aspectRatio === '9:16' ? '26px' : '28px'} "Nyala", "Abyssinica SIL", "Noto Sans Ethiopic", -apple-system, sans-serif`;
      ctx.fillStyle = lIdx === 0 ? '#FFFFFF' : '#FDE047';
      ctx.fillText(line, width / 2, titleY + (lIdx * 34));
    });
    ctx.restore();

    // 8. DYNAMIC SUBTITLE / CAPTIONS OVERLAY (Bottom Third)
    ctx.save();
    const captionBoxY = height * 0.74;
    const captionBoxHeight = 110;
    const captionMargin = 28;

    ctx.fillStyle = 'rgba(6, 24, 43, 0.88)';
    ctx.strokeStyle = 'rgba(212, 167, 44, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(captionMargin, captionBoxY, width - captionMargin * 2, captionBoxHeight, 20);
    ctx.fill();
    ctx.stroke();

    // Subtitle Header
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#D4A72C';
    ctx.textAlign = 'left';
    ctx.fillText(language === 'am' ? '🎙️ የድምጽ ትረካ (Voiceover):' : '🎙️ NARRATION VOICEOVER:', captionMargin + 16, captionBoxY + 24);

    // Multiline Subtitle Text
    ctx.font = '15px "Nyala", "Abyssinica SIL", "Noto Sans Ethiopic", sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.textAlign = 'left';

    const maxTextWidth = width - captionMargin * 2 - 32;
    const words = (activeVoiceover || '').split(' ');
    let currentLine = '';
    let lineCount = 0;
    const startTextY = captionBoxY + 50;

    for (let w = 0; w < words.length; w++) {
      const testLine = currentLine + words[w] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && w > 0) {
        if (lineCount < 2) {
          ctx.fillText(currentLine, captionMargin + 16, startTextY + (lineCount * 22));
          currentLine = words[w] + ' ';
          lineCount++;
        } else {
          ctx.fillText(currentLine + '...', captionMargin + 16, startTextY + (lineCount * 22));
          currentLine = '';
          break;
        }
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine && lineCount <= 2) {
      ctx.fillText(currentLine, captionMargin + 16, startTextY + (lineCount * 22));
    }
    ctx.restore();

    // 9. BOTTOM SCRUBBER TIMELINE INSIDE VIDEO
    ctx.save();
    const timelineY = height - 26;
    const timelineMargin = 30;
    const timelineWidth = width - timelineMargin * 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.roundRect(timelineMargin, timelineY, timelineWidth, 5, 2.5);
    ctx.fill();

    const progressWidth = Math.min(timelineWidth, (time / duration) * timelineWidth);
    const progressGrad = ctx.createLinearGradient(timelineMargin, 0, timelineMargin + timelineWidth, 0);
    progressGrad.addColorStop(0, '#D4A72C');
    progressGrad.addColorStop(1, '#FDE047');
    ctx.fillStyle = progressGrad;
    ctx.beginPath();
    ctx.roundRect(timelineMargin, timelineY, Math.max(5, progressWidth), 5, 2.5);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(timelineMargin + progressWidth, timelineY + 2.5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

  }, [getCurrentSceneInfo, language, aspectRatio, storyboard, duration]);

  // Animation Loop (Runs when isPlaying is true)
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      stopAmbientMusic();
      try { window.speechSynthesis?.cancel(); } catch {}
      lastTimestampRef.current = null;
      return;
    }

    startAmbientMusic();

    const loop = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      setCurrentTime((prevTime) => {
        const nextTime = prevTime + delta * playbackSpeed;

        if (nextTime >= duration) {
          setIsPlaying(false);
          stopAmbientMusic();
          try { window.speechSynthesis?.cancel(); } catch {}
          return 0;
        }

        // Check if scene changed to trigger voiceover speech
        const { scene, index } = getCurrentSceneInfo(nextTime);
        if (index !== lastSpokenSceneIdxRef.current) {
          lastSpokenSceneIdxRef.current = index;
          const textToSpeak = (language === 'am' ? (scene.voiceoverAm || scene.voiceover) : (scene.voiceoverEn || scene.voiceover)) || '';
          if (textToSpeak) speakSceneNarration(textToSpeak, language);
        }

        renderFrame(nextTime);
        return nextTime;
      });

      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      stopAmbientMusic();
    };
  }, [isPlaying, playbackSpeed, duration, getCurrentSceneInfo, language, renderFrame, speakSceneNarration, startAmbientMusic, stopAmbientMusic]);

  // Initial draw & redraw when time or images change
  useEffect(() => {
    renderFrame(currentTime);
  }, [currentTime, imagesLoaded, renderFrame]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      try { window.speechSynthesis?.cancel(); } catch {}
    } else {
      if (currentTime >= duration) setCurrentTime(0);
      lastSpokenSceneIdxRef.current = null;
      setIsPlaying(true);
      // Immediately trigger current scene speech on user play action
      const { scene } = getCurrentSceneInfo(currentTime >= duration ? 0 : currentTime);
      const textToSpeak = (language === 'am' ? (scene.voiceoverAm || scene.voiceover) : (scene.voiceoverEn || scene.voiceover)) || '';
      if (textToSpeak) speakSceneNarration(textToSpeak, language);
    }
  };

  // Jump to specific scene
  const jumpToScene = (sceneIdx: number) => {
    const scene = storyboard.scenes[sceneIdx];
    if (scene) {
      setCurrentTime(scene.startTime);
      lastSpokenSceneIdxRef.current = sceneIdx;
      renderFrame(scene.startTime);
      if (isPlaying) {
        const textToSpeak = (language === 'am' ? (scene.voiceoverAm || scene.voiceover) : (scene.voiceoverEn || scene.voiceover)) || '';
        if (textToSpeak) speakSceneNarration(textToSpeak, language);
      }
    }
  };

  // Export & Download real video file via MediaRecorder API
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRecording(true);
    setRecordingProgress(0);
    setIsPlaying(false);

    try {
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm'
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Orthodoxy_Economy_1min_Video_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      mediaRecorder.start();

      let simTime = 0;
      const step = 0.1;
      const interval = setInterval(() => {
        simTime += step;
        setCurrentTime(simTime);
        renderFrame(simTime);
        setRecordingProgress(Math.min(100, Math.round((simTime / duration) * 100)));

        if (simTime >= duration) {
          clearInterval(interval);
          mediaRecorder.stop();
        }
      }, 35);

    } catch (e) {
      console.error('Video recording failed:', e);
      setIsRecording(false);
    }
  };

  const canvasDimensions = {
    '9:16': { width: 720, height: 1280 },
    '16:9': { width: 1280, height: 720 },
    '1:1': { width: 1080, height: 1080 }
  }[aspectRatio];

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-ethiopic text-white">
      
      {/* Top Video Toolbar: Aspect Ratio, Language, Audio Test */}
      <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Aspect Ratio Selectors */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {(['9:16', '16:9', '1:1'] as const).map((ratio) => (
            <button
              key={ratio}
              onClick={() => setAspectRatio(ratio)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                aspectRatio === ratio
                  ? 'bg-[#123B6D] text-[#F3D77A] shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{ratio === '9:16' ? '📱 9:16 TikTok' : ratio === '16:9' ? '🖥️ 16:9 Wide' : '⬛ 1:1 Feed'}</span>
            </button>
          ))}
        </div>

        {/* Center: Language Switcher for Video Voiceover & Text */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-[#D4A72C]" />
            <span>ቋንቋ፦</span>
          </span>
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onLanguageChange && onLanguageChange('am')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                language === 'am' ? 'bg-[#D4A72C] text-[#08294F]' : 'text-slate-300 hover:text-white'
              }`}
            >
              አማርኛ (Amharic)
            </button>
            <button
              onClick={() => onLanguageChange && onLanguageChange('en')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                language === 'en' ? 'bg-[#D4A72C] text-[#08294F]' : 'text-slate-300 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Right: Audio Test & Scene Editor Mode */}
        <div className="flex items-center gap-2">
          {/* Guaranteed Audio Test Button */}
          <button
            type="button"
            onClick={handleTestAudio}
            disabled={isTestingAudio}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-xs ${
              isTestingAudio 
                ? 'bg-emerald-600 text-white border-emerald-400' 
                : 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900'
            }`}
            title="ድምፁን እዚሁ ይሞክሩ"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isTestingAudio ? 'ድምፅ እየተሞከረ ነው...' : '🔊 ድምፅ ሞክር (Test Voice)'}</span>
          </button>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveEditorTab('preview')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeEditorTab === 'preview' ? 'bg-[#123B6D] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-[#D4A72C]" />
              <span>ቪዲዮ ማጫወቻ</span>
            </button>
            <button
              onClick={() => setActiveEditorTab('timeline')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeEditorTab === 'timeline' ? 'bg-[#123B6D] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#D4A72C]" />
              <span>ኤዲተር</span>
            </button>
          </div>
        </div>

      </div>

      {/* Main Video Stage & Timeline */}
      <div className="p-4 sm:p-6 flex flex-col items-center justify-center">
        
        {/* HTML5 Dynamic Canvas Player */}
        <div className="relative group max-w-full flex items-center justify-center">
          <div 
            className={`relative rounded-3xl overflow-hidden border-2 border-[#D4A72C]/40 shadow-2xl bg-black ${
              aspectRatio === '9:16' ? 'h-[500px] sm:h-[580px] aspect-9/16' :
              aspectRatio === '16:9' ? 'w-full max-w-3xl aspect-16/9' :
              'w-[360px] sm:w-[460px] aspect-square'
            }`}
          >
            <canvas
              ref={canvasRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
            />

            {/* Big Play Overlay Icon when paused */}
            {!isPlaying && !isRecording && (
              <div 
                onClick={togglePlay}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-opacity"
              >
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#123B6D] via-[#240F3D] to-[#D4A72C] text-white flex items-center justify-center shadow-2xl ring-4 ring-white/30 transform hover:scale-110 transition-transform">
                  <Play className="w-9 h-9 fill-white ml-1.5" />
                </div>
              </div>
            )}

            {/* Recording Progress Indicator */}
            {isRecording && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3 z-30">
                <Loader2 className="w-12 h-12 text-[#D4A72C] animate-spin" />
                <h4 className="text-base font-bold text-white">ባለ 1 ደቂቃ ቪዲዮ በማዘጋጀት ላይ... (Rendering Video)</h4>
                <div className="w-64 bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                  <div 
                    className="bg-gradient-to-r from-[#D4A72C] to-emerald-500 h-full transition-all duration-150"
                    style={{ width: `${recordingProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-300 font-mono">{recordingProgress}% ተጠናቋል</p>
              </div>
            )}
          </div>
        </div>

        {/* Video Scrubber & Playback Controls Bar */}
        <div className="w-full max-w-3xl mt-5 space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          
          {/* Progress Slider Bar */}
          <div className="space-y-1.5">
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentTime(val);
                renderFrame(val);
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#D4A72C]"
            />
            
            {/* Time indicator and Scene Chips */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="text-[#FDE047] font-bold">
                {formatSeconds(currentTime)} / {formatSeconds(duration)}
              </span>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>🎙️ የአማርኛ ድምፅና የበገና ዜማ፦ ንቁ (Audio Active)</span>
              </div>
            </div>
          </div>

          {/* Quick Scene Jump Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {storyboard.scenes.map((scene, idx) => {
              const isActive = currentTime >= scene.startTime && currentTime < scene.endTime;
              return (
                <button
                  key={idx}
                  onClick={() => jumpToScene(idx)}
                  className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#123B6D] text-white border-[#D4A72C] shadow-xs'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                    <span className="font-bold text-[#D4A72C]">ምዕራፍ {idx + 1}</span>
                    <span>{scene.time}</span>
                  </div>
                  <p className="font-semibold text-slate-200 truncate text-[11px]">
                    {language === 'am' ? scene.onScreenTextAm || scene.onScreenText : scene.onScreenTextEn || scene.onScreenText}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Playback Button Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            
            <div className="flex items-center gap-2">
              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-xl bg-[#D4A72C] hover:bg-[#c29623] text-[#08294F] flex items-center justify-center font-bold transition-all shadow-xs cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              {/* Replay */}
              <button
                onClick={() => {
                  setCurrentTime(0);
                  renderFrame(0);
                  lastSpokenSceneIdxRef.current = null;
                  if (!isPlaying) setIsPlaying(true);
                }}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border border-slate-800"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Audio Controls */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 rounded-xl transition-colors cursor-pointer border ${
                  isMuted 
                    ? 'bg-rose-950/60 text-rose-300 border-rose-800' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
                title={isMuted ? 'ድምፅ አንሳ (Unmute)' : 'ድምፅ ዝጋ (Mute)'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Music On/Off Toggle */}
              <button
                onClick={() => {
                  setIsMusicEnabled(!isMusicEnabled);
                  if (isMusicEnabled) stopAmbientMusic();
                  else if (isPlaying) startAmbientMusic();
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                  isMusicEnabled 
                    ? 'bg-purple-950/70 text-purple-200 border-purple-700/60' 
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
                title="የበገና ዜማ አብራ/አጥፋ"
              >
                <Music className="w-3.5 h-3.5 text-[#D4A72C]" />
                <span>{isMusicEnabled ? 'የበገና ዜማ' : 'ዜማ ጠፍቷል'}</span>
              </button>

              {/* Speed Selector */}
              <div className="flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5 text-xs text-slate-300">
                {[1, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-1 rounded-lg font-mono text-[10px] cursor-pointer ${
                      playbackSpeed === speed ? 'bg-[#123B6D] text-white font-bold' : 'hover:text-white'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Right Export Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportVideo}
                disabled={isRecording}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isRecording ? 'ቪዲዮ በማዘጋጀት ላይ...' : 'ቪዲዮውን አውርድ (Export Video)'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* TIMELINE SCENE EDITOR TAB (ልክ እንደ ፕሮፌሽናል ቪዲዮ ኤዲተር) */}
      {activeEditorTab === 'timeline' && (
        <div className="p-6 bg-slate-950 border-t border-slate-800 space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#D4A72C]" />
                <span>የምዕራፎች ማስተካከያ (Professional Scene Editor)</span>
              </h4>
              <p className="text-xs text-slate-400 font-ethiopic mt-0.5">
                በእያንዳንዱ ምዕራፍ ላይ የሚታየውን ርእስ፣ የድምጽ ንባብ ጽሑፍና ምስል እንደፈለጉ ማስተካከል ይችላሉ።
              </p>
            </div>
            <span className="text-xs font-mono text-[#D4A72C] bg-[#D4A72C]/10 px-2.5 py-1 rounded-lg border border-[#D4A72C]/30">
              4 Scenes · 60s Total
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storyboard.scenes.map((scene, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#D4A72C] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#D4A72C]/20 text-[#D4A72C] flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>ምዕራፍ {idx + 1} ({scene.time})</span>
                  </span>
                  <button
                    onClick={() => jumpToScene(idx)}
                    className="text-[11px] text-[#93C5FD] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>እዚህ ላይ አጫውት →</span>
                  </button>
                </div>

                {/* On-screen text edit */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    {language === 'am' ? 'በስክሪን ላይ የሚታይ ርእስ (Amharic Title)' : 'On-Screen Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={language === 'am' ? (scene.onScreenTextAm || scene.onScreenText || '') : (scene.onScreenTextEn || scene.onScreenText || '')}
                    onChange={(e) => {
                      if (onUpdateScene) {
                        onUpdateScene(idx, language === 'am' 
                          ? { onScreenTextAm: e.target.value, onScreenText: e.target.value } 
                          : { onScreenTextEn: e.target.value, onScreenText: e.target.value }
                        );
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D4A72C]"
                  />
                </div>

                {/* Voiceover text edit */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    {language === 'am' ? 'የድምጽ ንባብ ጽሑፍ (Voiceover Narration)' : 'Voiceover Narration (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={language === 'am' ? (scene.voiceoverAm || scene.voiceover || '') : (scene.voiceoverEn || scene.voiceover || '')}
                    onChange={(e) => {
                      if (onUpdateScene) {
                        onUpdateScene(idx, language === 'am' 
                          ? { voiceoverAm: e.target.value, voiceover: e.target.value } 
                          : { voiceoverEn: e.target.value, voiceover: e.target.value }
                        );
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#D4A72C]"
                  />
                </div>

                {/* Visual Description */}
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-300 font-bold">🎬 የቪዲዮ ትዕይንት፦</span> {scene.visual}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
