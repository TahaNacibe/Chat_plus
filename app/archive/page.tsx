"use client"
import PageHeaders from "@/components/costume/page_headers";
import { useChat } from "@/context/chat_context";
import { load_archived_chats, load_archived_messages, update_chat_archive_state, update_message_archive_state } from "@/services/API/archive_services";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import ChatWidget from "./components/chat_widget";
import EmptyState from "./components/empty_state";
import MessageWidget from "./components/message_widget";
import TabNavigation from "./components/tab_navigation";
import { redirect, useRouter } from "next/navigation"


// Main Archive Page Component
export default function ArchivePage() {
    const [archivedChats, setArchivedChats] = useState<ChatEntry[]>([])
    const [archivedMessages, setArchivedMessages] = useState<Message[]>([])
    const [activeTab, setActiveTab] = useState<'chats' | 'messages'>('chats')
    const [expendItem, setExpandedItem] = useState<number | null>(null)

    const { updateArchiveStateFromChat,updateMessages, updateActiveChat, chatList } = useChat();
    const { theme } = useTheme();
    const router = useRouter()
    const isDark = theme === 'dark';

    async function load_archived_entries() {
        const [chats_response, messages_response] = await Promise.all([
            load_archived_chats(),
            load_archived_messages()
        ])

        if (!chats_response.success || !messages_response.success) {
            console.log("Failed To fetch data for one or more items!")
        }

        setArchivedChats(chats_response.data)
        setArchivedMessages(messages_response.data)
    }

    useEffect(() => {
        load_archived_entries()
    }, [])


    const handle_remove_chat_from_bookmarks = async ({chat_id,current_archive_state} :{ chat_id: number, current_archive_state: boolean }) => {
        const res = await update_chat_archive_state({ chat_id, current_archive_state })
        if (res.success) {
            //* update the copy of the list the user have
            updateArchiveStateFromChat(chat_id, current_archive_state)
            setArchivedChats(prev => prev.filter((item) => item.id != chat_id))
        }
    }



    const handle_remove_message_from_bookmarks = async (message_id: number, current_archive_state: boolean) => { 
        //* update on backend
        const res = await update_message_archive_state({ message_id, current_archive_state })
        if (res.success) {
            //* update locally
            if (!message_id) return;
            setArchivedMessages(prev => prev.filter((item) => item.id != message_id))
            updateMessages(prev => prev.map((msg) => {
                if (msg.id != message_id) return msg;
                return {
                    ...msg,
                    is_archived: !current_archive_state
                }
            }))
        } else {
            console.log("could,'t update archive state")
        }
    }


    function handle_jump_to_message(chat_id: number, id: number | undefined): void {
        //? get the chat the message belong to
        const target_chat = chatList.find((chat) => chat.id == chat_id)
        if (!target_chat) {
            console.log("missing target chat")
            return;
        }
        //? load the message and jump
        updateActiveChat(target_chat)
        router.push(`/#msg-${id}`)
    }

    return (
        <div className={`h-screen w-full flex flex-col flex-1 dark:bg-black dark:text-white bg-white text-gray-900`}>
            <div className="w-full">
                <PageHeaders title="Archive" have_border={false} />
            
                <div className="flex-1 flex flex-col overflow-y-auto">
                    <TabNavigation 
                        activeTab={activeTab} 
                        setActiveTab={setActiveTab}
                        archivedChats={archivedChats}
                        archivedMessages={archivedMessages}
                        isDark={isDark}
                    />

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden px-2">
                        {activeTab === 'chats' ? (
                            <div className="h-full">
                                {archivedChats.length === 0 ? (
                                    <EmptyState type="chats" />
                                ) : (
                                    <div className="h-full overflow-y-auto pr-2">
                                        <div className={`rounded-lg overflow-hidden py-1 ${
                                            'dark:bg-black dark:border-gray-700 bg-white border border-gray-200'
                                        }`}>
                                            {archivedChats.map((chat, index) => (
                                                <div
                                                    key={chat.id}
                                                    className={index !== archivedChats.length - 1 
                                                        ? 'border-b dark:border-gray-700  border-gray-100'
                                                        : ''
                                                    }
                                                >
                                                    <ChatWidget
                                                        setActiveChat={(chat) => {
                                                            updateActiveChat(chat)
                                                            redirect("/")
                                                        }}
                                                        on_update={() => handle_remove_chat_from_bookmarks({chat_id:chat.id, current_archive_state:chat.is_archived})}
                                                        chat={chat} isDark={isDark} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full">
                                {archivedMessages.length === 0 ? (
                                    <EmptyState type="messages"  />
                                ) : (
                                    <div className="h-full overflow-y-auto pr-2">
                                        <div className="rounded-lg overflow-hidden dark:bg-black dark:border-gray-700 bg-white border border-gray-200">
                                            {archivedMessages.map((message, index) => (
                                                <MessageWidget
                                                    key={message.id || index}
                                                    message={message}
                                                    isDark={isDark}
                                                    isLast={index === archivedMessages.length - 1}
                                                    expendItem={expendItem}
                                                    setExpendItem={() => expendItem == message.id ? setExpandedItem(null) : setExpandedItem(message.id!)}
                                                    on_update={() => handle_remove_message_from_bookmarks(message.id!, message.is_archived)}
                                                    on_jump={() => handle_jump_to_message(message.chat_id, message.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}