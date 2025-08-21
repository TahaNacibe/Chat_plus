'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Extended profile data type
interface ExtendedProfileData {
  profilePicture: string | null;
  username: string;
  aboutMe: string;
  responseStyle: string;
  additionalInfo: string;
  behaviorPrompt: string;
  rules: string;
  personality: string;
}

// Settings data type
interface SettingsData {
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

// Combined context type
interface ContextType {
  profile: ExtendedProfileData;
  settings: SettingsData;
  updateProfile: (data: Partial<ExtendedProfileData>) => void;
  updateSettings: (data: Partial<SettingsData>) => void;
}

// Default context
const ProfileAndSettingsContext = createContext<ContextType | null>(null);

// Provider component
export const ProfileAndSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<ExtendedProfileData>({
    profilePicture: '',
    username: '',
    aboutMe: '',
    responseStyle: '',
    additionalInfo: '',
    behaviorPrompt: 'Be helpful and concise in your responses.',
    rules: 'Always be respectful and follow ethical guidelines.',
    personality: 'Professional yet approachable',
  });

  const [settings, setSettings] = useState<SettingsData>({
    darkMode: false,
    openaiApiKey: '',
    openaiApiModel:"",
    geminiApiKey: '',
    geminiApiModel: "",
    selectedModel: '',
    modelPath: '',
    modelType: "",
    modelEndPoint: "",
    modelName: "",
    apiType: "",
    maxTokens: 0,
    temperature: 0,
    contextLength: 0,
    gpuLayers: 0,
    autoSave: true,
    notifications: true,
    language: 'en',
    theme: 'dark',
  });

  const updateProfile = (data: Partial<ExtendedProfileData>) => {
    setProfile(prev => ({ ...prev, ...data }));
  };

  const updateSettings = (data: Partial<SettingsData>) => {
    setSettings(prev => ({ ...prev, ...data }));
  };

  return (
    <ProfileAndSettingsContext.Provider
      value={{
        profile,
        settings,
        updateProfile,
        updateSettings,
      }}
    >
      {children}
    </ProfileAndSettingsContext.Provider>
  );
};

// Hook to access context
export const useProfileAndSettings = (): ContextType => {
  const context = useContext(ProfileAndSettingsContext);
  if (!context) throw new Error('useProfileAndSettings must be used within a ProfileAndSettingsProvider');
  return context;
};
