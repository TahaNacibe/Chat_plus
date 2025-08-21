"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Loader2, ArrowLeft, Brain, Search, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TableHeader } from '@/components/ui/table';
import PageHeaders from '@/components/costume/page_headers';
import { useRouter } from 'next/navigation';
import { AlertDialogComponent } from '@/components/dialogs/confirm_dialog';
import { delete_memory_entry, load_all_user_memories } from '@/services/API/memories_services';
import formatDate from '@/utils/get_date_display';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/costume/table_parts';
import { AddMemoryDialog } from './components/add_new_memory';
import { EditMemoryDialog } from './components/edit_memory';

type Memory = {
  id: number;
  content: string;
  created_at: string;
};

// API function wrapper
const fetchMemories = async (): Promise<Memory[]> => {
  const res = await load_all_user_memories();
  if (!res.success) {
    console.log(res.data);
    return [];
  }
  return res.data;
};

export default function MemoriesTable() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

    const filteredMemories = useMemo(() => {
    console.log(JSON.stringify(memories))
  return memories.filter(memory =>
    (memory.content ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [memories, searchTerm]);

useEffect(() => {
  const loadMemories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMemories();
      setMemories(data);
    } catch (err) {
      setError("Failed to load memories. Please try again.");
      console.error("Error fetching memories:", err);
    } finally {
      setLoading(false);
    }
  };

  loadMemories();
}, []);

const handleDelete = async (id: number) => {
  try {
    setDeletingIds(prev => new Set(prev).add(id));

    const result = await delete_memory_entry(id); // Pass id to API
    if (result.success) {
      setMemories(prev => prev.filter(memory => memory.id !== id));
    } else {
      setError("Failed to delete memory. Please try again.");
    }
  } catch (err) {
    setError("Failed to delete memory. Please try again.");
    console.error("Error deleting memory:", err);
  } finally {
    setDeletingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }
};

const handleUpdate = (id: number, newContent: string) => {
  setMemories(prev =>
    prev.map(memory =>
      memory.id === id ? { ...memory, content: newContent } : memory
    )
  );
};

    const handleAdd = (newMemory: Memory) => {
        if (newMemory && newMemory.content) {
            setMemories(prev => [...prev, newMemory]);
        } else {
            console.log("yeb it's empty")
    }
};


  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Memories</h1>
            <p className="text-gray-600">Manage your AI memory entries</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-gray-600 text-lg">Loading memories...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Memories</h1>
            <p className="text-gray-600">Manage your AI memory entries</p>
          </div>
          
          <Alert className="bg-white border border-red-200">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto text-black">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back</span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <PageHeaders title={'Memories'} />
            <AddMemoryDialog onAdd={handleAdd} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Memories Table */}
        {filteredMemories.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <div className="text-center">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching memories found' : 'No memories found'}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Start chatting to create some memories.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <Table className='text-black'>
              <TableHeader>
                <TableRow className="bg-gray-50 border-gray-200">
                  <TableHead className="font-semibold text-gray-900 py-4">ID</TableHead>
                  <TableHead className="font-semibold text-gray-900">Content</TableHead>
                  <TableHead className="font-semibold text-gray-900">Created</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMemories.map((memory, index) => (
                  <TableRow 
                    key={memory.id + index} 
                    className={`border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <TableCell className="font-medium text-gray-900 py-4">
                      #{memory.id}
                    </TableCell>
                    <TableCell className="text-gray-700 py-4 max-w-2xl">
                      <div className="line-clamp-3" title={memory.content}>
                        {memory.content}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(memory.created_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <div className="flex items-center justify-end gap-2">
                        <EditMemoryDialog memory={memory} onUpdate={handleUpdate} />
                        <AlertDialogComponent 
                          Trigger={
                            <button
                              disabled={deletingIds.has(memory.id)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete memory"
                            >
                              {deletingIds.has(memory.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          } 
                          title={'Delete Memory?'} 
                          description={'Are you sure you want to delete this memory? This action cannot be undone.'} 
                          confirmButtonText={'Delete'} 
                          onConfirmation={() => handleDelete(memory.id)} 
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-6 flex items-center justify-between text-sm text-gray-600 bg-white px-6 py-4 rounded-lg border border-gray-200">
          <div>
            Showing {filteredMemories.length} of {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              Total memories: {memories.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}