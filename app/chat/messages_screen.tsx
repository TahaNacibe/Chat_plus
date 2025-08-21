import ActionBarForMessage from "@/components/costume/action_bar_for_message";
import PfpWidget from "@/components/costume/avatar";
import ChatGPTStyleInput from "@/components/costume/input_section";
import PageHeaders from "@/components/costume/page_headers";
import SelectableText from "@/components/costume/selectable_text";
import { useChat } from "@/context/chat_context";
import { useProfileAndSettings } from "@/context/profile_context";
import { update_message_archive_state } from "@/services/API/archive_services";
import { regenerate_model_response, sent_new_message } from "@/services/API/chat_services";
import { send_rag_candidate_to_db } from "@/services/API/rag_services";
import getFormattedTimestamp from "@/utils/time_stamp";
import get_chat_title from "@/utils/title_extractor";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { UserMessageBlock } from "./components/user_message";
import { LoadingIndicator } from "@/components/costume/loading_animation";
import EmptyMessagesScreen from "./components/empty_chat_place_holder";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MessagesScreen() {
    //? state
    const router = useRouter();
    const { profile, settings } = useProfileAndSettings();
    const { updateMessages, updateTitle, toggleArchive, updateActiveChat, messages, id, updateMessagesList, title, updateChatTitle, setChatList, loadingState } = useChat();
    const [action, setAction] = useState<{action_type:"Explain" | "Tag", selected_content:string, parent_message:string, message_id:number } | null>(null)
    const [responseMode, setResponseMode] = useState("Conversational")
    const [isWaitingResponse, setIsWaitingResponse] = useState(false)
    const [inWorkMessageId, setInWorkMessageId] = useState<number | null>(null)
    const messageListRef = useRef<HTMLDivElement>(null)
    // Track active regeneration for each message
    const [activeRegenerations, setActiveRegenerations] = useState<{[messageId: number]: number}>({})


    //* get theme 
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    //* get the user specified settings
    const get_user_settings_for_message = () => {
        return JSON.stringify({
            name: profile.username,
            user_specified_rules: profile.rules,
            user_specified_response_style: profile.responseStyle,
            user_specified_persona: profile.personality,
            user_specified_behavior_prompt: profile.behaviorPrompt,
            about_user: profile.aboutMe,
            user_specified_additional_info: profile.additionalInfo
    })
    }

    const get_models_dict = () => {
        return JSON.stringify({
            "openai_api_key": settings.openaiApiKey,          
            "openai_model": settings.openaiApiModel,             
            "gemini_api_key": settings.geminiApiKey,          
            "gemini_model": settings.geminiApiModel,   
            "local_config": {                    
                "model_path":settings.modelPath,
                "model_type":settings.modelType,
                "endpoint":settings.modelEndPoint,
                "model":settings.modelName,
                "api_type":settings.apiType,
                "max_tokens":settings.maxTokens,
                "temperature":settings.temperature,
                "context_length":settings.contextLength,
                "gpu_layers":settings.gpuLayers,
            }
        })
    }


//? Handle sending a new message
    const handleSendMessage = async (message: string, formData: FormData | null) => {
    if (!message.trim() && !formData) return;
        
  // Create local placeholders
    const tempUserMessage: Message = {
    id: -2,
    chat_id:id,
    role: "user",
    content: message,
    is_archived: false,
    created_at: getFormattedTimestamp(),
    };

    const placeholderAssistant: Message = {
    id: -1,
    chat_id:id,
    role: "assistant",
    content: "PlaceHolder",
    is_archived: false,
    created_at: getFormattedTimestamp(),
    };        
        
    // Optimistic UI update
    updateMessagesList(tempUserMessage);
    updateMessagesList(placeholderAssistant);
    setIsWaitingResponse(true);

    // upload the rag file
    if (formData) {
        const rag_res = await send_rag_candidate_to_db(formData)
        if (rag_res.success) {
            console.log("uploaded")
        } else {
            return;
        }
    }
    // Send message to backend
        const res = await sent_new_message({
            chat_id: id, user_message: message, title,
            use_rag: formData != null, mode: responseMode, action: action && action.action_type,
            user_settings: get_user_settings_for_message()
        });

    if (!res.success) {
    setIsWaitingResponse(false);
    return;
    }

    const { user_message, assistant_message } = res.data.response;
    const userFromBackend = user_message[0];
    const assistantFromBackend = assistant_message[0];

    const titleInfo = get_chat_title(assistantFromBackend.content);
    const cleanedContent = titleInfo.cleaned_string;
    const finalTitle = titleInfo.title;

    const finalAssistantMessage = {
    ...assistantFromBackend,
    content: cleanedContent,
    };

  // Replace placeholders with real messages
    updateMessages(prev =>
    prev
        .filter(m => m.id !== -1 && m.id !== -2)
        .concat([userFromBackend, finalAssistantMessage])
    );


    if (res.data.chat && res.data.chat.length > 0) {

    const newChat: ChatEntry = {
        ...res.data.chat[0],
        title: finalTitle,
        messages: [userFromBackend, finalAssistantMessage],
    };


    setChatList(prev => {
        const replaced = prev.some(chat => chat.id === -1);
        const updated = replaced
        ? prev.map(chat => (chat.id === -1 ? newChat : chat))
        : [newChat, ...prev];

        if (replaced) {
        console.log(
            `Replaced one item from the chat item id ${newChat.id} and title of ${newChat.title}`
        );
        }

        return updated;
    });

    updateActiveChat(newChat);
    } else {
    // Fallback in case no new chat was returned
        console.log(`starting the update title if no chat was returned: ${finalTitle}`);
        if (finalTitle) {
            updateTitle(finalTitle);
            updateChatTitle(id, finalTitle);
        }
    }
};



    const handleSaveMessage = async (message_id: number, current_archive_state: boolean) => { 
        //* update on backend
        const res = await update_message_archive_state({ message_id, current_archive_state })
        if (res.success) {
            //* update locally
            if (!message_id) return;
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

    //* handle the regenerate action 
    async function handle_regenerate_message({ original_model_message, model_response_index }: { original_model_message: Message, model_response_index:number }) {
        if (!original_model_message || !original_model_message.id) return;
        setInWorkMessageId(original_model_message.id!)

        const user_message_entry = model_response_index > 0 ? messages[model_response_index - 1] : null
        if (!user_message_entry) {
            console.log("the user message is unaccessible")
            return;
        }
        const res = await regenerate_model_response({
            chat_id: id, original_user_message: user_message_entry,
            original_model_response: original_model_message,
            use_rag: false, mode: responseMode, action: action && action.action_type,
            user_settings: get_user_settings_for_message()
        })
        if (!res.success) {
            console.log("the response wasn't acceptable")
            return;
        }
        const assistant_message = res.data;
        const assistantFromBackend = assistant_message[0];
        updateMessages(prev => [...prev, assistantFromBackend])
        setInWorkMessageId(null)
    }


    function get_regenerations_from_message(message_id: number) {
        const regenerationList = messages.filter((msg) => msg.original_message_id && msg.original_message_id == message_id)
        const original_message = messages.find((msg) => msg.id == message_id)
        if(!original_message) return []
        return [original_message,...regenerationList]
    }

    // Handle regeneration navigation
    const handleRegenerationChange = (messageId: number, direction: 'prev' | 'next', totalCount: number) => {
        setActiveRegenerations(prev => {
            const current = prev[messageId] || 0;
            let newIndex;
            
            if (direction === 'prev') {
                newIndex = current > 0 ? current - 1 : totalCount - 1;
            } else {
                newIndex = current < totalCount - 1 ? current + 1 : 0;
            }
            
            return { ...prev, [messageId]: newIndex };
        });
    };

    //* must be here or won't work
    function ScrollToHash() {
        useEffect(() => {
            const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash) {
                // Wait for DOM to be ready
                setTimeout(() => {
                const el = document.getElementById(hash.slice(1));
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    router.push("/")
                } else {
                    console.warn("Element not found:", hash);
                }
                }, 50);
            }
        };

        // Run on mount
        handleHashChange();

        // Listen for hash changes
        window.addEventListener("hashchange", handleHashChange);

        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
        }, []);

        return null;
    }

    
    //? loading place holder
    if (loadingState) {
        return <div className={`h-screen w-full flex flex-col overflow-y-hidden relative text-black dark:bg-black dark:text-white`}>
            {/* Header */}
            <PageHeaders title={title} />
            <div className="w-full h-full flex flex-col justify-center items-center">
                <LoadingIndicator />
                <h1>
                    Getting Your messages Ready...
                </h1>
            </div>
        </div>
    }
    

    //? UI
    return (
        <>
        <div className={`h-screen w-full flex flex-col overflow-y-hidden relative text-black dark:text-white bg-white dark:bg-black`}>
        <ScrollToHash />
        {/* Header */}
        <PageHeaders title={title.replace("--Temp","")} />

        {/* Messages Area */}
            {messages && messages.length > 0
            ? <div className="flex-1 overflow-y-auto pb-36">
            <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="space-y-6" ref={messageListRef}>
                    {(messages ?? []).map((msg: Message, index) => {
                        const regenerationList = get_regenerations_from_message(msg.id!)
                        const activeRegenerateIndex = activeRegenerations[msg.id!] || 0
                        const currentMessage = regenerationList[activeRegenerateIndex] || msg
                        
                    if (!msg.original_message_id) {
                        return (
                        <div
                            id={`msg-${msg.id}`}
                            key={msg.id ?? index}
                            className={`flex gap-3 ${msg.role === 'user' ? "flex-row-reverse items-start" : "items-start"}`}>
                        
                        {/* Avatar */}
                        <div className="flex-shrink-0 mb-1">
                        <PfpWidget msg={msg} isDark={isDark} profilePicture={profile.profilePicture} />
                        </div>

                        {/* Message Content */}
                        <div className="flex flex-col min-w-0 max-w-4/5">
                        <div className={`dark:text-white text-black leading-relaxed`}>
                                    {currentMessage.role != "user" && currentMessage.content != "PlaceHolder"
                                        ? inWorkMessageId == msg.id ? <div className="px-2">
                                            <LoadingIndicator />
                                            Working on it....
                                        </div>
                                        : <SelectableText
                                            key={`${currentMessage.id}-${activeRegenerateIndex}`}
                                            onTag={(selected_message, full_message) => {
                                                //* update the selection state
                                                setAction({
                                                    action_type: "Tag",
                                                    selected_content: selected_message,
                                                    parent_message: full_message,
                                                    message_id: currentMessage.id!
                                                })
                                            }}
                                            onExplain={(selected_message, full_message) => {
                                                //* update the selection state
                                                setAction({
                                                    action_type: "Explain",
                                                    selected_content: selected_message,
                                                    parent_message: full_message,
                                                    message_id: currentMessage.id!
                                                })
                                }}
                                text={currentMessage.content} onSelect={(selected_text) => {}} />
                                        : currentMessage.role != "user" && currentMessage.content == "PlaceHolder"
                                            ? <LoadingIndicator />
                                            : <div className=" px-2 py-2">
                                                <UserMessageBlock rawData={currentMessage.content} />
                                        </div>}
                                    
                                
                            {/* info bar for message  */}
                            {currentMessage.role != "user"
                            && <ActionBarForMessage
                                onCopy={() => alert("Assistant action triggered")}
                                onReGenerate={() => handle_regenerate_message({original_model_message:msg, model_response_index:index})}
                                onSave={() => handleSaveMessage(currentMessage.id!,currentMessage.is_archived)}
                                saved={currentMessage.is_archived}
                                            />}
                                {/* switch bar */}
                                {regenerationList.length > 1 && (
                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-200">
                                        <button 
                                            onClick={() => handleRegenerationChange(msg.id!, 'prev', regenerationList.length)}
                                            className="hover:text-gray-700 p-1 rounded"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span>
                                            {activeRegenerateIndex + 1} / {regenerationList.length}
                                        </span>
                                        <button 
                                            onClick={() => handleRegenerationChange(msg.id!, 'next', regenerationList.length)}
                                            className="hover:text-gray-700 p-1 rounded"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                        </div>
                        </div>
                    </div>
                    )
                    }
                })}
            </div>
            </div>
                    </div>
        :<EmptyMessagesScreen userName={profile.username} />}

        {/* Input Area */}
                <div className="bg-transparent absolute bottom-0 w-full z-2">
                    <ChatGPTStyleInput
                    onSend={handleSendMessage}
                    chat_id={id}
                    activeTask={action}
                    setExternalMode={setResponseMode}
                    remove_action={() => {
                        setAction(null)
                    }} />
                </div>
        </div>
        </>
    )
}