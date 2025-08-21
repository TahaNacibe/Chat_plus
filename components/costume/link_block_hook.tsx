'use client'
import WebsiteLinkCard from "@/components/costume/link_card";
import { get_urls_metadata } from "@/services/API/urls_services";
import { Link } from "lucide-react";
import { useState, useEffect } from "react";

const LinkBlock = ({ content }: { content: string }) => {
    const [metadata, setMetadata] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const links_content = JSON.parse(content);
                const urls = links_content.links;
                const res = await get_urls_metadata(urls);

                if (res.status === "success") {
                    setMetadata(res.message);
                }
            } catch (err) {
                console.error("Failed to fetch metadata for links block", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMeta();
    }, [content]);

    if (loading) return <div className="text-sm text-muted-foreground">Loading links...</div>;

    return (
        <div className="space-y-2 mt-2 mb-2 flex gap-2 p-2">
            {metadata.map((url_item: any, index: number) =>
                url_item.error ? (
                    <div key={index} className="w-50 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex justify-center items-center text-wrap p-2">
                        <Link />
                    </div>
                ) : (
                    <WebsiteLinkCard
                        key={index}
                        url={url_item.url}
                        title={url_item.title}
                        image={url_item.image}
                    />
                )
            )}
        </div>
    );
};


export default LinkBlock