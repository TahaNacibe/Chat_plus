import { AlertDialogComponent } from "@/components/dialogs/confirm_dialog";
import formatDate from "@/utils/get_date_display";
import { MessageCircleDashed, BookmarkCheck, CornerUpRight } from "lucide-react";

// Chat Widget Component
const ChatWidget = ({ chat, isDark, on_update, setActiveChat }: { chat: ChatEntry, isDark: boolean, on_update: () => void, setActiveChat:(chat:ChatEntry) => void }) => {

    return (
        <div className={`px-4 py-3 transition-colors duration-150 cursor-pointer ${
            isDark ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
        }`}>
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                        <MessageCircleDashed size={18} />
                        <h3 className={`font-medium text-sm truncate ${
                            isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                            {chat.title}
                        </h3>
                    </div>
                    <div className="flex items-center justify-between mt-2 ml-7">
                        <span className="text-xs text-gray-500">{formatDate(chat.created_at)}</span>
                        <div className="flex items-center space-x-2">
                            <AlertDialogComponent Trigger={
                            <button className={`p-1.5 rounded-md transition-colors duration-150 hover:${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <BookmarkCheck size={16} />
                            </button>
                                }
                                title={"Remove From BockMarks"}
                                description={"Are you sure you want to remove this item from your book marks?"}
                                confirmButtonText={"Remove"}
                                onConfirmation={() => on_update()} />
                            
                            {/* Jump to button */}
                            <button
                                onClick={() => setActiveChat(chat)}
                                className={`p-1.5 rounded-md transition-colors duration-150 hover:${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <CornerUpRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default ChatWidget