// Extended ProfileData interface
export interface ExtendedProfileData {
    profilePicture: string | null;
    username: string;
    aboutMe: string;
    responseStyle: string;
    additionalInfo: string;
    behaviorPrompt: string;
    rules: string;
    personality: string;
    setProfileData: (data: Partial<ExtendedProfileData>) => void;
}


// Model interface
export interface HuggingFaceModel {
    id: string;
    name: string;
    description: string;
    size: string;
    requirements: string;
}


export type TabType = "profile" | "behavior" | "general" | "api" | "models" | "data";


export interface ExtendedProfileData {
  profilePicture: string | null;
  username: string;
  aboutMe: string;
  responseStyle: string;
  additionalInfo: string;
  behaviorPrompt: string;
  rules: string;
  personality: string;
  setProfileData: (data: Partial<ExtendedProfileData>) => void;
}


export interface SettingsData {
  darkMode: boolean;
  openaiApiKey: string;
  openaiApiModel: string;
  geminiApiKey: string;
  geminiApiModel: string;
  selectedModel: string;
  modelPath: string;
  modelType: string;
  modelEndPoint: string;
  modelName: string;
  apiType: string;
  maxTokens: number;
  temperature: number;
  contextLength: number;
  gpuLayers: number;
  autoSave: boolean;
  notifications: boolean;
  language: string;
  theme: string;
}

export type ragFile = {
    id: number,
    filename: string,
    extension: string,
    title: string,
    chat_id: number,
    tags: string
}