import InputDisplay from "@/components/costume/response_blocks_display";
import { AlertDialogComponent } from "@/components/dialogs/confirm_dialog";
import formatDate from "@/utils/get_date_display";
import { motion } from "framer-motion";
import { BookmarkCheck, CornerUpRight } from "lucide-react";

// Message Widget Component
const MessageWidget = ({ message, isDark, isLast, expendItem, setExpendItem, on_update, on_jump }
    : {
        message: Message, isDark: boolean, isLast: boolean, expendItem: number | null,
        setExpendItem: () => void, on_update: () => void, on_jump:() => void
    }) => {
    const isExpanded = expendItem === message.id;

    return (
        <div
            onClick={() => setExpendItem()}
            className={`px-4 py-3 transition-colors duration-150 cursor-pointer ${
                !isLast ? isDark ? 'border-b border-gray-700' : 'border-b border-gray-100' : ''
            } ${isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                    <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        message.role === 'user'
                            ? isDark ? 'text-green-400' : 'text-green-500'
                            : isDark ? 'text-purple-400' : 'text-purple-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {message.role === 'user' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        )}
                    </svg>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        message.role === 'user'
                            ? isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
                            : isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'
                    }`}>
                        {message.role.charAt(0).toUpperCase() + message.role.slice(1)}
                    </div>
                </div>
                <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
            </div>
            
            <motion.div 
                className={`text-sm leading-relaxed ml-7 mb-3 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                }`}
                initial={false}
                animate={{ 
                    height: isExpanded ? 'auto' : '1.25rem'
                }}
                style={{ 
                    overflow: 'hidden',
                    display: 'block'
                }}
                transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                }}
            >
                <InputDisplay input={message.content} />
            </motion.div>
            
            <motion.div 
                className="flex items-center justify-end space-x-2 ml-7"
                initial={false}
                animate={{
                    opacity: isExpanded ? 1 : 0.7,
                    y: isExpanded ? 0 : -5
                }}
                transition={{
                    duration: 0.2,
                    delay: isExpanded ? 0.1 : 0
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mt-2 ml-7" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-2">
                        <AlertDialogComponent 
                            Trigger={
                                <button 
                                    className={`p-1.5 rounded-md transition-colors duration-150 hover:${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                                    onClick={(e) => e.stopPropagation()} 
                                >
                                    <BookmarkCheck size={16} />
                                </button>
                            }
                            title={"Remove From BockMarks"}
                            description={"Are you sure you want to remove this item from your book marks?"}
                            confirmButtonText={"Remove"}
                            onConfirmation={() => {
                                on_update()
                            }} 
                        />
                        <button
                            className={`p-1.5 rounded-md transition-colors duration-150 hover:${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                            onClick={(e) => {
                                e.stopPropagation() // Stop propagation on button
                                on_jump()
                            }} 
                        >
                            <CornerUpRight size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );

};

export default MessageWidget
