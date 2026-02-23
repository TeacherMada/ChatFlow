import React, { useState, useEffect } from 'react';
import { MessageSquare, Settings, LogOut, Plus, Activity, Power, PowerOff, Edit } from 'lucide-react';

export default function Dashboard({ user, onLogout, onSelectFlow }: any) {
  const [pages, setPages] = useState<any[]>([]);
  const [flows, setFlows] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any>(null);

  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const res = await fetch(`/api/pages?userId=${user.id}`);
    const data = await res.json();
    setPages(data.pages);
  };

  const fetchFlows = async (pageId: string) => {
    const res = await fetch(`/api/pages/${pageId}/flows`);
    const data = await res.json();
    setFlows(data.flows);
  };

  const handleSyncPages = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/pages/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        fetchPages();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTogglePage = async (pageId: string) => {
    const res = await fetch(`/api/pages/${pageId}/toggle`, { method: 'POST' });
    if (res.ok) {
      fetchPages();
    }
  };

  const handleSelectPage = (page: any) => {
    setSelectedPage(page);
    fetchFlows(page.id);
  };

  const handleCreateFlow = async () => {
    const name = prompt("Enter Flow Name:");
    if (!name) return;
    
    const res = await fetch('/api/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId: selectedPage.id, name })
    });
    
    if (res.ok) {
      fetchFlows(selectedPage.id);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            ChatFlow
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Pages</h2>
              <button onClick={handleSyncPages} disabled={isSyncing} className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50">
                <Activity className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <ul className="space-y-1">
              {pages.map(page => (
                <li key={page.id}>
                  <button
                    onClick={() => handleSelectPage(page)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between ${selectedPage?.id === page.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span className="truncate">{page.name}</span>
                    <div className={`w-2 h-2 rounded-full ${page.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </button>
                </li>
              ))}
              {pages.length === 0 && (
                <li className="text-sm text-gray-500 italic px-3 py-2">No pages connected</li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.plan} Plan</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 w-full px-2 py-2 rounded-md hover:bg-gray-100">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedPage ? (
          <>
            <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedPage.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Manage flows and settings for this page</p>
              </div>
              <button
                onClick={() => handleTogglePage(selectedPage.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedPage.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
              >
                {selectedPage.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                {selectedPage.is_active ? 'Deactivate Bot' : 'Activate Bot'}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Chat Flows</h3>
                <button
                  onClick={handleCreateFlow}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Flow
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flows.map(flow => (
                  <div key={flow.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Activity className="w-5 h-5" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${flow.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {flow.is_active ? 'Active' : 'Draft'}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{flow.name}</h4>
                    <p className="text-sm text-gray-500 mb-6">Last updated recently</p>
                    
                    <button
                      onClick={() => onSelectFlow(flow)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Flow
                    </button>
                  </div>
                ))}
                {flows.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No flows yet</h3>
                    <p className="text-sm text-gray-500 mb-4">Create your first chat flow to get started.</p>
                    <button
                      onClick={handleCreateFlow}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Flow
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md px-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ChatFlow</h2>
              <p className="text-gray-500 mb-6">Select a Facebook page from the sidebar or connect a new one to start building your chat automation.</p>
              <button
                onClick={handleSyncPages}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
              >
                <Activity className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Facebook Pages'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
