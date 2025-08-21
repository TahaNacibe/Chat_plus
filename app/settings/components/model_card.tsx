import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type ModelType = {
  id: string;
  name: string;
  description: string;
  size: string;
  requirements: string;
};

const ModelCard = ({
  model,
  onDownload
}: {
  model: ModelType;
  onDownload: (model: ModelType) => void;
}) => (
  <div className="border-b border-gray-300 p-4 space-y-3 bg-white">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-gray-900">{model.name}</h3>
        <p className="text-sm text-gray-600">{model.description}</p>
      </div>
      <Button size="sm" onClick={() => onDownload(model)} className="bg-gray-900 text-white hover:bg-gray-800">
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
    </div>
    <div className="text-xs text-gray-600">
      <p>Size: {model.size}</p>
      <p>Requirements: {model.requirements}</p>
    </div>
  </div>
);


export default ModelCard