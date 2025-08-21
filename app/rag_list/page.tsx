"use client"
import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, ArrowLeft, File, FileText, Database, Download, Search } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TableHeader } from '@/components/ui/table';
import PageHeaders from '@/components/costume/page_headers';
import { useRouter } from 'next/navigation';
import { delete_rag_file, load_all_files_db } from '@/services/API/rag_services';
import { AlertDialogComponent } from '@/components/dialogs/confirm_dialog';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/costume/table_parts';

type RagFile = {
  id: number;
  filename: string;
  extension: string;
  title: string;
  chat_id: number | null;
};

// Mock API function - replace with your actual API call
const fetchRagFiles = async (): Promise<RagFile[]> => {
    // Simulate API delay
    const res = await load_all_files_db()
    if (!res.success) {
        console.log(res.data)
        return [];
    }
    const items = res.data
  
  // Mock data - replace with actual API call
  return items;
};

export default function RagFilesTable() {
  const [files, setFiles] = useState<RagFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter()

  useEffect(() => {
    const loadFiles = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRagFiles();
        setFiles(data);
      } catch (err) {
        setError('Failed to load files. Please try again.');
        console.error('Error fetching files:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      setDeletingIds(prev => new Set(prev).add(id));
      await delete_rag_file(id);
      setFiles(prev => prev.filter(file => file.id !== id));
    } catch (err) {
      setError('Failed to delete file. Please try again.');
      console.error('Error deleting file:', err);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleGoBack = () => {
    router.back()
  };

  const getPrivacyStatus = (chatId: number | null) => {
    return chatId !== null ? 'Private' : 'Global';
  };

  const getFileIcon = (extension: string) => {
    switch (extension.toLowerCase()) {
      case 'pdf':
        return <File className="w-4 h-4 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'csv':
        return <Database className="w-4 h-4 text-green-500" />;
      case 'txt':
        return <FileText className="w-4 h-4 text-gray-500" />;
      case 'md':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredFiles = files.filter(file =>
    file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.extension.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen p-8">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">RAG Files</h1>
            <p className="text-gray-600">Manage your document knowledge base</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-gray-600 text-lg">Loading files...</span>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">RAG Files</h1>
            <p className="text-gray-600">Manage your document knowledge base</p>
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
    <div className="min-h-screen  p-8">
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
          <PageHeaders title={'RAG Files'} />
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Files Table */}
        {filteredFiles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <div className="text-center">
              <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchTerm ? 'No matching files found' : 'No files found'}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'Upload some documents to get started.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <Table className='text-black'>
              <TableHeader>
                <TableRow className="bg-gray-50 border-gray-200">
                  <TableHead className="font-semibold text-gray-900 py-4">ID</TableHead>
                  <TableHead className="font-semibold text-gray-900">File</TableHead>
                  <TableHead className="font-semibold text-gray-900">Type</TableHead>
                  <TableHead className="font-semibold text-gray-900">Title</TableHead>
                  <TableHead className="font-semibold text-gray-900">Privacy</TableHead>
                  <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFiles.map((file, index) => (
                  <TableRow 
                    key={file.id} 
                    className={`border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <TableCell className="font-medium text-gray-900 py-4">
                      #{file.id}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.extension)}
                        <span className="font-medium text-gray-900">{file.filename}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase">
                        {file.extension}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-700 py-4 max-w-xs">
                      <div className="truncate" title={file.title}>
                        {file.title}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        file.chat_id !== null 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {getPrivacyStatus(file.chat_id)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <div className="flex items-center justify-end gap-2">
                        <AlertDialogComponent Trigger={
                          <button
                          disabled={deletingIds.has(file.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete file"
                        >
                          {deletingIds.has(file.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                        } title={'Delete File?'} description={'You sure you want to delete the file?'} confirmButtonText={'Delete'} onConfirmation={() => handleDelete(file.id)} />
                       
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
            Showing {filteredFiles.length} of {files.length} {files.length === 1 ? 'file' : 'files'}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Global: {files.filter(f => f.chat_id === null).length}
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Private: {files.filter(f => f.chat_id !== null).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}