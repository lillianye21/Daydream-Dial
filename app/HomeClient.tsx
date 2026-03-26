"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import localFont from 'next/font/local';

const retrogression = localFont({ src: '../public/fonts/Retrogression-Regular.otf' });

function TopicBankView({ topics, onBack }: { topics: string[], onBack: () => void }) {
  return (
    <div className="flex min-h-[350px] md:h-[500px] w-full max-w-5xl flex-col rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-[#4a2b4d] bg-white p-5 md:p-10 shadow-[6px_6px_0px_0px_#f9afbd] md:shadow-[12px_12px_0px_0px_#f9afbd] relative transition-all overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="text-sm font-bold uppercase tracking-widest text-[#b08ba6] hover:text-[#4a2b4d] transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#8a5a83]">
          Topic Bank
        </h2>
        <div className="w-16"></div> {/* spacer to center title */}
      </div>

      <div className="flex-1 overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#d2a8d6] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#b08ba6]">
        {topics.length === 0 ? (
          <div className="flex h-full items-center justify-center flex-col gap-2">
            <div className="text-5xl">🕸️</div>
            <div className="text-zinc-500 font-medium">No topics available.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-8">
            {topics.map((topic, index) => (
              <div key={index} className="flex p-5 rounded-2xl border-2 border-[#f7e4e9] bg-[#fdfafb] hover:border-[#dbafde] hover:bg-white transition-colors">
                 <span className={`font-bold text-lg leading-tight ${index % 2 === 0 ? 'text-[#c04b6c]' : 'text-[#d67597]'}`}>{topic}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TimerView({ topic, onBack, onComplete }: { topic: string; onBack: () => void; onComplete: () => void }) {
  const [phase, setPhase] = useState<'brainstorm' | 'speak' | 'completed'>('brainstorm');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      // Give React a moment to render the 0:00 time before blocking the thread with an alert
      setTimeout(async () => {
        if (phase === 'brainstorm') {
          alert("Time's up! Get ready to speak.");
          setPhase('speak');
          setTimeLeft(60);
        } else if (phase === 'speak') {
          alert("Talk is over! Great job.");
          setPhase('completed');
          
          setIsSaving(true);
          try {
             // Save to supabase
             const { error } = await supabase.from('daydream_speaking_history').insert({
                topic: topic,
                duration_seconds: 60,
             });
             
             if (error) {
               console.error("Supabase insert error:", error);
               alert(`Warning: Failed to save to history log.\n\nError: ${error.message || JSON.stringify(error)}\n\nPlease check your Supabase table and RLS settings.`);
             } else {
               // Successfully saved, so remove it from the spinner
               onComplete();
             }
             
          } catch (e) {
             console.error("Failed to save history:", e);
             alert("Error connecting to database to save history.");
          } finally {
             setIsSaving(false);
          }
        }
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, phase, topic]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex min-h-[400px] md:h-[500px] w-full max-w-5xl flex-col items-center justify-center rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-[#4a2b4d] bg-white p-6 md:p-12 shadow-[6px_6px_0px_0px_#f9afbd] md:shadow-[12px_12px_0px_0px_#f9afbd] text-center relative transition-all">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 text-sm font-bold uppercase tracking-widest text-[#b08ba6] hover:text-[#4a2b4d] transition-colors"
      >
        ← Back
      </button>

      <h2 className={`text-base md:text-xl font-bold uppercase tracking-widest mb-3 md:mb-4 ${phase === 'completed' ? 'text-[#4a2b4d]' : 'text-[#f7a1b2]'}`}>
        {phase === 'brainstorm' ? 'Brainstorming Session 💭' : phase === 'speak' ? 'Speaking Session 🎤' : 'Session Complete ✨'}
      </h2>
      
      <p className="text-xl md:text-[2rem] font-extrabold tracking-tight leading-tight max-w-2xl mb-6 md:mb-12">
        {topic}
      </p>

      {phase !== 'completed' ? (
        <>
          <div className="text-5xl md:text-8xl font-extrabold tabular-nums tracking-tight mb-6 md:mb-12 drop-shadow-sm">
            {timeString}
          </div>

          {!isRunning && timeLeft === 60 ? (
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <button 
                onClick={handleStart}
                className="rounded-2xl bg-[#dbafde] px-8 md:px-12 py-3 md:py-4 text-base md:text-xl font-bold text-[#4a2b4d] transition-transform hover:-translate-y-1 hover:shadow-[0px_4px_0px_0px_#f7a1b2] active:translate-y-0 active:shadow-none"
              >
                {phase === 'brainstorm' ? 'Start Brainstorming' : 'Start Speaking Now'}
              </button>
              <button 
                onClick={() => { setTimeLeft(0); setIsRunning(true); }}
                className="rounded-2xl px-6 md:px-8 py-3 md:py-4 text-base md:text-xl font-bold text-[#f7a1b2] hover:text-[#e36b89] hover:bg-[#fdfafb] transition-colors"
              >
                End Session
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <button 
                onClick={isRunning ? handlePause : handleStart}
                className="rounded-2xl border-4 border-[#4a2b4d] bg-white px-8 md:px-12 py-3 text-base md:text-xl font-bold text-[#4a2b4d] transition-transform hover:-translate-y-1 hover:shadow-[0px_4px_0px_0px_#dbafde] active:translate-y-0 active:shadow-none min-w-[120px] md:min-w-[160px]"
              >
                {isRunning ? 'Pause' : 'Resume'}
              </button>
              <button 
                onClick={() => {
                  setIsRunning(false);
                  setTimeLeft(60);
                }}
                className="rounded-2xl px-6 md:px-8 py-3 text-base md:text-xl font-bold text-[#b08ba6] hover:text-[#4a2b4d] hover:bg-[#f7e4e9] transition-colors"
              >
                Restart
              </button>
              <button 
                onClick={() => { setTimeLeft(0); setIsRunning(true); }}
                className="rounded-2xl px-6 md:px-8 py-3 text-base md:text-xl font-bold text-[#f7a1b2] hover:text-[#e36b89] hover:bg-[#fdfafb] transition-colors"
              >
                End Session
              </button>
            </div>
          )}
        </>
      ) : (
        <button 
          onClick={onBack}
          disabled={isSaving}
          className="rounded-2xl bg-[#f9afbd] px-8 md:px-12 py-3 md:py-4 text-base md:text-xl font-bold text-[#4a2b4d] transition-transform hover:-translate-y-1 hover:shadow-[0px_4px_0px_0px_#dbafde] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-wait"
        >
          {isSaving ? 'Saving session log...' : 'Return to Spinner'}
        </button>
      )}
    </div>
  );
}

function HistoryView({ onBack }: { onBack: () => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('daydream_speaking_history')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setHistory(data);
      }
      setIsLoading(false);
    }
    fetchHistory();
  }, []);

  return (
    <div className="flex min-h-[350px] md:h-[500px] w-full max-w-5xl flex-col rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-[#4a2b4d] bg-white p-5 md:p-10 shadow-[6px_6px_0px_0px_#f9afbd] md:shadow-[12px_12px_0px_0px_#f9afbd] relative transition-all overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="text-sm font-bold uppercase tracking-widest text-[#b08ba6] hover:text-[#4a2b4d] transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#4a2b4d]">
          Speaking History
        </h2>
        <div className="w-16"></div> {/* spacer to center title */}
      </div>

      <div className="flex-1 overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#d2a8d6] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#b08ba6]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-[#b08ba6] font-bold uppercase tracking-widest animate-pulse">Loading Logs...</div>
          </div>
        ) : history.length === 0 ? (
          <div className="flex h-full items-center justify-center flex-col gap-2">
            <div className="text-5xl">☁️</div>
            <div className="text-[#b08ba6] font-medium">No speaking sessions recorded yet.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-8">
            {history.map((log) => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border-2 border-[#f7e4e9] bg-[#fdfafb] hover:border-[#dbafde] hover:bg-white transition-colors gap-4">
                 <div className="flex flex-col gap-1 pr-4">
                    <span className="font-bold text-lg leading-tight text-[#4a2b4d]">{log.topic}</span>
                 </div>
                 <div className="flex flex-col items-start sm:items-end gap-1 min-w-[120px]">
                    <span className="text-lg font-bold uppercase tracking-widest text-[#f7a1b2]">
                       {new Date(log.created_at).toLocaleDateString()}
                    </span>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [topics, setTopics] = useState<string[]>([]);
  const [view, setView] = useState<'spinner' | 'timer' | 'history' | 'topicBank'>('spinner');
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinOffset, setSpinOffset] = useState(0);
  const [selectedTopicStr, setSelectedTopicStr] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopicVal, setNewTopicVal] = useState("");
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);

  const CURSOR_IMAGES = [
    '/cursors/Photoroom_20260326_002146.png',
    '/cursors/Photoroom_20260326_002323.png',
    '/cursors/Photoroom_20260326_005250.png',
    '/cursors/Photoroom_20260326_005323.png',
  ];

  const [selectedCursor, setSelectedCursor] = useState(CURSOR_IMAGES[0]);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Random Initial Cursor
    const randomIdx = Math.floor(Math.random() * CURSOR_IMAGES.length);
    setSelectedCursor(CURSOR_IMAGES[randomIdx]);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    async function fetchTopics() {
      setIsLoadingTopics(true);
      const { data, error } = await supabase
        .from('daydream_topics')
        .select('content')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
        
      if (!error && data) {
        const fetchedTopics = data.map((t: any) => t.content);
        setTopics(fetchedTopics);
        if (fetchedTopics.length > 0) {
          setSelectedTopicStr(fetchedTopics[0]);
        }
      }
      setIsLoadingTopics(false);
    }
    fetchTopics();
  }, []);
  
  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setShowModal(false);

    const winnerIndex = Math.floor(Math.random() * topics.length);
    const loops = 4;
    const currentTopicIndex = spinOffset % topics.length;
    
    let itemsToScroll = (loops * topics.length) + (winnerIndex - currentTopicIndex);
    // ensure we scroll forward a significant amount each time
    if (itemsToScroll < 3 * topics.length) itemsToScroll += topics.length;

    const newSpinOffset = spinOffset + itemsToScroll;
    setSpinOffset(newSpinOffset);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedTopicStr(topics[newSpinOffset % topics.length]);
      setTimeout(() => setShowModal(true), 600);
    }, 3000); // 3s transition duration for the CSS transform
  };

  const handleSelectTopic = () => {
    setShowModal(false);
    setView('timer');
  };

  const handleSessionComplete = async () => {
    // Remove the completed topic from our active list by exact string match
    setTopics(prev => prev.filter(t => t !== selectedTopicStr));
    await supabase.from('daydream_topics').update({ is_active: false }).eq('content', selectedTopicStr);
  };

  return (
    <div className="flex min-h-screen items-center justify-center font-sans text-[#4a2b4d] overflow-hidden selection:bg-[#f9afbd] selection:text-[#4a2b4d] relative">
      {/* Custom Cursor */}
      <div 
        className="custom-cursor-container"
        style={{ 
          left: `${mousePos.x}px`, 
          top: `${mousePos.y}px`,
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 9999,
          width: '64px',
          height: '64px',
          transform: 'translate(-10px, -10px)',
        }}
      >
        <img src={selectedCursor} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
      </div>
      <div className="absolute top-8 left-12 text-[#4a2b4d] whitespace-pre font-mono text-sm pointer-events-none z-0 hidden md:block leading-snug">
{`┊         ┊       ┊   ┊    ┊        ┊
┊         ┊       ┊   ┊   ˚★⋆｡˚  ⋆
┊         ┊       ┊   ⋆
┊         ┊       ★⋆
┊ ◦
★⋆      ┊ .  ˚
           ˚★`}
      </div>

      {/* Cursor Menu - absolutely positioned on the left */}
      <div className="hidden lg:flex flex-col rounded-[2.5rem] border-4 border-[#4a2b4d] bg-white items-center justify-around p-5 shadow-[12px_12px_0px_0px_#f9afbd] z-20"
        style={{ position: 'absolute', left: '40px', top: '50%', transform: 'translateY(-50%)', width: '110px', gap: '16px' }}
      >
        {CURSOR_IMAGES.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedCursor(img)}
            className={`cursor-menu-item ${selectedCursor === img ? 'active' : ''}`}
          >
            <img src={img} alt="" style={{ width: i === 0 ? '100px' : '90px', height: i === 0 ? '100px' : '90px', objectFit: 'contain' }} />
          </button>
        ))}
      </div>

      {view === 'spinner' ? (
        <div className="flex flex-col items-center w-full max-w-5xl relative px-4 md:px-0">
          {/* Illustrations */}
          <img 
            src="/images/bunny3.jpg" 
            alt="" 
            className="hidden md:block absolute -top-[392px] -left-10 w-56 h-auto pointer-events-none animate-float-slow z-0 opacity-90 mix-blend-multiply"
          />
          <img 
            src="/images/bunny.jpg" 
            alt="" 
            className="hidden md:block absolute -top-[326px] -right-16 w-52 h-auto pointer-events-none animate-float z-0 opacity-90 mix-blend-multiply"
          />
          <img 
            src="/images/girl.png" 
            alt="" 
            className="hidden md:block absolute -bottom-[520px] left-1/2 -translate-x-[60%] w-[32rem] h-auto pointer-events-none animate-drift z-0 opacity-95"
          />
          <img 
            src="/images/bunny2.jpg" 
            alt="" 
            className="hidden md:block absolute -bottom-[342px] -right-[130px] w-56 h-auto pointer-events-none animate-float-slow z-0 opacity-90 mix-blend-multiply"
          />

        <main className="flex flex-col md:flex-row h-auto md:h-[500px] w-full items-center justify-between rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-[#4a2b4d] bg-white p-6 md:p-12 shadow-[6px_6px_0px_0px_#f9afbd] md:shadow-[12px_12px_0px_0px_#f9afbd] transition-all relative">
          
          <button 
            onClick={() => setView('history')}
            className="absolute top-4 left-5 md:top-8 md:left-8 text-xs md:text-sm font-bold uppercase tracking-widest text-[#b08ba6] hover:text-[#4a2b4d] transition-colors z-20"
          >
            History Log →
          </button>

          {/* APP TITLE */}
          <div className="flex-[1.2] pr-0 md:pr-4 z-10 w-full mt-8 md:mt-0 text-center md:text-left">
            <h1 
              className={`text-[2.8rem] md:text-[5.2rem] tracking-tight leading-[0.75] ${retrogression.className}`}
              style={{ fontStyle: 'normal', fontWeight: 400 }}
            >
              <span className="bg-gradient-to-b from-[#f7e4e9] via-[#f9afbd] to-[#e36b89] text-transparent bg-clip-text drop-shadow-sm">
                Impromptu<br/>
                Speaking<br/>
                Daydream<br/>
                Dial
              </span>
              <span className="text-[#4a2b4d] drop-shadow-sm text-[2rem] md:text-[3.2rem] align-middle ml-2 md:ml-4 relative -top-2 md:-top-4">⋆｡°✩</span>
            </h1>
            <p className="mt-4 md:mt-8 text-[#b08ba6] font-medium text-sm md:text-lg leading-snug pr-0 md:pr-4">
              Take 1 minute to speak on a random topic and improve your articulation.
            </p>
          </div>

          {/* Topic Spinner */}
          <div className="flex-[1.5] w-full flex justify-center relative mt-4 md:mt-0">
            <div className="h-56 md:h-72 w-full max-w-sm rounded-[1.5rem] md:rounded-[2rem] border-4 border-[#8a5a83] overflow-hidden relative shadow-[inset_0px_4px_12px_rgba(210,168,214,0.3)] bg-[#fdfafb] flex flex-col">
               {/* Gradient Overlays for depth */}
               <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-[#fdfafb] via-[#fdfafb]/80 to-transparent z-10 pointer-events-none"></div>
               <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-[#fdfafb] via-[#fdfafb]/80 to-transparent z-10 pointer-events-none"></div>
               
               {/* Selection indicator */}
               <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[72px] border-y-4 border-[#f9afbd] bg-[#f9afbd]/20 z-0 pointer-events-none">
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-[10px] border-y-transparent border-l-[12px] border-l-[#f9afbd]"></div>
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 border-y-[10px] border-y-transparent border-r-[12px] border-r-[#f9afbd]"></div>
               </div>

               {/* Scrolling list */}
               <div 
                 className="flex flex-col w-full transition-transform duration-[3000ms] ease-[cubic-bezier(0.15,0.85,0.3,1)]"
                 style={{ transform: `translateY(-${spinOffset * 72}px)` }}
               >
                  <div style={{ paddingTop: '108px' }}>
                    {isLoadingTopics ? (
                      <div className="h-[72px] flex items-center justify-center px-8 w-full">
                         <span className="font-bold text-xl text-center leading-tight text-[#b08ba6] opacity-80 animate-pulse">
                            Loading topics...
                         </span>
                      </div>
                    ) : topics.length > 0 ? Array.from({ length: Math.max(50, spinOffset + 20) }).map((_, i) => {
                      const topic = topics[i % topics.length];
                      const isSelected = i === spinOffset;
                      // Visual active state only when fully landed
                      const isActiveVisual = isSelected && !isSpinning;
                      
                      return (
                        <div key={i} className="h-[72px] flex items-center justify-center px-8 w-full">
                          <span className={`font-bold text-xl text-center leading-tight transition-all duration-300 ${isActiveVisual ? 'text-[#c04b6c] drop-shadow-sm' : 'text-[#b08ba6] opacity-80'}`}>
                             {topic}
                          </span>
                        </div>
                      );
                    }) : (
                      <div className="h-[72px] flex items-center justify-center px-8 w-full">
                         <span className="font-bold text-xl text-center leading-tight text-[#b08ba6] opacity-80">
                            No topics left!
                         </span>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>

          {/* Lever */}
          <div className="flex-[0.8] flex justify-center md:justify-end mt-4 md:mt-0">
            <button 
              onClick={handleSpin}
              disabled={isSpinning || topics.length === 0}
              className="flex flex-col items-center gap-4 outline-none group pt-8 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              <div className={`text-xl font-bold uppercase tracking-widest transition-colors ${isSpinning ? 'text-[#f7a1b2]' : 'text-[#8a5a83]'}`}>Spin</div>
              <div className="relative">
                {/* Lever Base/Track */}
                <div className="h-28 md:h-40 w-8 rounded-full bg-[#f8cedd] border-4 border-[#b08ba6] shadow-[inset_-4px_-4px_0px_rgba(210,168,214,0.3)]"></div>
                {/* Knob */}
                <div className={`absolute -left-4 h-16 w-16 rounded-full bg-[#f9afbd] border-4 border-[#f9afbd] transition-all duration-300 ease-out z-20 hover:bg-[#f7a1b2] hover:border-[#f7a1b2] cursor-pointer shadow-[inset_-4px_-4px_0px_rgba(210,168,214,0.3),_4px_4px_0px_#dbafde]
                  ${isSpinning ? 'translate-y-[6rem] shadow-[inset_-2px_-2px_0px_rgba(210,168,214,0.3),_0px_0px_0px_#dbafde] !top-[-1.5rem] bg-[#f7a1b2] border-[#f7a1b2]' : '-top-6 group-hover:-translate-y-2 group-active:-translate-y-0 group-active:translate-y-[6rem] group-active:shadow-[inset_-2px_-2px_0px_rgba(210,168,214,0.3),_0px_0px_0px_#dbafde]'}
                `}></div>
              </div>
            </button>
          </div>

        </main>
        <div className="flex flex-col md:flex-row items-center w-full mt-6 md:mt-8 justify-between gap-3 md:gap-0 px-4 md:px-8">
          <button 
            onClick={() => setShowAddModal(true)}
            className="text-base font-bold uppercase tracking-widest text-[#b08ba6] hover:text-[#4a2b4d] transition-colors"
          >
            + Add Custom Topic
          </button>
          <button 
            onClick={() => setView('topicBank')}
            className="text-base font-bold uppercase tracking-widest text-[#b08ba6] hover:text-[#4a2b4d] transition-colors"
          >
            Topic Bank
          </button>
        </div>
        </div>
      ) : view === 'timer' ? (
        <TimerView 
          topic={selectedTopicStr} 
          onBack={() => setView('spinner')} 
          onComplete={handleSessionComplete}
        />
      ) : view === 'history' ? (
        <HistoryView 
          onBack={() => setView('spinner')}
        />
      ) : (
        <TopicBankView
          topics={topics}
          onBack={() => setView('spinner')}
        />
      )}

      {/* Add Custom Topic Modal */}
      {view === 'spinner' && showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4a2b4d]/20 backdrop-blur-sm transition-opacity duration-300 p-4">
          <div className="w-[90%] max-w-md rounded-[2.5rem] border-4 border-[#4a2b4d] bg-white p-8 shadow-[8px_8px_0px_0px_#f9afbd] flex flex-col items-center gap-6 relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-5 text-xl font-bold text-[#b08ba6] hover:text-[#4a2b4d] transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
            <h2 className="text-xl font-extrabold tracking-tight mt-2 text-[#f7a1b2] uppercase">Add Custom Topic</h2>
            <textarea
              value={newTopicVal}
              onChange={(e) => setNewTopicVal(e.target.value)}
              placeholder="e.g. the impact of tiktok on fast fashion..."
              className="w-full rounded-2xl border-4 border-[#4a2b4d] p-4 font-bold text-[#4a2b4d] placeholder:text-[#b08ba6] focus:outline-none focus:ring-4 focus:ring-[#f9afbd] resize-none h-32"
            />
            <button 
              onClick={async () => {
                if (newTopicVal.trim()) {
                  const val = newTopicVal.trim();
                  setTopics([val, ...topics]);
                  setNewTopicVal("");
                  setShowAddModal(false);
                  await supabase.from('daydream_topics').insert({ content: val, is_active: true });
                }
              }}
              className="w-full rounded-2xl bg-[#dbafde] py-4 text-lg font-bold text-[#4a2b4d] transition-transform hover:-translate-y-1 hover:shadow-[0px_4px_0px_0px_#f7a1b2] active:translate-y-0 active:shadow-none"
            >
              Add to Spinner
            </button>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {view === 'spinner' && showModal && topics.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4a2b4d]/20 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-[90%] max-w-md rounded-[2.5rem] border-4 border-[#4a2b4d] bg-white p-8 shadow-[8px_8px_0px_0px_#f9afbd] flex flex-col items-center gap-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-5 text-xl font-bold text-[#b08ba6] hover:text-[#4a2b4d] transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold uppercase tracking-widest text-[#f7a1b2] mt-2">Your Topic</h2>
            <p className="text-3xl font-bold tracking-tight text-center leading-tight text-[#c04b6c] drop-shadow-sm">
              {selectedTopicStr}
            </p>
            <div className="flex w-full flex-col gap-3 mt-4">
              <button 
                onClick={handleSelectTopic}
                className="w-full rounded-2xl border-4 border-[#b08ba6] bg-[#f2e1f2] py-3 text-lg font-bold text-[#4a2b4d] transition-transform hover:-translate-y-1 hover:shadow-[0px_4px_0px_0px_#f7a1b2] active:translate-y-0 active:shadow-none"
              >
                Select Topic
              </button>
              <button 
                onClick={handleSpin}
                className="w-full rounded-2xl border-4 border-[#b08ba6] bg-[#fbe2eb] py-3 text-lg font-bold text-[#4a2b4d] transition-transform hover:-translate-y-1 hover:shadow-[0px_4px_0px_0px_#dbafde] active:translate-y-0 active:shadow-none"
              >
                Respin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
