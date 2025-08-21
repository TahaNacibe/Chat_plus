import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Section from "../components/costume_section";
import { Camera, User } from "lucide-react";
import { FormField } from "../components/costume_form_field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ExtendedProfileData } from "../types";

interface ProfileTab {
    profileData: ExtendedProfileData,
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void,
    handleProfileUpdate: (field: keyof ExtendedProfileData, value: string) => void
}


export default function ProfileTab({profileData, handleImageUpload, handleProfileUpdate}:ProfileTab) {
    return (
        <Section title="Profile Information" icon={User}>
            {/* Profile Picture */}
            <div className="flex items-center space-x-6">
                <div className="relative">
                <Avatar className="h-42 w-42 border border-gray-300 dark:border-gray-100">
                    <AvatarImage src={profileData.profilePicture || ''} />
                    <AvatarFallback className="text-2xl font-bold text-gray-900 bg-white dark:bg-black dark:text-white">
                    {profileData.username.slice(0, 2).toUpperCase() || 'UN'}
                    </AvatarFallback>
                </Avatar>
                <button
                    onClick={() => document.getElementById('profile-image-upload')?.click()}
                    className="absolute -bottom-0 right-4 bg-white text-black p-2 border border-gray-200 rounded-full hover:bg-gray-100  dark:bg-black dark:text-white dark:border-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <Camera className="h-4 w-4" />
                </button>
                <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />
                </div>
                <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-2">Profile Picture</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Click the camera icon to change your profile picture</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                label="Username" 
                htmlFor="username"
                hint="This will be displayed as your identity in conversations and profiles."
                >
                <Input
                    id="username"
                    value={profileData.username}
                    className='border border-gray-300 focus:border-gray-100 dark:border-gray-900 dark:focus:border-gray-700 focus-visible:ring-0'
                    onChange={(e) => handleProfileUpdate('username', e.target.value)}
                    placeholder="Enter your username"
                />
                </FormField>

                <FormField 
                label="Response Style" 
                htmlFor="response-style"
                hint="Choose how you prefer responses to be formatted and delivered."
                >
                <Select 
                    value={profileData.responseStyle} 
                    onValueChange={(value) => handleProfileUpdate('responseStyle', value)}
                >
                    <SelectTrigger className='border border-gray-300 dark:border-gray-700'>
                    <SelectValue placeholder="Select response style" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-black">
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                </Select>
                </FormField>
            </div>

            <FormField 
                label="Personality" 
                htmlFor="personality"
                hint="Describe your personality traits and characteristics to personalize AI interactions."
                    >
                <Textarea
                id="personality"
                value={profileData.personality}
                onChange={(e) => handleProfileUpdate('personality', e.target.value)}
                placeholder="Describe your personality traits..."
                rows={3}
                className="border border-gray-300 focus:border-gray-700 dark:border-gray-800 dark:focus:border-gray-600 focus-visible:ring-0"
                />
            </FormField>

            <FormField 
                label="About Me" 
                htmlFor="about"
                hint="Share information about yourself that helps contextualize conversations."
            >
                <Textarea
                id="about"
                value={profileData.aboutMe}
                onChange={(e) => handleProfileUpdate('aboutMe', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className="border-1 border-gray-300 focus-visible:ring-0 focus:border-gray-700 dark:border-gray-800 dark:focus:border-gray-600"
                />
            </FormField>

            <FormField 
                label="Additional Information" 
                htmlFor="additional-info"
                hint="Any extra context or preferences that might be relevant for AI interactions."
            >
                <Textarea
                id="additional-info"
                value={profileData.additionalInfo}
                onChange={(e) => handleProfileUpdate('additionalInfo', e.target.value)}
                placeholder="Any additional information..."
                rows={3}
                className="border-1 border-gray-300 focus-visible:ring-0 focus:border-gray-700 dark:border-gray-800 dark:focus:border-gray-600"
                />
            </FormField>
            </Section>
        );
}