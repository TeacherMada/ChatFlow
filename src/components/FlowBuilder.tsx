import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Save, MessageSquare, HelpCircle, GitBranch, Zap, Play } from 'lucide-react';

const nodeTypes = {
  trigger: ({ data }: any) => (
    <div className="bg-white border-2 border-indigo-500 rounded-lg shadow-sm w-64">
      <div className="bg-indigo-50 p-3 rounded-t-md border-b border-indigo-100 flex items-center gap-2">
        <Zap className="w-4 h-4 text-indigo-600" />
        <span className="font-semibold text-sm text-indigo-900">Trigger</span>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600">{data.label}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500" />
    </div>
  ),
  message: ({ data }: any) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-64">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
      <div className="bg-gray-50 p-3 rounded-t-md border-b border-gray-200 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-gray-600" />
        <span className="font-semibold text-sm text-gray-900">Send Message</span>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600">{data.label}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400" />
    </div>
  ),
  condition: ({ data }: any) => (
    <div className="bg-white border-2 border-amber-400 rounded-lg shadow-sm w-64">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-400" />
      <div className="bg-amber-50 p-3 rounded-t-md border-b border-amber-100 flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-amber-600" />
        <span className="font-semibold text-sm text-amber-900">Condition</span>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600">{data.label}</p>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" className="w-3 h-3 bg-green-500 left-1/4" />
      <Handle type="source" position={Position.Bottom} id="false" className="w-3 h-3 bg-red-500 left-3/4" />
    </div>
  ),
};

export default function FlowBuilder({ flow, onBack }: any) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (flow) {
      setNodes(JSON.parse(flow.nodes || '[]'));
      setEdges(JSON.parse(flow.edges || '[]'));
    }
  }, [flow]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/flows/${flow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges })
      });
      // Show success toast
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      const res = await fetch(`/api/flows/${flow.id}/toggle`, { method: 'POST' });
      if (res.ok) {
        onBack(); // Go back to dashboard to refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addNode = (type: string) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { label: `New ${type}` },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const onNodeDoubleClick = (event: React.MouseEvent, node: any) => {
    const newLabel = prompt('Enter new text:', node.data.label);
    if (newLabel) {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              data: {
                ...n.data,
                label: newLabel,
              },
            };
          }
          return n;
        })
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{flow.name}</h1>
            <p className="text-xs text-gray-500">Flow Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleActive}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${flow.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
          >
            {flow.is_active ? 'Deactivate Flow' : 'Activate Flow'}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Flow'}
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Tools */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto z-10 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Add Nodes</h3>
          
          <button onClick={() => addNode('message')} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group">
            <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 text-gray-600">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Send Message</p>
              <p className="text-xs text-gray-500">Text, image, or gallery</p>
            </div>
          </button>

          <button onClick={() => addNode('condition')} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all text-left group">
            <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-600 text-gray-600">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Condition</p>
              <p className="text-xs text-gray-500">Split flow based on rules</p>
            </div>
          </button>
          
          <div className="mt-auto p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <h4 className="text-sm font-semibold text-indigo-900 mb-1">Need help?</h4>
            <p className="text-xs text-indigo-700 mb-3">Learn how to build effective chat flows.</p>
            <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              Read Documentation <ArrowLeft className="w-3 h-3 rotate-180" />
            </a>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-50"
          >
            <Controls className="bg-white border border-gray-200 shadow-sm rounded-md" />
            <MiniMap className="bg-white border border-gray-200 shadow-sm rounded-md" />
            <Background color="#e5e7eb" gap={16} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
