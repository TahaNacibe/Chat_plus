import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Brain, FilePlus, FileSymlinkIcon, Globe, MessageCircleMoreIcon, Paperclip } from "lucide-react"
import { ChangeEvent } from "react"

interface ChatTypeSelectorInterface {
    currentMode: 'Conversational' | 'Deep Think' | 'Use RAG' | 'Web Search'
    setCurrentMode: (mode: 'Conversational' | 'Deep Think' | 'Use RAG' | 'Web Search') => void,
    handleFileSelect: (e:ChangeEvent<HTMLInputElement>) => void
}


function ChatTypeSelectorItem({mode, icon:Icon}:{mode:string, icon:any}) {
    return (
        <div className="flex gap-2 text-gray-800 dark:text-gray-200 pr-4">
            <Icon size={20} />
            {mode}
        </div>
    )
}



export default function ChatTypeSelector({ currentMode, setCurrentMode, handleFileSelect }
    : ChatTypeSelectorInterface) {    
    
    return (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
                <button
                    className="absolute left-4 bottom-5 text-gray-500 hover:text-gray-700 transition-colors">
                <Paperclip size={16} />
            </button>
        </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="hover:bg-gray-100 dark:hover:bg-gray-900">
                <label className="relative inline-flex items-center gap-2 cursor-pointer text-gray-800 dark:text-gray-200">
                <input
                        type="file"
                        onChange={handleFileSelect}  
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/json,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FilePlus size={20} />
                Add File
                </label>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
                <DropdownMenuItem 
                className="hover:bg-gray-100 dark:hover:bg-gray-900"
                onSelect={() => setCurrentMode("Conversational")}>
                    <ChatTypeSelectorItem mode={"Conversational"} icon={MessageCircleMoreIcon} />
            </DropdownMenuItem>
                <DropdownMenuItem 
                className="hover:bg-gray-100 dark:hover:bg-gray-900"
                onSelect={() => setCurrentMode("Deep Think")}>
                    <ChatTypeSelectorItem mode={"Deep Think"} icon={Brain} />
            </DropdownMenuItem>
            <DropdownMenuItem 
                className="hover:bg-gray-100 dark:hover:bg-gray-900"
                onSelect={() => setCurrentMode("Use RAG")}>
                    <ChatTypeSelectorItem mode={"Use RAG"} icon={FileSymlinkIcon} />
            </DropdownMenuItem>
            <DropdownMenuItem 
                className="hover:bg-gray-100 dark:hover:bg-gray-900"
                onSelect={() => setCurrentMode("Web Search")}>
                    <ChatTypeSelectorItem mode={"Web Search"} icon={Globe} />
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    )
}