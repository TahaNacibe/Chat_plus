import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Calendar, Archive, Search, Clock, User, Bot, MessageCircleCode, MessageCircleDashedIcon, Library } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import formatDate from "@/utils/get_date_display";
import { searchForChat, searchForMessage } from "@/services/API/search_services";
import InputDisplay from "../costume/response_blocks_display";
import { useChat } from "@/context/chat_context";
import getFormattedTimestamp from "@/utils/time_stamp";

export function SearchCommandDialog({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<{ chatMatches: ChatEntry[]; messageMatches: Message[] }>({ 
    chatMatches: [], 
    messageMatches: [] 
  });
  const [isSearching, setIsSearching] = useState(false);
  const { updateActiveChat, setChatList, chatList } = useChat();



  // Search functionality
  async function search_db_for_messages_and_chats(query: string) {
    if (!query) return { chats_result: [], messages_result: [] };

    try {
      // Search for items in db
      const [chats_result, messages_result] = await Promise.all([
        searchForChat(query),
        searchForMessage(query)
      ]);

      if (!chats_result.success || !messages_result.success) {
        console.log("Something went wrong");
        return { chats_result: [], messages_result: [] };
      }

      return { 
        chats_result: chats_result.data || [], 
        messages_result: messages_result.data || [] 
      };
    } catch (error) {
      console.error("Search function error:", error);
      return { chats_result: [], messages_result: [] };
    }
  }



  // Auto-trigger search when user stops typing
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults({ chatMatches: [], messageMatches: [] });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const searchResults = await search_db_for_messages_and_chats(searchQuery);
        const newResults = {
          chatMatches: searchResults.chats_result,
          messageMatches: searchResults.messages_result
        };
        setResults(newResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults({ chatMatches: [], messageMatches: [] });
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);



  const handleOpenDialog = () => {
    setIsOpen(true);
    // Clear previous search when opening
    setSearchQuery("");
    setResults({ chatMatches: [], messageMatches: [] });
  };



  const handleChatSelect = (chat: ChatEntry) => {
    setIsOpen(false);
    updateActiveChat(chat)
    router.push("/");
  };

  const handleMessageSelect = (message: Message) => {
    setIsOpen(false);
    const target_chat = chatList.find((chat) => chat.id == message.chat_id)
    if (!target_chat) {
      console.log("couldn't find the chat requested")
      return;
    }
    updateActiveChat(target_chat)
    router.push(`/#msg-${message.id}`);
  };

    //? create new chat
  const request_new_chat = async () => {
    const newChat = chatList.find((chat) => chat.id == -1)
    if (!newChat) {
      //* create a new chat and activate it 
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


  return (
    <div className="w-full">
      {/* Trigger Button */}
      <button className="flex-1 w-full" onClick={handleOpenDialog}>
        {trigger}
      </button>

      {/* Command Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white/20  flex items-center justify-center p-4">
          <div className=" rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
            <Command shouldFilter={false} className="rounded-2xl border-0 bg-white text-black dark:bg-black dark:text-white">
              <div className="px-6 py-4">
                <CommandInput
                  placeholder="Search conversations and messages..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsOpen(false);
                    }
                  }}
                  className="text-lg border-0 focus:ring-0 px-0 placeholder:text-gray-400"
                />
              </div>
              

              <CommandList className="max-h-[70vh] px-2 ">
                

                {/* quick access  */}
                <CommandGroup heading="Quick Access">
                  <CommandItem
                    onSelect={() => {
                      request_new_chat()
                      router.push("/  ")
                      setIsOpen(false)
                    }}
                  className={`w-full text-left flex items-center gap-3
                    text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 group p-3 border-b border-gray-100 dark:text-gray-200 dark:hover:bg-gray-900 dark:border-gray-900 border-l-0 border-r-0`}
                  >
                    <MessageCircleDashedIcon size={20} className="flex-shrink-0" />
                  <span className="text-sm">New Chat</span>
                  </CommandItem>
                  <CommandItem
                  className={`w-full text-left flex items-center gap-3
                    text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 group p-3 border-b border-gray-100 dark:text-gray-200 dark:hover:bg-gray-900 dark:border-gray-900 border-l-0 border-r-0`}
                  >
                    <Library size={20} className="flex-shrink-0" />
                  <span className="text-sm">Library</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      setIsOpen(false)
                      router.push("/archive")
                  }}
                  className={`w-full text-left flex items-center gap-3
                    text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 group p-3 border-b border-gray-100 dark:text-gray-200 dark:hover:bg-gray-900 dark:border-gray-900 border-l-0 border-r-0`}
                  >
                    <Archive size={20} className="flex-shrink-0" />
                  <span className="text-sm">Archived</span>
                </CommandItem>
                </CommandGroup>


              {/* empty list case */}
              {(results.chatMatches ?? []).length == 0 && (results.messageMatches ?? []).length == 0 && <CommandItem>
                        <div className="flex flex-col items-center justify-center py-12 text-center w-full">
                          <Search className="h-12 w-12 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-600 mb-2">
                            {isSearching ? "Searching..." : "No results found"}
                          </h3>
                          <p className="text-gray-400 max-w-sm">
                            {isSearching 
                              ? "Looking through your conversations..." 
                              : "Try adjusting your search terms or check for typos"
                            }
                          </p>
                        </div>
                </CommandItem>}


                {/* Chat Title Matches */}
                {(results.chatMatches ?? []).length > 0 && (
                  <CommandGroup heading={`Conversations (${results.chatMatches.length})`}>
                    <div className="space-y-1">
                      {results.chatMatches.map((chat) => (
                        <CommandItem
                          key={`chat-${chat.id}`}
                          onSelect={() => handleChatSelect(chat)}
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 transition-colors"
                        >
                          <MessageCircleCode className="text-gray-400 h-5 w-5 flex-shrink-0 dark:text-white" />

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                              {chat.title}
                            </h4>

                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(chat.created_at)}
                              </span>

                              {chat.is_archived && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                  <Archive className="h-3 w-3" />
                                  Archived
                                </span>
                              )}
                            </div>
                          </div>
                        </CommandItem>

                      ))}
                    </div>
                  </CommandGroup>
                )}

                {/* Message Content Matches */}
                {results.messageMatches.length > 0 && (
                  <CommandGroup heading={`Messages (${results.messageMatches.length})`}>
                    <div className="space-y-2">
                      {results.messageMatches.map((message, index) => (
                        <CommandItem
                          key={`message-${message.id || index}`}
                          onSelect={() => handleMessageSelect(message)}
                          className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 transition-colors"
                        >
                          {message.role === "user" ? (
                            <User className="text-green-600 h-5 w-5 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Bot className="text-purple-600 h-5 w-5 mt-0.5 flex-shrink-0" />
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-100 leading-snug mb-2 line-clamp-3">
                              <InputDisplay input={message.content} />
                            </div>

                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-50 dark:text-gray-1000">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDate(message.created_at)}
                              </span>

                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                                message.role === 'user' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {message.role === 'user' ? (
                                  <User className="h-3 w-3" />
                                ) : (
                                  <Bot className="h-3 w-3" />
                                )}
                                {message.role === 'user' ? 'You' : 'Assistant'}
                              </span>

                              {message.is_archived && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                  <Archive className="h-3 w-3" />
                                  Archived
                                </span>
                              )}
                            </div>
                          </div>
                        </CommandItem>

                      ))}
                    </div>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>

          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}