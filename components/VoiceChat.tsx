
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { UserProfile, AppMode } from '../types';
import { NOVA_AI_SYSTEM_INSTRUCTION } from '../constants';
import { decode, decodeAudioData, createBlob } from '../services/audioUtils';

interface VoiceChatProps {
  userProfile: UserProfile;
  appMode: AppMode;
  onFeedback: (rating: 'good' | 'bad') => void;
  onDeduct: (wordCount: number) => void;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ userProfile, appMode, onFeedback, onDeduct }) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  const [transcription, setTranscription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const drawVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyzerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);
      analyzerRef.current!.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = status === 'speaking' ? 90 : 70;
      for (let i = 0; i < bufferLength; i += 2) {
        const barHeight = (dataArray[i] / 255) * 100;
        const angle = (i * 2 * Math.PI) / bufferLength;
        ctx.beginPath();
        ctx.strokeStyle = status === 'speaking' ? '#D4AF37' : '#0070f3';
        ctx.lineWidth = 2;
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };
    renderFrame();
  }, [status]);

  const stopSession = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {
        console.debug('Session already closed');
      }
      sessionRef.current = null;
    }

    // Safely close AudioContexts
    [audioContextRef.current, outputAudioContextRef.current].forEach(ctx => {
      if (ctx && ctx.state !== 'closed') {
        ctx.close().catch(err => console.debug('Error closing context:', err));
      }
    });
    audioContextRef.current = null;
    outputAudioContextRef.current = null;

    // Stop and clear sources
    sourcesRef.current.forEach(s => {
      try {
        s.stop();
      } catch (e) {
        // Source might not have started or already stopped
      }
    });
    sourcesRef.current.clear();
    
    setStatus('idle');
  }, []);

  const startSession = async () => {
    try {
      const isExhausted = userProfile.credits <= 0 && userProfile.role !== 'admin' && appMode === 'paid';
      if (isExhausted) return;

      setStatus('connecting');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;
      outputAudioContextRef.current = outputCtx;
      analyzerRef.current = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyzerRef.current);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('listening');
            const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (sessionRef.current) {
                sessionRef.current.sendRealtimeInput({ media: createBlob(e.inputBuffer.getChannelData(0)) });
              }
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscription(text);
              onDeduct(text.split(/\s+/).length);
            }
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              setStatus('speaking');
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const node = outputCtx.createBufferSource();
              node.buffer = buffer;
              node.connect(outputCtx.destination);
              node.onended = () => {
                sourcesRef.current.delete(node);
                if (sourcesRef.current.size === 0) setStatus('listening');
              };
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              node.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(node);
            }
          },
          onerror: (e) => {
            console.error('Session error:', e);
            stopSession();
          },
          onclose: (e) => {
            console.debug('Session closed:', e);
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: NOVA_AI_SYSTEM_INSTRUCTION + `\n\nCONTEXT: User Name: ${userProfile.name}, User Type: ${userProfile.type}.`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {}, outputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
      drawVisualizer();
    } catch (e) { 
      console.error('Start session error:', e);
      setError('Mic error or connection failure'); 
      setStatus('idle'); 
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-10">
      <div className="relative flex items-center justify-center">
        <canvas ref={canvasRef} width={400} height={400} className="relative z-10 opacity-60" />
        <button onClick={status === 'idle' ? startSession : stopSession} className={`absolute z-20 w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500 ${status === 'idle' ? 'glass hover:bg-white/10' : 'bg-nova-gold text-nova-navy shadow-2xl shadow-nova-gold/20'}`}>
          <i className={`fas ${status === 'idle' ? 'fa-microphone text-3xl mb-2' : 'fa-stop text-3xl mb-2'}`}></i>
          <span className="text-[8px] font-black uppercase tracking-widest">{status === 'idle' ? 'Talk' : 'Stop'}</span>
        </button>
      </div>
      <div className="text-center space-y-4 max-w-xl px-10">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40">{status.toUpperCase()}</h3>
        {transcription && <p className="text-sm font-light italic text-white/60">"{transcription}"</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default VoiceChat;
