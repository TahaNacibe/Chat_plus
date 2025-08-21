'use client';

import { useEffect, useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ClipboardCopy, Tags, Lightbulb, LucideIcon } from "lucide-react";
import InputDisplay from './response_blocks_display';

type Props = {
  text: string;
  onSelect?: (text: string) => void;
  onTag?: (text: string, full_message: string) => void;
  onExplain?: (text: string, full_message: string) => void;
};

type PopoverAction = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
};

// Reusable PopoverButton component
const PopoverButton = ({ label, icon: Icon, onClick }: PopoverAction) => (
  <Button
    variant="ghost"
    className="justify-start gap-2 text-sm text-black dark:text-white dark:bg-black rounded-lg hover:bg-gray-100/20"
    onClick={onClick}
  >
    <Icon className="w-4 h-4" /> {label}
  </Button>
);

export default function SelectableText({ text, onSelect, onTag, onExplain }: Props) {
  const [selectedText, setSelectedText] = useState('');
  const [open, setOpen] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const closePopover = () => {
    setOpen(false);
    // Clear the selection when closing popover
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      return;
    }

    const range = selection.getRangeAt(0);

    // Only trigger popover if selection is inside this component
    const anchorNode = selection.anchorNode;
    if (!containerRef.current?.contains(anchorNode)) {
      return;
    }

    const rect = range.getBoundingClientRect();
    
    // Position the anchor at the center-top of the selection
    setAnchorPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });

    const selected = selection.toString().trim();
    setSelectedText(selected);
    setOpen(true);
    onSelect?.(selected);
  };

  // Memoized actions array to avoid recreation on every render
  const actions: PopoverAction[] = [
    {
      label: 'Copy',
      icon: ClipboardCopy,
      onClick: () => {
        navigator.clipboard.writeText(selectedText);
        closePopover();
      }
    },
    {
      label: 'Tag',
      icon: Tags,
      onClick: () => {
        onTag?.(selectedText, text);
        closePopover();
      }
    },
    {
      label: 'Explain',
      icon: Lightbulb,
      onClick: () => {
        onExplain?.(selectedText, text);
        closePopover();
      }
    }
  ];

  // Effect for handling mouse up events only on this container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      container.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Effect for handling clicks outside when popover is open
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Don't close if clicking inside the container or popover
      if (containerRef.current?.contains(target) || target.closest('[data-radix-popper-content-wrapper]')) {
        return;
      }
      
      closePopover();
    };

    // Small delay to avoid immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      <InputDisplay input={text} />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            style={{
              position: 'fixed',
              left: anchorPosition.x,
              top: anchorPosition.y,
              width: 1,
              height: 1,
              pointerEvents: 'none',
              zIndex: 9999
            }}
          />
        </PopoverTrigger>

        <PopoverContent
          side="top"
          sideOffset={10}
          align="center"
          className="rounded-lg border bg-white dark:bg-black p-0 z-50 w-30 flex flex-col gap-1"
        >
          {actions.map((action) => (
            <PopoverButton key={action.label} {...action} />
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}