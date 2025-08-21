"use client"
import React, { useState, useEffect, JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, AlertTriangle,} from 'lucide-react';
import PageHeaders from '@/components/costume/page_headers';
import TabNavigation from './components/tab_bar';
import ProfileTab from './tabs/profile_tab';
import { ExtendedProfileData, HuggingFaceModel, SettingsData } from './types';
import BehaviorTab from './tabs/behavior_tab';
import GeneralTab from './tabs/general_tab';
import APITab from './tabs/api_tab';
import ModelsTab from './tabs/models_tab';
import DataTab from './tabs/data_tab';
import WorkInProgress from './tabs/default_tab';
import { useProfileAndSettings } from "@/context/profile_context"
import { updateProfileData } from '@/services/API/profile_services';
import { useTheme } from 'next-themes';


const SettingsPage = () => {
  // State
  const { profile, settings:saved_settings, updateProfile, updateSettings } = useProfileAndSettings();
  
  const [profileData, setProfileData] = useState<ExtendedProfileData>({
    profilePicture: profile.profilePicture,
    username: profile.username,
    aboutMe: profile.aboutMe,
    responseStyle: profile.responseStyle,
    additionalInfo: profile.additionalInfo,
    behaviorPrompt: profile.behaviorPrompt,
    rules: profile.rules,
    personality: profile.personality,
    setProfileData: (data) => setProfileData(prev => ({ ...prev, ...data }))
  });

  const [settings, setSettings] = useState<SettingsData>({
    darkMode: saved_settings.darkMode,
    openaiApiKey: saved_settings.openaiApiKey,
    openaiApiModel: saved_settings.openaiApiModel,
    geminiApiKey: saved_settings.geminiApiKey,
    geminiApiModel: saved_settings.geminiApiModel,
    selectedModel: saved_settings.selectedModel,
    modelPath: saved_settings.modelPath,
    modelType: saved_settings.modelType,
    modelEndPoint: saved_settings.modelEndPoint,
    modelName: saved_settings.modelName,
    apiType: saved_settings.apiType,
    maxTokens: saved_settings.maxTokens,
    temperature: saved_settings.temperature,
    contextLength: saved_settings.contextLength,
    gpuLayers: saved_settings.gpuLayers,
    autoSave: saved_settings.autoSave,
    notifications: saved_settings.notifications,
    language: saved_settings.language,
    theme: saved_settings.theme as "light" | "dark"
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [backupPassword, setBackupPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [memoryBackupPassword, setMemoryBackupPassword] = useState('');
  const [ragBackupPassword, setRagBackupPassword] = useState('');
  const [showMemoryPasswordInput, setShowMemoryPasswordInput] = useState(false);
  const [showRagPasswordInput, setShowRagPasswordInput] = useState(false);
  
  // Change tracking state
  const [originalProfileData, setOriginalProfileData] = useState<ExtendedProfileData>(profileData);
  const [originalSettings, setOriginalSettings] = useState<SettingsData>(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  // Check for changes
  useEffect(() => {
    const profileChanged = JSON.stringify(profileData) !== JSON.stringify(originalProfileData);
    const settingsChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    const hasChanges = profileChanged || settingsChanged;
    
    setHasUnsavedChanges(hasChanges);
    setShowSavePrompt(hasChanges);
  }, [profileData, settings, originalProfileData, originalSettings]);

  // Handlers
  const handleProfileUpdate = (field: keyof ExtendedProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsUpdate = (field: keyof SettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };


  const updateStatesFromCombinedJson = (combinedData: Record<string, any>) => {
  const profileKeys = Object.keys(profileData);
  const settingsKeys = Object.keys(settings);

  const newProfileData: Partial<ExtendedProfileData> = {};
  const newSettingsData: Partial<SettingsData> = {};

  for (const key in combinedData) {
    if (profileKeys.includes(key)) {
      newProfileData[key as keyof ExtendedProfileData] = combinedData[key];
    } else if (settingsKeys.includes(key)) {
      newSettingsData[key as keyof SettingsData] = combinedData[key];
    }
  }

  if (Object.keys(newProfileData).length > 0) {
    setProfileData(prev => ({ ...prev, ...newProfileData }));
  }

  if (Object.keys(newSettingsData).length > 0) {
    setSettings(prev => ({ ...prev, ...newSettingsData }));
  }
  };


  const handleSaveChanges = async () => {
    setOriginalProfileData({ ...profileData });
    setOriginalSettings({ ...settings });
    setHasUnsavedChanges(false);
    setShowSavePrompt(false);
    const res = await updateProfileData({ jsonData: { ...profileData, ...settings } })
    if (res.success) {
      updateStatesFromCombinedJson(res.data)
      updateProfile({ ...profileData })
      updateSettings({...settings})
    }
  };

  const handleDiscardChanges = () => {
    setProfileData({ ...originalProfileData });
    setSettings({ ...originalSettings });
    setHasUnsavedChanges(false);
    setShowSavePrompt(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleProfileUpdate('profilePicture', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackup = (type: 'general' | 'memory' | 'rag') => {
    const password = type === 'general' ? backupPassword : 
                    type === 'memory' ? memoryBackupPassword : ragBackupPassword;
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    let dataToBackup;
    let filename;
    
    switch(type) {
      case 'general':
        dataToBackup = { profile: profileData, settings: settings, timestamp: new Date().toISOString() };
        filename = `settings-backup-${new Date().toISOString().split('T')[0]}.json`;
        break;
      case 'memory':
        dataToBackup = { memory: 'memory_data_placeholder', timestamp: new Date().toISOString() };
        filename = `memory-backup-${new Date().toISOString().split('T')[0]}.json`;
        break;
      case 'rag':
        dataToBackup = { rag: 'rag_data_placeholder', timestamp: new Date().toISOString() };
        filename = `rag-backup-${new Date().toISOString().split('T')[0]}.json`;
        break;
    }
    
    const blob = new Blob([JSON.stringify(dataToBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    // Reset password inputs
    if (type === 'general') {
      setShowPasswordInput(false);
      setBackupPassword('');
    } else if (type === 'memory') {
      setShowMemoryPasswordInput(false);
      setMemoryBackupPassword('');
    } else {
      setShowRagPasswordInput(false);
      setRagBackupPassword('');
    }
    
    alert(`${type.charAt(0).toUpperCase() + type.slice(1)} backup downloaded successfully!`);
  };

  const handleLoadBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        if (backupData.profile && backupData.settings) {
          setProfileData(prev => ({ ...prev, ...backupData.profile }));
          setSettings(prev => ({ ...prev, ...backupData.settings }));
          alert('Backup loaded successfully!');
        }
      } catch (error) {
        alert('Invalid backup file format');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAllData = () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      setProfileData({
        profilePicture: null,
        username: '',
        aboutMe: '',
        responseStyle: 'neutral',
        additionalInfo: '',
        behaviorPrompt: '',
        rules: '',
        personality: '',
        setProfileData: (data) => setProfileData(prev => ({ ...prev, ...data }))
      });
      
      setSettings({
        darkMode: false,
        openaiApiKey: '',
        geminiApiKey: '',
        selectedModel: '',
        modelPath: '',
        autoSave: true,
        notifications: true,
        language: 'en',
        theme: 'dark',
        openaiApiModel: "",
        geminiApiModel: "",
        modelType: "",
        modelEndPoint: "",
        modelName: "",
        apiType: "",
        maxTokens: 0,
        temperature: 0,
        contextLength: 0,
        gpuLayers: 0,
      });
      
      alert('All data has been deleted');
    }
  };




  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab
          profileData={profileData}
          handleImageUpload={handleImageUpload}
          handleProfileUpdate={handleProfileUpdate} />

      case 'behavior':
        return <BehaviorTab
          profileData={profileData}
          handleProfileUpdate={handleProfileUpdate} />

      case 'general':
        return <GeneralTab
          settings={settings}
          handleSettingsUpdate={handleSettingsUpdate} />

      case 'api':
        return <APITab
          settings={settings}
          handleSettingsUpdate={handleSettingsUpdate} />

      case 'models':
        return <ModelsTab
          huggingFaceModels={[]}
          settings={settings}
          handleModelDownload={() => {}}
          handleSettingsUpdate={handleSettingsUpdate} />

      case 'data':
        //? okay with all what in what what is that? i didn't notice that thing growing that much
        return <DataTab
          showMemoryPasswordInput={showMemoryPasswordInput}
          setShowMemoryPasswordInput={setShowMemoryPasswordInput}
          memoryBackupPassword={memoryBackupPassword}
          setMemoryBackupPassword={setMemoryBackupPassword}
          showRagPasswordInput={showRagPasswordInput}
          setShowRagPasswordInput={setShowRagPasswordInput}
          ragBackupPassword={ragBackupPassword}
          setRagBackupPassword={setRagBackupPassword}
          showPasswordInput={showPasswordInput}
          setShowPasswordInput={setShowPasswordInput}
          backupPassword={backupPassword}
          setBackupPassword={setBackupPassword}
          handleBackup={handleBackup}
          handleLoadBackup={handleLoadBackup}
          handleDeleteAllData={handleDeleteAllData} />


      default:
        return <WorkInProgress title={activeTab} />
    }
  };

  const {theme} = useTheme()

  return (
    <div className={`mx-auto pt-2 overflow-y-hidden h-full dark:bg-black dark:text-white`}>
      <PageHeaders title="Settings" have_border={false} />

      {/* Unsaved Changes Alert */}
      {showSavePrompt && (
        <Alert className="bg-gray-100 border-gray-200 dark:bg-gray-900 dark:border-gray-700 border border-r-0 rounded-none">
          <AlertDescription className="flex items-center justify-between w-full">
            <div className='flex gap-2'>
          <AlertTriangle className="h-4 w-4 text-gray-900 dark:text-gray-200" />
            <span className="font-medium">
              You have unsaved changes. Would you like to save them?
            </span>
            </div>
            <div className="flex space-x-2 ml-4">
              <Button 
                size="sm" 
                onClick={handleSaveChanges}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button 
                size="sm" 
                onClick={handleDiscardChanges}
                className="text-black border border-gray-400 hover:text-gray-500 dark:hover:text-gray-300 dark:bg-black dark:text-white dark:border-gray-700"
              >
                Discard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-0">
        <TabNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        
        <div className="overflow-y-auto max-h-screen pb-58 pr-2">
          {renderTabContent()}
        </div>
      </div>

      {/* Save Status Indicator */}
      {hasUnsavedChanges && <div className="fixed bottom-4 right-4 mx-8">
          <div className="flex items-center space-x-2 bg-gray-100 text-gray-900 px-4 mx-2 py-2 rounded-full border border-gray-200">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Unsaved changes</span>
          </div>
      </div>}
    </div>
  );
};

export default SettingsPage;