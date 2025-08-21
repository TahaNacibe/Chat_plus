    'use client';

    import { ExternalLink, Globe } from 'lucide-react';

    type WebsiteLinkCardProps = {
    url: string;
    title: string;
    description?: string;
    image?: string | null;
    };

    export default function WebsiteLinkCard({
    url,
    title,
    description,
    image,
    }: WebsiteLinkCardProps) {
    // Extract domain from URL for display
    const getDomain = (url: string) => {
        try {
        return new URL(url).hostname.replace('www.', '');
        } catch {
        return url;
        }
    };

    return (
        <div className="w-50 bg-white dark:bg-black dark:border-gray-800 border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
        >
            {/* Image/Icon Section */}
            <div className="relative bg-gray-50 dark:bg-gray-800 flex items-center justify-center h-32">
            {image ? (
                <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                    // Fallback to icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                    parent.innerHTML = `
                        <div class="flex items-center justify-center w-full h-full">
                        <div class="w-16 h-16 bg-gray-200 dark:bg-gray-400 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-gray-400 dark:text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"></path>
                            </svg>
                        </div>
                        </div>
                    `;
                    }
                }}
                />
            ) : (
                <div className="flex items-center justify-center w-full h-full">
                <div className="w-16 h-16 bg-gray-200 dark:bg-white rounded-full flex items-center justify-center">
                    <Globe className="w-8 h-8 text-gray-400" />
                </div>
                </div>
            )}
            
            {/* External Link Icon */}
            <div className="absolute top-2 right-2 bg-white dark:bg-black rounded-full p-1.5 shadow-sm">
                <ExternalLink className="w-3 h-3 text-gray-600" />
            </div>
            </div>

            {/* Content Section */}
            <div className="p-4 space-y-3">
            {/* Title */}
            <h3 className="font-medium text-base text-gray-900 dark:text-gray-200 line-clamp-2 leading-tight">
                {title}
            </h3>

            {/* Domain */}
            <p className="text-sm text-gray-600 font-mono">
                {getDomain(url)}
            </p>

            {/* Description */}
            {description && (
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                {description}
                </p>
            )}
            </div>
        </a>
        </div>
    );
    }