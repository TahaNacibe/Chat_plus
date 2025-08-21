import { MouseEventHandler, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { AlertDialogComponent } from "../dialogs/confirm_dialog"
import { RenameChatDialog } from "../dialogs/rename_dialog"
import { MoreHorizontal, Trash, Archive, Download, BookMarked, BookmarkCheck } from "lucide-react"
import Link from "next/link"

const ChatHistoryItem = ({
  title,
  chat_id,
  timestamp,
  is_collapsed,
  active_chat_id,
  is_archived,
  onClick,
  handle_delete_action,
  handle_archive_chat,
  handle_rename_action,
  handle_save_chat_item
}: {
  title: string
  chat_id: number
  is_archived: boolean
  is_collapsed: boolean,
  active_chat_id:number,
  timestamp: string
  onClick: (e:React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  handle_delete_action: (chat_id:number) => void
  handle_rename_action: ({chat_id,new_title}:{chat_id:number, new_title:string}) => void
  handle_archive_chat: ({ chat_id, current_archive_state }: { chat_id: number, current_archive_state: boolean }) => void
  handle_save_chat_item: ({chat_id}:{chat_id:number}) => void
}) => {
  const DropMenuItemComponent = ({
    Icon,
    text,
    action,
    isDestructive = false,
  }: {
    Icon: any
    text: string
    action: () => void
    isDestructive?: boolean
    }) => (
    <div
        onClick={(e) => {
        action()}}
      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md cursor-pointer text-black dark:text-white dark:hover:bg-gray-900 hover:bg-gray-50 hover:text-gray-700`}>
        <Icon size={14} />
        {text}
      </div>
  )



  const [isOpen, setIsOpen] = useState(false)
  return (
    <div
      onClick={(e) => onClick(e)}
      className={`group/chat-item w-full text-left px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200 cursor-pointer rounded-lg ${active_chat_id === chat_id && !is_collapsed ? "bg-gray-100 dark:bg-gray-900" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
      <Link href={"/"} className="flex-1 min-w-0 text-black dark:text-white">
        <div className="flex-1 min-w-0 overflow-ellipsis">
            <h3 className="text-sm truncate font-medium text-gray-800 dark:text-gray-100 flex gap-2">
              {Boolean(is_archived) && <div className="flex-1">
              <BookmarkCheck size={16} /></div>}
            {title}
          </h3>
        </div>
      </Link>

        <div
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 pointer-events-none group-hover/chat-item:pointer-events-auto group-hover/chat-item:opacity-100 transition-opacity duration-200"
        >
          <DropdownMenu open={isOpen} onOpenChange={(e) => setIsOpen(e)}>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-md hover:bg-white/20">
                <MoreHorizontal
                  className="text-gray-400 dark:text-gray-100 group-hover/chat-item:text-black dark:group-hover/chat-item:text-white"
                  size={16}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white text-black border border-gray-200 dark:bg-black dark:text-white dark:border-gray-600 shadow-lg rounded-lg min-w-[140px] p-1">
              <RenameChatDialog
                currentTitle={title}
                onRename={(newTitle: string) => {
                  handle_rename_action({chat_id, new_title:newTitle})
                  setIsOpen(false)
                } } />
              <DropMenuItemComponent Icon={Download} text="Save" action={() => {
                handle_save_chat_item({chat_id})
                setIsOpen(false)
              }} />
              <DropdownMenuSeparator className="my-1 bg-gray-200 dark:bg-gray-800" />
              <DropMenuItemComponent Icon={Archive} text={is_archived? "UnArchive" : "Archive"} action={() => { 
                handle_archive_chat({chat_id, current_archive_state:Boolean(is_archived)})
                setIsOpen(false)
              }} />
              {/* delete button */}
              <AlertDialogComponent Trigger={
              <div
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
                }`}
              >
                <Trash size={14} />
                Delete
              </div>
              } title={"Are You Sure?"} description={"By deleting a chat you will loss all chat history and access to media from that chat we highly recommend you reconsider"}
                confirmButtonText={"Delete"} onConfirmation={() => {
                  handle_delete_action(chat_id)
                }} />
              
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}


export default ChatHistoryItem