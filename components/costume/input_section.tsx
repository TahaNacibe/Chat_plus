'use client'
import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { FileDownIcon, Paperclip, Send, X } from 'lucide-react';
import ChatTypeSelector from '@/app/chat/components/type_selector';
import { Badge } from '../ui/badge';
import FileSelectRag from '@/app/chat/components/file_select';
import TextSelectorMarker from '@/app/chat/components/text_select';

const ChatGPTStyleInput = ({ onSend, chat_id, activeTask, remove_action, setExternalMode }
    : {
        onSend: (text: string, formData: FormData | null) => void, chat_id: number,
        activeTask: { action_type: "Explain" | "Tag", selected_content: string, parent_message: string, message_id:number } | null,
        remove_action: () => void,
        setExternalMode: (action: string) => void
    }) => {
    const [message, setMessage] = useState('');
    const [activeMode, setActiveMode] = useState<'Conversational' | 'Deep Think' | 'Use RAG' | "Web Search">('Conversational')
    const [RAGFile, setRAGFile] = useState<File | null>(null)
    const [formData, setFormData] = useState<FormData | null>(null)
    const [isolationState, setIsolationState] = useState(false)
    const textareaRef = useRef<any>(null);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
        }
    }, [message]);

    const handleSendMessage = () => {
        let tag_content = null
        let block = null
        //* add the rag file content
        if (RAGFile) {
            block = `[BLOCK:{"type":"RAGItem", "lang":"null"}]
            {
                "filename":"${RAGFile.name}",
                "extension": "${RAGFile.type}",
                "title": "${RAGFile.name.split(".")[0]}"
            }
            [/BLOCK]`
        }

        
        if (activeTask && activeTask.action_type === "Explain") {
        const blockObj = {
            task: "Explain",
            specific_part: activeTask.selected_content,
            complete_message: activeTask.parent_message,
            parent_message_id: activeTask.message_id
        };

        block = `[BLOCK:{"type":"Explain","lang":"null"}]
        ${JSON.stringify(blockObj, null, 2)}
        [/BLOCK]`;
        }

        if (activeTask && activeTask.action_type === "Tag") {
        const tagObj = {
            task: "Tag",
            specific_part: activeTask.selected_content,
            complete_message: activeTask.parent_message,
            parent_message_id: activeTask.message_id
        };

        tag_content = `[BLOCK:{"type":"Tag","lang":"null"}]
        ${JSON.stringify(tagObj, null, 2)}
        [/BLOCK]`;
        }
        //* send message
        if (message.trim() || formData || block) {
            const updated_block = `${block && block.length > 0 ? block : ""} ${tag_content && tag_content.length > 0 ? tag_content : ""}  ${message}`.trim()
            onSend(updated_block, formData);
            setMessage('');
            block = null
            tag_content = null
            remove_action()
        }
    };

    const handleKeyDown = (e:any) => {
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
        }
    };

    function handleFileSelect(e: ChangeEvent<HTMLInputElement>): void {
        const file = e.target.files?.[0]
        if (file) {
            setRAGFile(file)
            //? create the file json
            const metadata = {
                filename:file.name,
                extension: file.name.split('.').pop() || '',
                title: file.name,
                chat_id:chat_id,
                tags:"",
            }

            //? create the form
            const new_formData = new FormData();
            new_formData.append("file", file);
            new_formData.append("metadata", JSON.stringify(metadata));
            setFormData(new_formData)
        }
    }


    function handle_update_isolation(updated:boolean) {
        setIsolationState(updated)
                        //* update the form data
                        const updated_metadata = {
                            filename:RAGFile?.name,
                            extension: RAGFile?.type,
                            title: RAGFile?.name,
                            chat_id:updated? chat_id : null,
                            tags:[],
                        }
                        setFormData(prev => {
                            const newFormData = new FormData();
                            if (prev) {
                                for (const [key, value] of prev.entries()) {
                                    newFormData.append(key, value);
                                }
                            }
                            newFormData.set("metadata", JSON.stringify(updated_metadata));
                            return newFormData;
                        });
    }

    return (
        <div className="p-2 mb-5 bg-transparent">
            {/* rag selection file component */}
            {RAGFile && <FileSelectRag
                RAGFile={RAGFile}
                setRAGFile={setRAGFile}
                setFormData={setFormData}
                isolationState={isolationState}
                handle_update_isolation={handle_update_isolation} />}
        
            
            {/* actions bar */}
            {activeTask && activeTask.selected_content && <TextSelectorMarker
                selected_text={activeTask?.selected_content!}
                onRemove={remove_action}
                action_type={activeTask?.action_type!} />}
        
        <div className="max-w-2xl mx-auto">
            {/* Input container - now with white background only around the input area */}
            <div className="relative bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-3xl">
                {/* response type badge - positioned outside the input container */}
                {activeMode != "Conversational" && (
                    <div className='absolute -top-8 left-0 px-6'>
                        <Badge className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 dark:text-white border px-2 py-1">
                            <button onClick={() => setActiveMode("Conversational")}>
                                <X size={16}/>
                            </button>
                            {activeMode}
                        </Badge>
                    </div>
                )}

                {/* Add file button */}
                <ChatTypeSelector
                    handleFileSelect={handleFileSelect}
                    currentMode={activeMode}
                    setCurrentMode={(mode) => {
                        setActiveMode(mode)
                        setExternalMode(mode)
                    }} />

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message ChatGPT"
                    className="w-full pl-12 pr-12 py-3 bg-transparent border-none rounded-3xl resize-none focus:outline-none placeholder-gray-500"
                    rows={1}
                    style={{ 
                        minHeight: '20px',
                        maxHeight: '200px'
                    }} />

                <button
                    onClick={handleSendMessage}
                    disabled={
                        activeTask?.action_type === "Explain"
                        ? false
                        : (!message.trim() && !RAGFile)
                    }
                    className={`absolute right-3 bottom-3 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        message.trim() || RAGFile || activeTask?.action_type === "Explain"
                        ? 'bg-black dark:bg-white dark:text-black text-white hover:bg-gray-800'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}>
                    <Send size={16} />
                </button>
            </div>
        </div>
        </div>
    );
};

export default ChatGPTStyleInput;