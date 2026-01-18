import React, { useState } from 'react';
import { Play, Square, Check, FileText, Zap, Terminal, Sparkles } from 'lucide-react';
import { streamText } from '../api/client';

export const StreamDisplay: React.FC = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [fullText, setFullText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const startStream = async () => {
    setDisplayedText('');
    setFullText('');
    setIsStreaming(true);
    setIsComplete(false);
    setProgress(0);

    try {
      const fullTextArray: string[] = [];
      let charCount = 0;
      
      for await (const char of streamText()) {
        fullTextArray.push(char);
        setDisplayedText(prev => prev + char);
        charCount++;
        // Simulate progress for UI feel
        setProgress(Math.min(95, charCount / 10)); 
      }

      setFullText(fullTextArray.join(''));
      setIsComplete(true);
      setProgress(100);
    } catch (error) {
      console.error('Stream error:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const stopStream = () => {
    // In a real app, we'd abort the fetch
    setIsStreaming(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-700 text-xs font-black uppercase tracking-widest rounded-full mb-4">
              <Zap className="w-3 h-3" />
              Live Streaming
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Insights Stream</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Real-time character processing engine</p>
          </div>
          
          <div className="flex gap-3">
            {!isStreaming ? (
              <button
                onClick={startStream}
                className="group relative flex items-center gap-2.5 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1 active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Generation
              </button>
            ) : (
              <button
                onClick={stopStream}
                className="flex items-center gap-2.5 px-8 py-4 bg-rose-500 text-white rounded-2xl font-bold transition-all hover:bg-rose-600 hover:shadow-2xl hover:shadow-rose-100 hover:-translate-y-1 active:scale-95"
              >
                <Square className="w-5 h-5 fill-current" />
                Halt Stream
              </button>
            )}
          </div>
        </div>

        <div className="relative group">
          {/* Glass Effect Decoration */}
          <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-[2.5rem] blur-2xl opacity-50 transition-opacity group-hover:opacity-100" />
          
          <div className="relative bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
            {/* Window Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-mono text-xs font-bold">
                  <Terminal className="w-3 h-3" />
                  output.log
                </div>
              </div>
              
              {isStreaming && (
                <div className="flex items-center gap-3">
                  <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-blue-600 tabular-nums">{Math.round(progress)}%</span>
                </div>
              )}
              
              {isComplete && (
                <div className="flex items-center gap-2 text-emerald-600 animate-in zoom-in">
                  <Check className="w-4 h-4" strokeWidth={3} />
                  <span className="text-xs font-black uppercase tracking-wider">Success</span>
                </div>
              )}
            </div>

            {/* Content Output */}
            <div className="p-8 sm:p-10 min-h-[400px] max-h-[600px] overflow-auto custom-scrollbar bg-slate-50/20">
              {!displayedText && !isStreaming ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <p className="text-lg font-bold text-slate-400">System Ready</p>
                  <p className="text-sm">Initiate stream to view real-time output</p>
                </div>
              ) : (
                <div className="font-mono text-slate-800 text-lg leading-relaxed whitespace-pre-wrap selection:bg-blue-100">
                  {displayedText}
                  {isStreaming && (
                    <span className="inline-block w-2.5 h-6 bg-blue-600 ml-1 animate-pulse align-middle rounded-sm shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                  )}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {isComplete && fullText && (
              <div className="p-6 bg-slate-900 text-slate-300 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Metadata</span>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-800 px-2 py-1 rounded text-slate-400">
                    {fullText.length} CHARS GEN
                  </span>
                </div>
                <p className="text-sm font-medium leading-relaxed italic text-slate-400">
                  &quot;Analysis complete. The above results represent a generative stream processed through the Presight local engine.&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
