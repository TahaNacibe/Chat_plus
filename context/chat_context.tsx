"use client";

import getFormattedTimestamp from "@/utils/time_stamp";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { load_user_chats } from "@/services/API/chat_services";

//? Types
type ChatEntry = {
  id: number;
  title: string;
  is_archived: boolean;
  created_at: string;
  messages: Message[];
};

type ChatContextType = ChatEntry & {
  updateActiveChat: (data: Partial<ChatEntry>) => void; // changed from setActiveChat
  updateMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  updateTitle: (title: string) => void;
  toggleArchive: (state: boolean) => void;
  updateMessagesList: (message: Message) => void;
  
  updateLoadingState: (state: boolean) => void;
  loadingState:boolean

  chatList: ChatEntry[];
  setChatList: React.Dispatch<React.SetStateAction<ChatEntry[]>>;
  updateChatTitle: (chat_id: number, new_name: string) => void;
  deleteChatItem: (chat_id: number) => void;
  updateArchiveStateFromChat: (chat_id: number, current_state: boolean) => void;
};


//? Create context
const ChatContextProvider = createContext<ChatContextType | null>(null);

//? Provider
export const ChatContext = ({ children }: { children: ReactNode }) => {
  const [loadingState, setLoadingState] = useState(true)
  const [activeChat, setActiveChat] = useState<ChatEntry>({
    id: -1,
    title: "New Chat",
    is_archived: false,
    created_at: getFormattedTimestamp(),
    messages: [],
  });

  const [chatList, setChatList] = useState<ChatEntry[]>(
    [] as ChatEntry[]
  );

  const loadChats = async () => {
    const result = await load_user_chats();

    if (result.success && Array.isArray(result.data)) {
      setChatList((result.data as ChatEntry[]).reverse());
      setActiveChat(result.data[0])
    } else {
      setChatList([]);
    }
  };
  // Load chat list on mount
  useEffect(() => {
    loadChats();
  }, []);

  // Mutators
  const updateActiveChat = (data: Partial<ChatEntry>) => {
    setActiveChat(prev => ({ ...prev, ...data }));
  };

  const updateChatTitle = (chat_id: number, new_name: string) => {
    setChatList(prev =>
      prev.map(item => (item.id === chat_id ? { ...item, title: new_name } : item))
    );
  };

  const deleteChatItem = (chat_id: number) => {
    setChatList(prev => prev.filter(item => item.id !== chat_id));
  };

  const updateArchiveStateFromChat = (chat_id: number, current_state: boolean) => {
    setChatList(prev =>
      prev.map(item =>
        item.id === chat_id ? { ...item, is_archived: !current_state } : item
      )
    );
  };

  const updateMessages = (
    input: Message[] | ((prev: Message[]) => Message[])
  ) => {
    setActiveChat(prev => ({
      ...prev,
      messages: typeof input === "function" ? input(prev.messages) : input,
    }));
  };

  const updateTitle = (title: string) => {
    setActiveChat(prev => ({ ...prev, title }));
  };

  const toggleArchive = (state: boolean) => {
    setActiveChat(prev => ({ ...prev, is_archived: state }));
  };

  const updateMessagesList = (message: Message) => {
    setActiveChat(prev => ({
      ...prev,
      messages: [...(prev.messages ?? []), message],
    }));
  };

  const updateArchiveState = (message_id: number, current_archive_state: boolean) => {
    setActiveChat(prev => ({
      ...prev, 
      messages: prev.messages.map((item) => {
        if (item.id != message_id) return item;
        return ({
          ...item,
          is_archived: !current_archive_state
        })
      } )
    }))
  }

  function updateLoadingState(state: boolean) {
    setLoadingState(state)
  }


  return (
    <ChatContextProvider.Provider
      value={{
        ...activeChat,
        updateActiveChat,
        updateChatTitle,
        deleteChatItem,
        updateArchiveStateFromChat,
        updateMessages,
        updateTitle,
        toggleArchive,
        updateMessagesList,
        chatList,
        updateLoadingState,
        loadingState,
        setChatList,
      }}
    >
      {children}
    </ChatContextProvider.Provider>
  );
};

//? Hook
export const useChat = () => {
  const ctx = useContext(ChatContextProvider);
  if (!ctx) throw new Error("useChat must be used within a ChatContext");
  return ctx;
};
