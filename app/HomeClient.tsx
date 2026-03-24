"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";

function TopicBankView({ topics, onBack }: { topics: string[], onBack: () => void }) {
  return (
    <div className="flex h-[500px] w-full max-w-5xl flex-col rounded-3xl border-4 border-black bg-white p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative transition-all overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-extrabold tracking-tight">
          Topic Bank
        </h2>
        <div className="w-16"></div> {/* spacer to center title */}
      </div>

      <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-200">
        {topics.length === 0 ? (
          <div className="flex h-full items-center justify-center flex-col gap-2">
            <div className="text-5xl">🕸️</div>
            <div className="text-zinc-500 font-medium">No topics available.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-8">
            {topics.map((topic, index) => (
              <div key={index} className="flex p-5 rounded-2xl border-2 border-zinc-100 bg-zinc-50 hover:border-black hover:bg-white transition-colors">
                 <span className="font-bold text-lg leading-tight">{topic}</span>
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
             const { error } = await supabase.from('speaking_history').insert({
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
    <div className="flex h-[500px] w-full max-w-5xl flex-col items-center justify-center rounded-3xl border-4 border-black bg-white p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center relative transition-all">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
      >
        ← Back
      </button>

      <h2 className={`text-xl font-bold uppercase tracking-widest mb-4 ${phase === 'completed' ? 'text-black' : 'text-rose-500'}`}>
        {phase === 'brainstorm' ? 'Brainstorming Session' : phase === 'speak' ? 'Speaking Session' : 'Session Complete'}
      </h2>
      
      <p className="text-[2rem] font-extrabold tracking-tight leading-tight max-w-2xl mb-12">
        {topic}
      </p>

      {phase !== 'completed' ? (
        <>
          <div className="text-8xl font-extrabold tabular-nums tracking-tight mb-12 drop-shadow-sm">
            {timeString}
          </div>

          {!isRunning && timeLeft === 60 ? (
            <div className="flex gap-4">
              <button 
                onClick={handleStart}
                className="rounded-2xl bg-black px-12 py-4 text-xl font-bold text-white transition-transform hover:-translate-y-1 hover:shadow-[0px_4px_0px_0px_rgba(225,29,72,1)] active:translate-y-0 active:shadow-none"
              >
                {phase === 'brainstorm' ? 'Start Brainstorming' : 'Start Speaking Now'}
              </button>
              <button 
                onClick={() => { setTimeLeft(0); setIsRunning(true); }}
                className="rounded-2xl px-8 py-4 text-xl font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                End Session
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <button 
                onClick={isRunning ? handlePause : handleStart}
                className="rounded-2xl border-4 border-black bg-white px-12 py-3 text-xl font-bold text-black transition-transform hover:-translate-y-1 hover:shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none min-w-[160px]"
              >
                {isRunning ? 'Pause' : 'Resume'}
              </button>
              <button 
                onClick={() => {
                  setIsRunning(false);
                  setTimeLeft(60);
                }}
                className="rounded-2xl px-8 py-3 text-xl font-bold text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
              >
                Restart
              </button>
              <button 
                onClick={() => { setTimeLeft(0); setIsRunning(true); }}
                className="rounded-2xl px-8 py-3 text-xl font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
          className="rounded-2xl bg-rose-500 px-12 py-4 text-xl font-bold text-white transition-transform hover:-translate-y-1 hover:shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-wait"
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
        .from('speaking_history')
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
    <div className="flex h-[500px] w-full max-w-5xl flex-col rounded-3xl border-4 border-black bg-white p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative transition-all overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-extrabold tracking-tight">
          Speaking History
        </h2>
        <div className="w-16"></div> {/* spacer to center title */}
      </div>

      <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-200">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-zinc-400 font-bold uppercase tracking-widest animate-pulse">Loading Logs...</div>
          </div>
        ) : history.length === 0 ? (
          <div className="flex h-full items-center justify-center flex-col gap-2">
            <div className="text-5xl">🕸️</div>
            <div className="text-zinc-500 font-medium">No speaking sessions recorded yet.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-8">
            {history.map((log) => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border-2 border-zinc-100 bg-zinc-50 hover:border-black hover:bg-white transition-colors gap-4">
                 <div className="flex flex-col gap-1 pr-4">
                    <span className="font-bold text-lg leading-tight">{log.topic}</span>
                 </div>
                 <div className="flex flex-col items-start sm:items-end gap-1 min-w-[120px]">
                    <span className="text-lg font-bold uppercase tracking-widest text-rose-500">
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

  useEffect(() => {
    async function fetchTopics() {
      setIsLoadingTopics(true);
      const { data, error } = await supabase
        .from('topics')
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
    await supabase.from('topics').update({ is_active: false }).eq('content', selectedTopicStr);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f4f5] font-sans text-black overflow-hidden selection:bg-rose-200">
      
      {view === 'spinner' ? (
        <div className="flex flex-col items-center w-full max-w-5xl">
        <main className="flex h-[500px] w-full items-center justify-between rounded-3xl border-4 border-black bg-white p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all relative">
          
          <button 
            onClick={() => setView('history')}
            className="absolute top-8 left-8 text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors z-20"
          >
            History Log →
          </button>

          {/* APP TITLE */}
          <div className="flex-[1.2] pr-8 z-10 w-full mt-4">
            <h1 
              className="text-[4rem] tracking-tight leading-[0.9] drop-shadow-sm"
              style={{ fontFamily: 'digibop, sans-serif', fontStyle: 'normal', fontWeight: 400 }}
            >
              Impromptu<br/>
              <span className="text-rose-500">Speaking</span><br/>
              Spinner
            </h1>
            <p className="mt-6 text-zinc-500 font-medium text-lg leading-snug pr-4">
              Take 1 minute to speak on a random topic and improve your articulation.
            </p>
          </div>

          {/* Topic Spinner */}
          <div className="flex-[1.5] w-full flex justify-center relative">
            <div className="h-72 w-full max-w-sm rounded-2xl border-4 border-black overflow-hidden relative shadow-[inset_0px_4px_12px_rgba(0,0,0,0.1)] bg-zinc-100 flex flex-col">
               {/* Gradient Overlays for depth */}
               <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-zinc-100 via-zinc-100/80 to-transparent z-10 pointer-events-none"></div>
               <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-zinc-100 via-zinc-100/80 to-transparent z-10 pointer-events-none"></div>
               
               {/* Selection indicator */}
               <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[72px] border-y-4 border-black bg-rose-500/10 z-0 pointer-events-none">
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-[10px] border-y-transparent border-l-[12px] border-l-black"></div>
                  <div className="absolute -right-1 top-1/2 -translate-y-1/2 border-y-[10px] border-y-transparent border-r-[12px] border-r-black"></div>
               </div>

               {/* Scrolling list */}
               <div 
                 className="flex flex-col w-full transition-transform duration-[3000ms] ease-[cubic-bezier(0.15,0.85,0.3,1)]"
                 style={{ transform: `translateY(-${spinOffset * 72}px)` }}
               >
                  <div style={{ paddingTop: '108px' }}>
                    {isLoadingTopics ? (
                      <div className="h-[72px] flex items-center justify-center px-8 w-full">
                         <span className="font-bold text-xl text-center leading-tight text-zinc-400 opacity-80 animate-pulse">
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
                          <span className={`font-bold text-xl text-center leading-tight transition-all duration-300 ${isActiveVisual ? 'text-rose-500 drop-shadow-sm' : 'text-zinc-400 opacity-80'}`}>
                             {topic}
                          </span>
                        </div>
                      );
                    }) : (
                      <div className="h-[72px] flex items-center justify-center px-8 w-full">
                         <span className="font-bold text-xl text-center leading-tight text-zinc-400 opacity-80">
                            No topics left!
                         </span>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>

          {/* Lever */}
          <div className="flex-[0.8] flex justify-end">
            <button 
              onClick={handleSpin}
              disabled={isSpinning || topics.length === 0}
              className="flex flex-col items-center gap-4 outline-none group pt-8 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              <div className={`text-xl font-bold uppercase tracking-widest transition-colors ${isSpinning ? 'text-rose-500' : 'text-zinc-400 group-hover:text-black'}`}>Spin</div>
              <div className="relative">
                {/* Lever Base/Track */}
                <div className="h-40 w-8 rounded-full bg-zinc-200 border-4 border-black shadow-[inset_-4px_-4px_0px_rgba(0,0,0,0.2)]"></div>
                {/* Knob */}
                <div className={`absolute -left-4 h-16 w-16 rounded-full bg-rose-500 border-4 border-black transition-all duration-300 ease-out z-20 hover:bg-rose-400 cursor-pointer shadow-[inset_-4px_-4px_0px_rgba(0,0,0,0.2),_4px_4px_0px_rgba(0,0,0,1)]
                  ${isSpinning ? 'translate-y-[6rem] shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.2),_0px_0px_0px_rgba(0,0,0,1)] !top-[-1.5rem] bg-rose-600' : '-top-6 group-hover:-translate-y-2 group-active:-translate-y-0 group-active:translate-y-[6rem] group-active:shadow-[inset_-2px_-2px_0px_rgba(0,0,0,0.2),_0px_0px_0px_rgba(0,0,0,1)]'}
                `}></div>
              </div>
            </button>
          </div>

        </main>
        <div className="flex w-full mt-8 justify-between px-8">
          <button 
            onClick={() => setShowAddModal(true)}
            className="text-base font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
          >
            + Add Custom Topic
          </button>
          <button 
            onClick={() => setView('topicBank')}
            className="text-base font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 p-4">
          <div className="w-[90%] max-w-md rounded-3xl border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-6 relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-5 text-xl font-bold text-zinc-400 hover:text-black transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
            <h2 className="text-xl font-extrabold tracking-tight mt-2 text-rose-500 uppercase">Add Custom Topic</h2>
            <textarea
              value={newTopicVal}
              onChange={(e) => setNewTopicVal(e.target.value)}
              placeholder="e.g. the impact of tiktok on fast fashion..."
              className="w-full rounded-2xl border-4 border-black p-4 font-bold placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-rose-200 resize-none h-32"
            />
            <button 
              onClick={async () => {
                if (newTopicVal.trim()) {
                  const val = newTopicVal.trim();
                  setTopics([val, ...topics]);
                  setNewTopicVal("");
                  setShowAddModal(false);
                  await supabase.from('topics').insert({ content: val, is_active: true });
                }
              }}
              className="w-full rounded-2xl bg-black py-4 text-lg font-bold text-white transition-transform hover:-translate-y-1 hover:shadow-[0px_4px_0px_0px_rgba(225,29,72,1)] active:translate-y-0 active:shadow-none"
            >
              Add to Spinner
            </button>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {view === 'spinner' && showModal && topics.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="w-[90%] max-w-md rounded-3xl border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-5 text-xl font-bold text-zinc-400 hover:text-black transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
            <h2 className="text-sm font-bold uppercase tracking-widest text-rose-500 mt-2">Your Topic</h2>
            <p className="text-3xl font-bold tracking-tight text-center leading-tight">
              {selectedTopicStr}
            </p>
            <div className="flex w-full flex-col gap-3 mt-4">
              <button 
                onClick={handleSelectTopic}
                className="w-full rounded-2xl bg-black py-4 text-lg font-bold text-white transition-transform hover:-translate-y-1 hover:shadow-[0px_4px_0px_0px_rgba(225,29,72,1)] active:translate-y-0 active:shadow-none"
              >
                Select Topic
              </button>
              <button 
                onClick={handleSpin}
                className="w-full rounded-2xl border-4 border-black bg-zinc-100 py-3 text-lg font-bold text-black transition-transform hover:-translate-y-1 hover:shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none"
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
