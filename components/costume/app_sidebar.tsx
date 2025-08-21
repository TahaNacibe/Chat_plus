'use client'
import { useSidebar } from "@/components/ui/sidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  MessageCirclePlus,
  Search,
  Library,
  Settings,
  User,
  Archive,
  MenuIcon,
  AtSign,
} from "lucide-react"
import { useProfileAndSettings } from "@/context/profile_context"
import { delete_message_entry, load_all_messages_for_chat, rename_chat_entry, save_chat_locally } from "@/services/API/chat_services"
import { useChat } from "@/context/chat_context"
import getFormattedTimestamp from "@/utils/time_stamp"
import ChatHistoryItem from "./chat_history_item"
import { downloadJsonAsHiddenFile } from "@/services/data/data_services"
import Link from "next/link"
import { update_chat_archive_state } from "@/services/API/archive_services"
import { useEffect } from "react"
import { SearchCommandDialog } from "../dialogs/search_block"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { usePathname } from "next/navigation"

interface SideBarButtonsInterface {
  Icon: any
  title: string
  onClick: () => void
  compact?: boolean,
  state?: string,
  
}


const QuickActionButton = ({ Icon, title, state, onClick }: SideBarButtonsInterface) => {
  const isCollapsed = state === "collapsed"
  return (
    <div
      onClick={onClick}
      style={{ pointerEvents: "auto", WebkitAppRegion: "no-drag" } as React.CSSProperties as any}
      className={`w-full text-left flex items-center gap-3 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 rounded-sm transition-all duration-200 group ${isCollapsed?  "py-1 justify-center":"py-1.5 px-6"}`}
    >
      <Icon size={isCollapsed? 20 : 20} className="flex-shrink-0" />
      {!isCollapsed  && <span className="text-sm font-semibold">{title}</span>}
    </div>
  )
}


