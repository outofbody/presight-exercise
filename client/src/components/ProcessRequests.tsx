import React, { useState, useEffect, useRef } from 'react';
import { Plus, RefreshCw, Clock, Check, X, Server, Loader2, Activity, Database, AlertCircle } from 'lucide-react';
import { io, type Socket } from 'socket.io-client';
import { createProcessRequest } from '../api/client';
import type { ProcessRequest } from '../types';

const SOCKET_URL = (import.meta.env?.VITE_SOCKET_URL as string | undefined) || 'http://localhost:3001';

export const ProcessRequests: React.FC = () => {
  const [requests, setRequests] = useState<ProcessRequest[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    socketRef.current = newSocket;

    newSocket.on('process-result', (data: { id: string; status: string; result: string }) => {
      setRequests(prev =>
        prev.map(req =>
          req.id === data.id
            ? { ...req, status: data.status as 'pending' | 'completed' | 'error', result: data.result }
            : req
        )
      );
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleCreateRequest = async () => {
    try {
      const response = await createProcessRequest();
      const newRequest: ProcessRequest = {
        id: response.id,
        status: 'pending'
      };
      setRequests(prev => [newRequest, ...prev]);

      if (socketRef.current) {
        socketRef.current.emit('process-request', { id: response.id });
      }
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  const createBatchRequests = async () => {
    for (let i = 0; i < 20; i++) {
      handleCreateRequest();
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    completed: requests.filter(r => r.status === 'completed').length,
    error: requests.filter(r => r.status === 'error').length
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-full mb-4">
              <Activity className="w-3 h-3" />
              Live Processing
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Queue Management</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Asynchronous task orchestration & monitoring</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCreateRequest}
              className="group flex items-center gap-2.5 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold transition-all hover:bg-emerald-700 hover:shadow-2xl hover:shadow-emerald-200 hover:-translate-y-1 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              New Task
            </button>
            <button
              onClick={createBatchRequests}
              className="flex items-center gap-2.5 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1 active:scale-95"
            >
              <RefreshCw className="w-5 h-5" />
              Batch (x20)
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Tasks', value: stats.total, icon: Database, color: 'text-slate-600', bg: 'bg-white' },
            { label: 'Active', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50/50', pulse: true },
            { label: 'Completed', value: stats.completed, icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
            { label: 'Failed', value: stats.error, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50/50' }
          ].map((stat, i) => (
            <div key={i} className={`p-6 rounded-3xl border border-slate-200 shadow-sm ${stat.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color} ${stat.pulse ? 'animate-pulse' : ''}`} />
                <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main List */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Server className="w-5 h-5 text-slate-400" />
              Execution Logs
            </div>
            <div className="text-xs font-bold text-slate-400">Showing {requests.length} events</div>
          </div>

          <div className="p-8">
            {requests.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                <Server className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-bold text-slate-400">No active processes</p>
                <p className="text-sm">Create a task to see the orchestration in action</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="group relative flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="shrink-0 flex items-center gap-4">
                      {request.status === 'pending' ? (
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                        </div>
                      ) : request.status === 'completed' ? (
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                          <Check className="w-6 h-6 text-emerald-600" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                          <X className="w-6 h-6 text-rose-600" />
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Reference ID</div>
                        <code className="text-sm font-black text-slate-900">{request.id.slice(0, 12)}...</code>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {request.result ? (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-600 shadow-sm transition-all group-hover:border-blue-100">
                          {request.result}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 italic text-sm">
                          {request.status === 'pending' ? 'Processing worker nodes...' : 'Waiting for result...'}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                        request.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        request.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        'bg-rose-100 text-rose-700 border-rose-200'
                      }`}>
                        {request.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
