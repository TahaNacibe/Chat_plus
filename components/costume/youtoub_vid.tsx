'use client';


type YouTubeVideoCardProps = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle?: string;
  description?: string;
  duration?: string;
  publishedAt?: string;
  viewCount?: string;
};

export default function YouTubeVideoCard({
  videoId,
  title,
  thumbnailUrl,
  channelTitle,
  description,
  duration,
  publishedAt,
  viewCount,
}: YouTubeVideoCardProps) {
  return (
    <div className="w-80 bg-white dark:bg-black dark:border-gray-800 dark:text-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow mx-2 my-4">
      <a
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {/* Thumbnail Section */}
        <div className="relative">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-44 object-cover"
          />
          
          {/* Duration Badge */}
          {duration && (
            <div className="absolute bottom-1 right-1 bg-black text-white text-xs px-1.5 py-0.5 rounded">
              {duration}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-3 space-y-2">
          {/* Title */}
          <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 leading-tight">
            {title}
          </h3>

          {/* Channel */}
          {channelTitle && (
            <p className="text-xs text-gray-600 dark:text-white">
              {channelTitle}
            </p>
          )}

          {/* Stats */}
          <div className="text-xs dark:text-white space-x-2">
            {viewCount && <span>{viewCount}</span>}
            {publishedAt && <span>• {publishedAt}</span>}
          </div>
        </div>
      </a>
    </div>
  );
}