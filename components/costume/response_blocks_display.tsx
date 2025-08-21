'use client'
import { useEffect, useState } from "react";
import { Clipboard, ClipboardCheck } from "lucide-react";
import { useTheme } from "next-themes";;
import 'react-syntax-highlighter/dist/esm/languages/prism/python';
import { CodeBlock } from "./code_block";
import YouTubeVideoCard from "./youtoub_vid";
import BrokenVideoWidget from "./broken_video_widget";
import { DynamicTable } from "./table_generator";
import ListGenerator from "./list_generator";
import ChartBlock from "./chart_generator";
import LinkBlock from "@/components/costume/link_block_hook";
import ImagesGroup from "./images_group";
import FileViewer from "./file_viewer";
import SourcesDisplay from "./sources_display";
import ErrorMessageBlock from "./error_mesage_block";
import MarkdownText from "./mark_down";
import ThinkingHolder from "@/app/chat/components/thinking_holder";
import jsonToLabeledText from "@/utils/json_display";


export default function InputDisplay({ input }: { input: string }) { 
    //* manage the input shape state
    const [messageParts, setMessageParts] = useState<{ type: string; content: string; meta?: { type: string, lang: string} }[]>([]);
    const [copied, setCopied] = useState(false);


    //* Extract blocks from input and set state
    const get_message_content_and_metadata = (input: string) => {
        const blockRegex = /\[BLOCK:(.*?)\]([\s\S]*?)\[\/BLOCK\]/g;

        const tokens: {
            type: string; content: string;
            meta?: { type: string, lang: string},
        }[] = [];
        let lastIndex = 0;
        let match;

        while ((match = blockRegex.exec(input)) !== null) {
            const [fullMatch, metaRaw, blockContent] = match;

            // Add plain text before this block
            if (match.index > lastIndex) {
                const text = input.slice(lastIndex, match.index);
                tokens.push({ type: 'message', content: text.trim() });
            }

            // Parse the block
            try {
                const meta = JSON.parse(metaRaw);
                tokens.push({
                    type: meta.type,
                    content: blockContent.trim(),
                    meta,
                });
            } catch {
                tokens.push({ type: 'message', content: fullMatch }); // fallback
            }

            lastIndex = blockRegex.lastIndex;
        }

        // Add any remaining text after the last block
        if (lastIndex < input.length) {
            const text = input.slice(lastIndex);
            tokens.push({ type: 'message', content: text.trim() });
        }

        // Set the state with the parsed tokens
        setMessageParts(tokens);
    }

    //* Set initial blocks from input
    useEffect(() => {
        get_message_content_and_metadata(input);
    }, [input])
    




    //* widgets
    const MessageBlock = ({ content, item_key }: { content: string, item_key: string }) => (
        <MarkdownText  content={content} key={item_key} />
    )


    //* Other block component
    const ParentCodeBlock = ({ content, meta, item_key }: { content: string; meta: any, item_key: string }) => {
        return (
            <div className="px-4 pb-4 m-2 bg-gray-50 rounded-md w-[95vh]" key={item_key}>
                {/* section bar */}
                <div className="flex items-center justify-between mb-2 border-b ">
                    <h3 className="text-sm">{meta.lang}</h3>
                    {/* action button */}
                    <div>
                        <button
                            className="p-1 rounded-md hover:bg-gray-200 transition-colors pt-2"
                            onClick={() => {
                            navigator.clipboard.writeText(content);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}>
                            {
                                copied ? <ClipboardCheck className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />
                            }
                        </button>
                    </div>
                </div>
                {meta.type === "code" ? <div>
                    <CodeBlock code={content} language={meta.lang} />
            </div> : content}
        </div>
        )
    }
    



    //* Render the blocks
    return ( 
        <div className="w-full">
            {messageParts.map((part, index) => {
                try {
                    switch (part.type) {
                        //? Display message content
                        case 'message':
                        case 'paragraph':
                            return  <MessageBlock content={part.content} item_key={part.content.length + part.type + index} key={part.content.length + part.type + index} /> ;                
                        
                        //? Display code block
                        case 'code':
                            return  <ParentCodeBlock content={part.content} meta={part.meta} item_key={part.content.length + part.type + index} key={index} />;                
                        
                        //? Display youtube video
                        case 'youtube_video':
                            const video_metadata = JSON.parse(part.content);
                            //* check if the video metadata is available or show brocken video card
                            if (!video_metadata|| !video_metadata.videoId || !video_metadata.title || !video_metadata.thumbnailUrl) { 
                                return <BrokenVideoWidget key={part.content.length + part.type + index}/>
                            } else {
                                return <YouTubeVideoCard key={part.content.length + part.type + index}
                                    videoId={video_metadata.videoId!} title={video_metadata.title!} thumbnailUrl={video_metadata.thumbnailUrl!} />;                
                            }
                        
                        //? Display Table Data
                        case 'table':
                            //* get table data from content
                            const table_metadata = JSON.parse( part.content);
                            const headers = table_metadata.headers || [];
                            const rows = table_metadata.rows || [];
                            return <DynamicTable headers={headers} rows={rows} key={ index} />
                        
                        //? Display List
                        case 'list':
                            const list_metadata = JSON.parse(part.content);
                            const list_title = list_metadata.title || "List";
                            const list_content = list_metadata.items || [];
                            return <ListGenerator list_title={list_title} list_content={list_content} key={part.content.length + part.type + index} />
                        
                        //? Display chart
                        case 'chart':
                            const content = JSON.parse(part.content)
                            const properties = content.properties
                            const labels = content.labels
                            const data_set = content.datasets
                            return <ChartBlock type={properties.chartType} title={properties.title} data={{ datasets: data_set, labels: labels }} key={index} />
                        
                        //? in case of urls
                        case 'links':
                            return <LinkBlock key={part.content.length + part.type + index} content={part.content} />;
                        
                        //? in case of images
                        case "images":
                            const images = JSON.parse(part.content)
                            const images_list = images.images
                            return <ImagesGroup images={images_list} key={index} />
                        
                        //? create file 
                        case "file":
                            const file_content = JSON.parse(part.content)
                            return <FileViewer data={file_content} key={index} />
                        
                        //? webs sources 
                        case "source":
                            const web_page_metadata = JSON.parse(part.content)
                            return <SourcesDisplay sources={web_page_metadata.sources} key={index} />
                        //? handle title
                        case "title":
                            return;
                        case "thinking":
                            return <ThinkingHolder thinking_content={part.content} key={index} />;
                        default:
                            return <div className="max-w-4/5 py-2" key={index}>
                                <MessageBlock content={jsonToLabeledText(JSON.parse(part.content))} item_key={part.content.length + part.type + index} key={index} />
                            </div>
                        // <ErrorMessageBlock
                        //         error_name={"Unsupported Response Type"}
                        //         key={index}
                        //     error_message={"The Response is in unsupported formate"} />
                    }
                } catch (error) {
                    const error_instance = error as Error
                    return <ErrorMessageBlock
                        error_name={error_instance.name}
                        key={index}
                        error_message={error_instance.message} />
                }
            })}
        </div>
    )
}