export function AppSidebar() {

    const {
    state,
  } = useSidebar()
  const { profile } = useProfileAndSettings();
  const { updateMessages, updateTitle, updateActiveChat, chatList, setChatList, updateChatTitle, id, updateLoadingState } = useChat();
  const pathName = usePathname()

  async function handle_delete_action(chat_id: number) {
    if (!chat_id) return;
    //* remove target and update list
    const updated_list = chatList.filter((chat) => chat_id != chat.id)
    setChatList(updated_list)

    //* exclude the place holder
    if (chat_id != -1) {
      //* update db
      const res = await delete_message_entry({ chat_id })
      if (res.success) {
        console.log("deleted")
      } else {
        console.log(res.data)
      }
    }
  }


  async function handle_archive_chat({ chat_id, current_archive_state }: { chat_id: number, current_archive_state: boolean }) {
    if (!chat_id || (current_archive_state == undefined)) return;
    //* update entry in db
    if (chat_id != 1) {
      const resp = await update_chat_archive_state({ chat_id, current_archive_state })
    if (resp.success) {
      const updated_list = chatList.map((chat) => {
        if (chat.id == chat_id) {
          const new_chat_item = { ...chat, is_archived: !current_archive_state }
          return new_chat_item
        } {
          return chat
        } 
      })
      setChatList(updated_list)
      //* update the entry in the memory
    } else {
      console.log(resp.data)
    }
    }
  }

  async function handle_rename_chat_entry({ chat_id, new_title }: { chat_id: number, new_title: string }) {
    if (!chat_id || !new_title || new_title == "" || new_title.replaceAll(" ", "").length == 0) {
    }

    const res = await rename_chat_entry({ chat_id, new_chat_name: new_title })
    if (res.success) {
      updateTitle(new_title);
      updateChatTitle(chat_id, new_title);
    } else {
      console.log("error ")
    }
  }


  async function handle_save_chat_item({chat_id}:{chat_id: number}) {
    if (!chat_id) return;
    const res = await save_chat_locally({ chat_id })
    if (res.success) {
      const title = res.data.message.chat_metadata.title
      downloadJsonAsHiddenFile(res.data.message, title)
    } else {
      console.log("error")
    }
  }


  const load_chat_messages = async (chat_id: number) => {
    updateLoadingState(true)
    try {
      const res = await load_all_messages_for_chat(chat_id)
      if (res.success) {
        return res.data
      }
    } finally {
      updateLoadingState(false)
    }
  }

  //? manage state
  const handle_change_active_chat = async () => {
    //? load new chat messages
    const chat_messages = await load_chat_messages(id)
    updateMessages(chat_messages)
  }

  //? create new chat
  const request_new_chat = async () => {
    //* create a new chat and activate it 
    const newChat = chatList.find((chat) => chat.id == -1)
    if (!newChat) {
        const new_chat_entry : ChatEntry = {
          id: -1,
          title: "New Chat --Temp",
          is_archived: false,
          created_at: getFormattedTimestamp(),
          messages:[]
        }
        //* update active section
        setChatList(prev => [new_chat_entry, ...prev])
        updateActiveChat(new_chat_entry)
    } else {
      updateActiveChat(newChat)
    }
  }


  if (pathName.includes("/onBoard")) {
    return;
  }


  useEffect(() => {
    console.log("trigger messages load")
    handle_change_active_chat()
  },[id])


  //? UI
  const isCollapsed = state === "collapsed"
  return (
    <Sidebar className="bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800" collapsible="icon" >
      {/* Header */}
      <SidebarHeader className="bg-white dark:bg-black p-4 border-b border-gray-100 dark:border-gray-800">
        <h1 className="p-0.5 text-black dark:text-white flex px-2 gap-2">
          <AtSign />
          {!isCollapsed && "Chat Plus"}
        </h1>
      </SidebarHeader>
      <SidebarHeader className="bg-white dark:bg-black m-0 p-0 py-1 border-b border-gray-100 dark:border-gray-800">
        <div className="">
          <QuickActionButton
            Icon={MessageCirclePlus}
            title="New Chat"
            state={state}
            onClick={() => request_new_chat()}
          />
          
          <div className="flex flex-col gap-2 mt-2">
            <SearchCommandDialog trigger={
              <QuickActionButton
              Icon={Search}
              title="Search"
              state={state}
              onClick={() => {}}
            />
            } />
            <Link href={"/library"}>
            <QuickActionButton
              Icon={Library}
              title="Library"
              state={state}
              onClick={() => {}}
            />
            </Link>
            <Link href={"/archive"}>
              <QuickActionButton
              Icon={Archive}
              title="Archived"
              state={state}
              onClick={() => {}}
            />
            </Link>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className="bg-white dark:bg-black pl-2 flex-1 overflow-y-auto">
        {/* <SearchCommandDialog isDialogOpen={true}  /> */}
        {/* All Chats */}
        <SidebarGroup className="pb-2">
          <div className="">
            {chatList.map((chat) => (
                <ChatHistoryItem
                key={(chat.id ?? "key").toString()}
                title={chat.title.replace("--Temp", "")}
                chat_id={chat.id}
                active_chat_id={id}
                is_collapsed={isCollapsed}
                timestamp={chat.created_at}
                is_archived={chat.is_archived}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  updateActiveChat(chat as any)
                }}
                handle_delete_action={handle_delete_action}
                handle_archive_chat={handle_archive_chat}
                handle_rename_action={handle_rename_chat_entry}
                handle_save_chat_item={handle_save_chat_item}
              />
            ))}
          </div>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 p-0">
        {/* user profile */}
        <Link href={"/settings"}>
          <div
            onClick={() => {}}
            className={`w-full text-left flex items-center border-none text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900/20 transition-all duration-200 group gap-2 ${isCollapsed?  "py-1 justify-center":"p-2"}`}
          >
            <Avatar className="h-10 w-10 border border-gray-300 dark:border-gray-100">
                    <AvatarImage src={profile.profilePicture || ''} />
                    <AvatarFallback className="text-lg p-1 font-bold text-gray-900 bg-white dark:bg-black dark:text-gray-100">
                    {profile.username.slice(0, 2).toUpperCase() || 'UN'}
                    </AvatarFallback>
                </Avatar>
          {!isCollapsed && <div className="flex flex-col">
          <span className="text-sm font-semibold">{profile.username}</span>
          <span className="text-xs text-gray-500 font-light">{profile.responseStyle}</span>
          </div>}
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  )
}