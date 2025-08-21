'use client';

import React, { useState, useEffect } from "react";
import { CornerUpRight, MessageSquare, Tag } from "lucide-react";

type Props = {
  rawData: string;
};

export const UserMessageBlock: React.FC<Props> = ({ rawData }) => {
  const [messageParts, setMessageParts] = useState<
    { type: string; content: string; meta?: { type: string; lang: string } }[]
  >([]);
  const [trailingText, setTrailingText] = useState<string>("");

  useEffect(() => {
    parseInput(rawData);
  }, [rawData]);

  // Helper function to safely parse JSON with better error handling
  const safeJsonParse = (jsonString: string) => {
    try {
      // Clean up common problematic characters
      const cleaned = jsonString
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/[\u2018\u2019]/g, "'") // Replace smart single quotes
        .replace(/[\u201C\u201D]/g, '"') // Replace smart double quotes
        .replace(/[\u2013\u2014]/g, '-') // Replace em/en dashes
        .replace(/\u00A0/g, ' ') // Replace non-breaking spaces
        .trim();
      
      return JSON.parse(cleaned);
    } catch (error) {
      console.warn('JSON parse error:', error);
      return null;
    }
  };

  const parseInput = (input: string) => {
    const blockRegex = /\[BLOCK:(.*?)\]([\s\S]*?)\[\/BLOCK\]/g;

    const tokens: {
      type: string;
      content: string;
      meta?: { type: string; lang: string };
    }[] = [];
    let lastIndex = 0;
    let match;

    while ((match = blockRegex.exec(input)) !== null) {
      const [fullMatch, metaRaw, blockContent] = match;

      // Plain text before this block
      if (match.index > lastIndex) {
        const text = input.slice(lastIndex, match.index);
        if (text.trim()) {
          tokens.push({ type: "message", content: text.trim() });
        }
      }

      // Parse block metadata with better error handling
      const meta = safeJsonParse(metaRaw);
      if (meta) {
        tokens.push({
          type: meta.type,
          content: blockContent.trim(),
          meta,
        });
      } else {
        // If meta parsing fails, treat as plain text
        tokens.push({ type: "message", content: fullMatch });
      }

      lastIndex = blockRegex.lastIndex;
    }

    // Trailing text after last block
    const trail = input.slice(lastIndex).trim();
    setTrailingText(trail);
    
    // If no blocks found, treat whole input as message
    if (tokens.length === 0 && input.trim()) {
      tokens.push({ type: "message", content: input.trim() });
      setTrailingText("");
    }

    // Safe logging of the last token
    if (tokens.length > 0) {
      const lastToken = tokens[tokens.length - 1];
      const parsed = safeJsonParse(lastToken.content);
      if (parsed) {
        console.log('Parsed last token:', parsed);
      }
    }
    
    setMessageParts(tokens);
  };

  // Render indicator with truncated specific part and ellipsis
  const renderTaggedByIndicator = (
    type: string,
    specific_part: string | null | undefined
  ) => {
    if (type.toLowerCase() === "tag" || type.toLowerCase() === "explain") {
      const label = type.toLowerCase() === "tag" ? "Tagged" : "Explained";
      return (
        <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-800/20 dark:border-gray-600 dark:text-white border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            {type.toLowerCase() === "tag" ? (
              <Tag className="w-4 h-4 text-black dark:text-white " />
            ) : (
              <CornerUpRight className="w-4 h-4 text-black dark:text-white " />
            )}
            <span className="text-sm font-semibold text-black dark:text-white  truncate max-w-xl">
              {label}: {specific_part ?? ""}...
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderContent = (content: string, type: string) => {
    if (type === "Tag" || type === "Explain") {
      const parsed = safeJsonParse(content);
      if (parsed && typeof parsed.specific_part === "string") {
        return parsed.specific_part;
      }
      // Fallback to original content if parsing fails
      return content;
    }
    return content;
  };

  // Helper function to safely extract specific_part
  const extractSpecificPart = (content: string, type: string): string | null => {
    if (type === "Tag" || type === "Explain") {
      const parsed = safeJsonParse(content);
      return parsed?.specific_part || null;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {messageParts.map((part, index) => {
        const specific_part = extractSpecificPart(part.content, part.type);

        return (
          <div key={index}>
            {/* Show indicator with truncated specific_part */}
            {renderTaggedByIndicator(part.type, specific_part)}

            {/* Render content */}
            <div className="relative group b">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-slate-500/5 to-gray-500/5 dark:from-gray-800/5 dark:via-slate-800/5 dark:to-gray-800/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-900/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-800/50 rounded-xl transition-all duration-300">
                <div className="px-3 py-2">
                  <div
                    className={`text-gray-800 dark:text-white whitespace-pre-line leading-relaxed ${
                      part.type === "message" ? "font-mono text-sm" : ""
                    }`}
                  >
                    {trailingText ? trailingText : part.content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};