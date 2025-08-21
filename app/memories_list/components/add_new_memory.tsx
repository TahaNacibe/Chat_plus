import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { create_memory_manually } from "@/services/API/memories_services";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";

export const AddMemoryDialog = ({ onAdd }: { onAdd: (memory: Memory) => void }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [memoryContent, setMemoryContent] = useState('');
  const [memoryWeight, setMemoryWeight] = useState(5);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!memoryContent.trim()) return;

    try {
      setIsCreating(true);
      const result = await create_memory_manually({
        memory_content: memoryContent.trim(),
        memory_weight: memoryWeight
      });
      
        if (result.success) {
        console.log("passing data" + JSON.stringify(result.data))
        onAdd(result.data[0]);
        setMemoryContent('');
        setMemoryWeight(5);
        setIsAddDialogOpen(false);
      } else {
        console.error('Failed to create memory:', result.data);
      }
    } catch (error) {
      console.error('Error creating memory:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setMemoryContent('');
    setMemoryWeight(5);
    setIsAddDialogOpen(false);
  };

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Memory
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Memory</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="add-content" className="text-sm font-medium text-gray-700">
              Content *
            </Label>
            <Textarea
              id="add-content"
              value={memoryContent}
              onChange={(e) => setMemoryContent(e.target.value)}
              className="mt-2 min-h-32"
              placeholder="Enter memory content..."
            />
          </div>
          <div>
            <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
              Weight (1-10)
            </Label>
            <Input
              id="weight"
              type="number"
              min="1"
              max="10"
              value={memoryWeight}
              onChange={(e) => setMemoryWeight(Number(e.target.value))}
              className="mt-2"
              placeholder="Memory importance weight"
            />
            <p className="text-xs text-gray-500 mt-1">Higher weight means more important memory</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !memoryContent.trim()}
            >
              {isCreating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Add Memory
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};