"use client"
import { exportFilesPath, get_profile_image} from "@/services/API/profile_services";
import { useProfileAndSettings } from "@/context/profile_context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MessagesScreen from "@/app/chat/messages_screen";


export default function Home() {
  //? state
  const router = useRouter();
  const { updateProfile, updateSettings } = useProfileAndSettings();

  //? update profile data
  const handleCheckProfile = async () => {
    const userDataPath = await (window as ElectronWindow).electronAPI!.getUserDataPath();
    console.log(userDataPath)
    const res = await exportFilesPath(userDataPath);
    console.log(JSON.stringify(res))
    if (res && res.username) {
      const base64 = await load_image();
      // updating the profile and settings data state
      updateProfile({
        profilePicture: base64 || '',
        username: res.username || '',
        aboutMe: res.aboutMe || '',
        additionalInfo: res.additionalInfo || '',
        responseStyle: res.responseStyle || 'detailed',
        behaviorPrompt: res.behaviorPrompt || "",
        rules: res.rules || "",
        personality: res.personality || "",
      });

      updateSettings({
        darkMode: res.darkMode || false,
        openaiApiKey: res.openaiApiKey || "",
        geminiApiKey: res.geminiApiKey || "",
        selectedModel: res.selectedModel || null,
        modelPath: res.modelPath || "",
        autoSave: res.autoSave || false,
        notifications: res.notifications || false,
        language: res.language || "eng",
        theme: res.theme || "light",
      })
    } else {
      // throw error or handle the case where profile data is not available
      router.push('/onBoard');
    }
  }
  
  const load_image = async () => {
    const base64 = await get_profile_image()
      return base64;
  }

  //? useEffect to check profile state on component mount
  useEffect(() => {
    handleCheckProfile();
  }, [])

  //? UI 
  return (    
      <MessagesScreen />
  );
}