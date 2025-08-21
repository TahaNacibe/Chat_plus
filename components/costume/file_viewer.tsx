'use client'
import React, { useEffect, useState } from 'react';
import { FileText, Download, Eye, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { createFile, downloadBlobFile, readBlobContent } from '@/services/data/client/file_services';

type FileData = {
  file_data: {
    metadata: {
      extension: string;
      file_name: string;
    };
    content: any; // Dynamic content
  };
};

type FileViewerProps = {
  data: FileData;
  className?: string;
};

export default function FileViewer({ data, className = "" }: FileViewerProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCreatingFile, setIsCreatingFile] = useState(true)
    const [fileBlob, setFileBlob] = useState<Blob>()
    const [blobContent, setBlobContent] = useState<any>()
  
  const { file_data } = data;
  const { metadata, content } = file_data;

  // Check if we can display the content
    const canDisplayContent = content !== null && content !== undefined;
    const handle_create_file = async () => {
        try {
            const res = await createFile(JSON.stringify(data))
            if (res.status == "success") {
              setFileBlob(res.blob as Blob)
                //* read the blobs
                const file_content = await readBlobContent(res.blob as Blob)
                console.log(`the file content ${file_content}`)
                return file_content
            }
        } catch (error) {
            console.log("error")            
        } finally {
            setIsCreatingFile(false)
        }
    }
    
    // useEffect(() => {
        // handle_create_file()
    // },[])

  const getFileIcon = (extension: string) => {
    const iconClasses = "w-5 h-5";
    switch (extension.toLowerCase()) {
      case 'pdf':
        return <FileText className={`${iconClasses} text-red-600`} />;
      case 'xlsx':
        return <FileText className={`${iconClasses} text-green-600`} />;
      case 'doc':
      case 'docx':
        return <FileText className={`${iconClasses} text-blue-600`} />;
      case 'txt':
        return <FileText className={`${iconClasses} text-gray-600`} />;
      default:
        return <FileText className={`${iconClasses} text-gray-500`} />;
    }
  };

  const getFileTypeLabel = (extension: string) => {
    switch (extension.toLowerCase()) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'txt':
        return 'Text File';
      case 'xlsx':
        return 'Excel Document';
      default:
        return `${extension.toUpperCase()} File`;
    }
  };

  const downloadFileToDevice = async () => {
      const file_content = await handle_create_file()
      const full_file_name = metadata.file_name + "." + metadata.extension
        downloadBlobFile(fileBlob!,full_file_name)
  };

  if (!canDisplayContent) {
    // Error state - couldn't display file
    return (
      <div className={`w-full max-w-md bg-white dark:bg-black border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-red-900 truncate">
              {metadata.file_name}
            </h3>
            <p className="text-sm text-red-600">
              Couldn't display {getFileTypeLabel(metadata.extension)}
            </p>
          </div>
        </div>
        <div className="mt-3 text-xs text-red-500">
          File content is not available for preview
        </div>
      </div>
    );
  }

  // Success state - can display file
  return (
    <div className={`w-full max-w-md bg-white dark:bg-black dark:border-gray-800 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* File Header */}
      <div className="p-4 border-b border-gray-100 ark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {getFileIcon(metadata.extension)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {metadata.file_name}
              </h3>
              <p className="text-sm text-gray-600">
                {getFileTypeLabel(metadata.extension)}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
              title="Preview content"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={downloadFileToDevice}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      {isExpanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Content Preview</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-100"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded border p-3 max-h-64 overflow-auto">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
              {blobContent}
            </pre>
          </div>
        </div>
      )}

      {/* Expand/Collapse Toggle */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center justify-center space-x-1"
        >
          <span>Preview content</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
