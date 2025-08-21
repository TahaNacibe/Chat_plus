import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ExternalLink, Globe, Link } from "lucide-react"

//? Interface for the source type
interface SourcesDisplayInterface{
    sources: {
        link: string,
        title: string,
        site_name: string,
        image?:string 
    }[]
}

//? component 
export default function SourcesDisplay({ sources }: SourcesDisplayInterface) {
    return (
        <div className="flex flex-col gap-1 py-2">
            {sources.map((source, index) => (
            //ToDo: Change That when you add the go back button
            <a href={ source.link } target="_blank" rel="noopener noreferrer" key={index} className="">
            <HoverCard >
            <HoverCardTrigger asChild>
                <div className="border border-gray-300 rounded-full px-2 py-1.5 flex gap-1 max-w-1/2 items-center justify-between hover:border-gray-400 transition-colors">
                                {/* icon image */}
                    <div className="flex gap-2">
                    {source.image && source.image != ""
                        ? <img src={source.image} alt={source.site_name} className="w-4 h-4 rounded-full" />
                        : <Globe size={16} className="text-gray-500 dark:text-white" />}
                    {/* content */}
                        <p className="text-xs truncate text-gray-800 dark:text-white">{source.title}</p>
                        {/* action icon */}
                            </div>
                        <div className="flex-none w-3 h-3">
                            <Link size={12} className="text-gray-500 dark:text-white" />
                        </div>
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="p-0 border-none rounded-lg">
               {/* Hover card content */}
                <div className="bg-white overflow-hidden w-80 rounded-lg shadow-none border border-gray-200">
                {/* Header with icon and site name */}
                <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
                    <div className="flex-shrink-0">
                    {source.image && source.image !== "" ? (
                        <img 
                        src={source.image} 
                        alt={source.site_name} 
                        className="w-6 h-6 rounded object-cover"
                        />
                    ) : (
                        <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                        <Globe className="w-3 h-3 text-gray-600" />
                        </div>
                    )}
                    </div>
                    <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black truncate">
                        {source.site_name || 'Website'}
                    </p>
                    </div>
                </div>

                {/* Title content */}
                <div className="p-4">
                    <h3 className="text-sm font-medium text-black leading-snug">
                    {source.title}
                    </h3>
                </div>

                {/* Footer with URL */}
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <div className="flex items-center text-xs text-gray-600">
                    <ExternalLink className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span className="truncate font-mono">{source.link}</span>
                    </div>
                </div>
                </div>
        </HoverCardContent>
        </HoverCard>
            </a>
            ))}
        </div>
    )
}