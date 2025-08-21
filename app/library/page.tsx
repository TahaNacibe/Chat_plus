'use client'

import PageHeaders from "@/components/costume/page_headers"
import { loadAllMedia } from "@/services/API/library_services"
import { JSX, useEffect, useState } from "react"
import TabNavigation from "./components/tab_bar"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { BrushCleaning, FileImage, FileText, Film, Link } from "lucide-react"
import { useChat } from "@/context/chat_context"

export default function LibraryPage() {
    const { theme } = useTheme()
    const router = useRouter()
    const isDark = theme === 'dark'

    const [messages, setMessages] = useState<Message[]>([])
    const [activeTab, setActiveTab] = useState<"file" | "images" | "links" | "videos" | "source">('images')
    const {chatList, updateActiveChat} = useChat()

    async function load_media_list() {
        const res = await loadAllMedia()
        if (!res.success) {
            console.error("Failed to load media.")
            return
        }
        setMessages(res.data)
    }

    useEffect(() => {
        load_media_list()
    }, [])

    function extractMediaBlocks(message: Message): { type: string, content: any, message_id:number, chat_id:number }[] {
        const blocks: { type: string, content: any, message_id:number, chat_id:number }[] = []
        const blockRegex = /\[BLOCK:({.*?})\]([\s\S]*?)\[\/BLOCK\]/g
        let match: RegExpExecArray | null

        while ((match = blockRegex.exec(message.content)) !== null) {
            try {
                const meta = JSON.parse(match[1])
                const raw = match[2].trim()
                const parsedContent = JSON.parse(raw)
                blocks.push({ type: meta.type, content: parsedContent, message_id: message.id!, chat_id:message.chat_id})
            } catch (e) {
                console.warn("Invalid block format", e)
            }
        }

        return blocks
    }

    const mediaBlocks = messages.flatMap(extractMediaBlocks).filter(block => {
        if (activeTab === "videos") return block.type === "youtube_video"
        return block.type === activeTab
    })

    function renderPlaceholder(icon: JSX.Element, label: string) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full text-center p-4 text-gray-400 dark:text-gray-500">
                <div className="text-4xl mb-2">{icon}</div>
                <p className="text-sm">{label}</p>
            </div>
        )
    }

    function renderMediaBlock(media: { type: string, content: any }, idx: number) {
        switch (media.type) {
            case "images":
                return media.content.images?.map((img: string, i: number) => (
                    <div key={`${idx}-${i}`} className="overflow-hidden aspect-square">
                        {img ? (
                            <img
                                onError={() => <div>Error</div>}
                                src={img} alt={`image-${idx}-${i}`} className="object-cover w-full h-full" />
                        ) : renderPlaceholder(<FileImage />, "No image available")}
                    </div>
                ))
            case "youtube_video":
                const videoId = media.content.videoId
                const thumbnail = media.content.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                return (
                    <div key={idx} className="overflow-hidden aspect-square relative">
                        {videoId ? (
                            <a
                                href={`https://www.youtube.com/watch?v=${videoId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full h-full"
                            >
                                <img src={thumbnail} alt={media.content.title || "YouTube Video"} className="object-cover w-full h-full" />
                            </a>
                        ) : renderPlaceholder(<Film />, "Missing YouTube video ID")}
                    </div>
                )
            case "links":
                return media.content.links?.map((link: string, i: number) => (
                    <div key={`${idx}-${i}`} className="p-2 text-sm break-words w-full h-60 border bg-gray-200/10 border-gray-100 dark:bg-black/30 dark:border-gray-800 justify-center items-center flex flex-col">
                        <Link size={25} className="text-gray-400 dark:text-gray-500" />
                        <a href={link} target="_blank" rel="noopener noreferrer" className="underline text-center break-words overflow-hidden overflow-ellipsis line-clamp-3">
                            {link}
                        </a>
                    </div>
                ))
            case "source":
                return media.content.sources?.map((src: any, i: number) => (
                        <div
                            key={`${idx}-${i}`}
                            className="p-2 text-sm break-words w-full h-60 border bg-gray-200/10 border-gray-100 dark:bg-black/30 dark:border-gray-800 justify-center items-center flex flex-col overflow-hidden"
                        >
                            {src.image ? (
                                <img
                                    src={src.image}
                                    alt="source"
                                    className="w-full h-32 object-cover rounded mb-2"
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            ) : (
                                <Link size={25} className="text-gray-400 dark:text-gray-500 mb-2" />
                            )}
                            
                            <a
                                href={src.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold underline text-center break-words max-w-full overflow-hidden overflow-ellipsis line-clamp-2"
                            >
                                {src.title || src.link}
                            </a>

                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{src.site_name}</p>
                        </div>

                ))
            case "file":
                const { metadata } = media.content.file_data
                return (
                    <div key={idx} className="p-3 dark:bg-black/30 dark:border-gray-800 border bg-gray-200/10 border-gray-100">
                        <div className="text-sm font-medium">{metadata.file_name}.{metadata.extension}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">.{metadata.extension.toUpperCase()} file</div>
                    </div>
                )
            default:
                return renderPlaceholder(<FileText />, `Unsupported media type: ${media.type}`)
        }
    }

    function handle_jump(chat_id: number, message_id: number): void {
        const target_chat = chatList.find((item) => item.id == chat_id)
        if (target_chat) {
            updateActiveChat(target_chat)
            router.push(`/#msg-${message_id}`)
        }
    }

    return (
        <div className={`h-screen w-full flex flex-col bg-white text-gray-900 dark:bg-black dark:text-white`}>
            <PageHeaders title="Archive" have_border={false} />

            <div className="flex-1 flex flex-col overflow-y-auto">
                <TabNavigation
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isDark={isDark}
                />

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {mediaBlocks.length === 0 && (
                        <div className="col-span-full h-64 flex items-center justify-center">
                            {renderPlaceholder(<BrushCleaning />, "No media found for this tab.")}
                        </div>
                    )}
                    {mediaBlocks.map((item, index) => {
                        return <div
                            className=""
                            onClick={() => handle_jump(item.chat_id, item.message_id)}
                            key={index}>
                                {renderMediaBlock({type:item.type, content:item.content}, index)}
                            </div>
                        })}
                </div>
            </div>
        </div>
    )
}
