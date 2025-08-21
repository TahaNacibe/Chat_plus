import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Edit2 } from "lucide-react";

export function RenameChatDialog({
  currentTitle,
  onRename,
}: {
  currentTitle: string;
  onRename: (newTitle: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(currentTitle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // prevent form from submitting
    if (!newTitle.trim()) return;
    console.log("Rename clicked:", newTitle);
    onRename(newTitle.trim());
    setOpen(false); // close dialog after rename
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div
        onClick={(e) => {
          e.preventDefault(); // prevent dropdown from closing instantly
          setOpen(true);
        }}
        className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md cursor-pointer text-black dark:text-white dark:hover:bg-gray-900 hover:bg-gray-50 hover:text-gray-700`}
          >
        <Edit2 size={16} />
        Rename
      </div>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Current title: <strong>{currentTitle}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="chat-title">New Title</Label>
              <Input
                id="chat-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter new chat name"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
