import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { update_memory_entry } from "@/services/API/memories_services";
import { Edit, Loader2 } from "lucide-react";
import { useState } from "react";

export const EditMemoryDialog = ({ memory, onUpdate }: { memory: Memory; onUpdate: (id: number, content: string) => void }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedContent, setEditedContent] = useState(memory.content);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (editedContent.trim() === memory.content.trim()) {
      setIsEditDialogOpen(false);
      return;
    }

    try {
      setIsUpdating(true);
      const result = await update_memory_entry({
        memory_id: memory.id,
        updated_content: editedContent.trim()
      });
      
      if (result.success) {
        onUpdate(memory.id, editedContent.trim());
        setIsEditDialogOpen(false);
      } else {
        console.error('Failed to update memory:', result.data);
      }
    } catch (error) {
      console.error('Error updating memory:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(memory.content);
    setIsEditDialogOpen(false);
  };

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150"
          title="Edit memory"
        >
          <Edit className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Memory</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-content" className="text-sm font-medium text-gray-700">
              Content
            </Label>
            <Textarea
              id="edit-content"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="mt-2 min-h-32"
              placeholder="Enter memory content..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isUpdating || !editedContent.trim()}
            >
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
