import { Input } from "@/components/ui/input";
import { SheetTrigger, SheetContent, Sheet } from "@/components/ui/sheet";
import { Bot, Download, Folder, HardDrive } from "lucide-react";
import ActionButton from "../components/action_button";
import { Hint, FormField } from "../components/costume_form_field";
import Section from "../components/costume_section";
import ModelCard from "../components/model_card";
import { HuggingFaceModel, SettingsData } from "../types";
import { useState } from "react";

interface ModelTabInterface {
    huggingFaceModels: HuggingFaceModel[],
    handleModelDownload: (model: HuggingFaceModel) => void,
    settings: SettingsData,
    handleSettingsUpdate: (field: keyof SettingsData, value: any) => void,
}

// Popular publicly available local models
const POPULAR_LOCAL_MODELS = [
    {
        id: "llama-2-7b-chat-gguf",
        name: "Llama 2 7B Chat (GGUF)",
        size: "3.8GB",
        description: "Meta's conversational AI model, quantized for efficiency",
        author: "TheBloke",
        downloads: "500K+",
        type: "gguf"
    },
    {
        id: "mistral-7b-instruct-gguf", 
        name: "Mistral 7B Instruct (GGUF)",
        size: "4.1GB",
        description: "High-quality instruction following model",
        author: "TheBloke",
        downloads: "300K+",
        type: "gguf"
    },
    {
        id: "codellama-7b-instruct-gguf",
        name: "Code Llama 7B Instruct (GGUF)", 
        size: "3.9GB",
        description: "Specialized for code generation and programming",
        author: "TheBloke",
        downloads: "200K+",
        type: "gguf"
    },
    {
        id: "neural-chat-7b-gguf",
        name: "Neural Chat 7B (GGUF)",
        size: "3.8GB", 
        description: "Intel's optimized conversational model",
        author: "TheBloke",
        downloads: "150K+",
        type: "gguf"
    },
    {
        id: "openchat-3.5-7b-gguf",
        name: "OpenChat 3.5 7B (GGUF)",
        size: "4.0GB",
        description: "Fine-tuned for helpfulness and safety",
        author: "TheBloke", 
        downloads: "180K+",
        type: "gguf"
    },
    {
        id: "phi-2-gguf",
        name: "Phi-2 (GGUF)",
        size: "1.7GB",
        description: "Microsoft's compact yet powerful model",
        author: "TheBloke",
        downloads: "120K+", 
        type: "gguf"
    }
];

export default function ModelsTab({ huggingFaceModels, settings, handleSettingsUpdate, handleModelDownload }: ModelTabInterface) {
    const [downloadingModel, setDownloadingModel] = useState<string | null>(null);

    const handleLocalModelDownload = async (modelId: string) => {
        
    };

    const handleSelectModelFolder = async () => {
        try {
            // Use Electron's dialog to select a directory
            const result = await (window as any).electronAPI.selectDirectory();
            if (result && !result.canceled && result.filePaths.length > 0) {
                const folderPath = result.filePaths[0];
                handleSettingsUpdate('modelPath', folderPath);
                
                // Extract folder name for display
                const folderName = folderPath.split('/').pop() || folderPath.split('\\').pop() || folderPath;
                handleSettingsUpdate('selectedModel', folderName);
            }
        } catch (error) {
            console.error('Error selecting folder:', error);
            // Fallback: use input prompt
            const folderPath = prompt('Enter the path to your model folder:');
            if (folderPath) {
                handleSettingsUpdate('modelPath', folderPath);
                const folderName = folderPath.split('/').pop() || folderPath.split('\\').pop() || folderPath;
                handleSettingsUpdate('selectedModel', folderName);
            }
        }
    };

    return (
        <Section>
            <div className="flex items-center justify-between pb-4">
                <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-gray-900 dark:text-white" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Models</h2>
                </div>
                
                <div className="flex gap-2">
                    {/* Browse HuggingFace Models */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <ActionButton onClick={() => {}} icon={Download} label="Browse HF Models" />
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[540px] bg-white dark:bg-black p-2">
                            <Hint message={'Select and download the model after ensuring it\'s compatible with your device!'} />
                            <div className="space-y-4 mt-4">
                                {huggingFaceModels.map((model) => (
                                    <ModelCard 
                                        key={model.id} 
                                        model={model} 
                                        onDownload={handleModelDownload} 
                                    />
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Browse Popular Models */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <ActionButton onClick={() => {}} icon={HardDrive} label="Popular Models" />
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[540px] bg-white dark:bg-black p-2">
                            <div className="p-4">
                                <h3 className="text-lg font-semibold mb-2">Popular Local Models</h3>
                                <Hint message={'These are curated, high-quality models optimized for local use. GGUF format is recommended for better performance.'} />
                            </div>
                            
                            <div className="space-y-4 mt-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                                {POPULAR_LOCAL_MODELS.map((model) => (
                                    <div key={model.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 dark:text-white ">{model.name}</h4>
                                                <p className="text-sm text-gray-600  dark:text-white mt-1">{model.description}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-white">
                                                    <span>Size: {model.size}</span>
                                                    <span>Author: {model.author}</span>
                                                    <span>Downloads: {model.downloads}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleLocalModelDownload(model.id)}
                                                disabled={downloadingModel === model.id}
                                                className="ml-4 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm rounded-md flex items-center gap-2"
                                            >
                                                {downloadingModel === model.id ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Downloading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <FormField 
                htmlFor=''
                label="Selected Model"
                hint="Currently active AI model for processing requests. Download models or select an existing folder."
            >
                <div className="p-4 bg-white dark:bg-gray-900 border-1 border-gray-300 dark:border-gray-600 rounded-lg focus-visible:ring-0">
                    {settings.selectedModel ? (
                        <div className="space-y-2">
                            <p className="font-semibold text-gray-900">{settings.selectedModel}</p>
                            <p className="text-sm text-gray-600">
                                Path: {settings.modelPath}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No model selected</p>
                    )}
                </div>
            </FormField>

            <FormField 
                label="Model Storage Path" 
                htmlFor="model-path"
                hint="Directory where downloaded AI models will be stored or path to existing model folder."
            >
                <div className="flex gap-2">
                    <Input
                        id="model-path"
                        value={settings.modelPath}
                        onChange={(e) => handleSettingsUpdate('modelPath', e.target.value)}
                        placeholder="/path/to/models"
                        className="flex-1 border-1  focus-visible:ring-0"
                    />
                    <button
                        onClick={handleSelectModelFolder}
                        className="px-4 py-2 border rounded-md flex items-center gap-2"
                    >
                        <Folder className="w-4 h-4" />
                        Browse
                    </button>
                </div>
            </FormField>

            {/* Model Information */}
            {settings.modelPath && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium mb-2">Model Usage Tips</h3>
                    <div className="text-sm space-y-1 text-blue-800">
                        <p>• GGUF models (.gguf files) are optimized for local inference</p>
                        <p>• Larger models provide better quality but require more resources</p>
                        <p>• 7B models are good balance of quality and performance</p>
                        <p>• Ensure you have sufficient RAM (8GB+ recommended for 7B models)</p>
                    </div>
                </div>
            )}
        </Section>
    );
}