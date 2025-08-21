
// Types for extracted media
type YouTubeVideo = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl?: string;
  description: string;
};

type FileData = {
  file_name: string;
  extension: string;
  content: any[]; // Adjust depending on rendering needs
};

type Source = {
  title: string;
  link: string;
  site_name: string;
  image?: string;
};

function extractBlocks(content: string) {
  const blockRegex = /\[BLOCK:({[^]+?})\]\s*([^]+?)\s*\[\/BLOCK\]/g;
  const results: { meta: any; data: string }[] = [];

  let match;
  while ((match = blockRegex.exec(content)) !== null) {
    try {
      const meta = JSON.parse(match[1]);
      const data = match[2].trim();
      results.push({ meta, data });
    } catch (err) {
      continue; // silently skip malformed blocks
    }
  }

  return results;
}

function parseMediaMessages(mediaMessages: Message[]) {
  const images: string[] = [];
  const videos: YouTubeVideo[] = [];
  const files: FileData[] = [];
  const links: string[] = [];
  const sources: Source[] = [];

  for (const msg of mediaMessages) {
    const blocks = extractBlocks(msg.content);
    for (const { meta, data } of blocks) {
      const type = meta.type;

      try {
        const json = JSON.parse(data);

        switch (type) {
          case 'images':
            if (Array.isArray(json.images)) {
              images.push(...json.images);
            }
            break;

          case 'youtube_video':
            if (json.videoId) {
              videos.push(json as YouTubeVideo);
            }
            break;

          case 'file':
            if (json.file_data?.metadata) {
              const meta = json.file_data.metadata;
              const content = json.file_data.content || [];
              files.push({
                file_name: meta.file_name,
                extension: meta.extension,
                content,
              });
            }
            break;

          case 'links':
            if (Array.isArray(json.links)) {
              links.push(...json.links);
            }
            break;

          case 'source':
            if (Array.isArray(json.sources)) {
              sources.push(...json.sources);
            }
            break;

          default:
            continue;
        }
      } catch {
        // skip malformed JSON
      }
    }
  }

  return { images, videos, files, links, sources };
}
