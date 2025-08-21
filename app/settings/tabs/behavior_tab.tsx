import { Textarea } from "@/components/ui/textarea";
import { Brain, FileText, Shield } from "lucide-react";
import { FormField } from "../components/costume_form_field";
import Section from "../components/costume_section";
import { ExtendedProfileData } from "../types";


interface BehaviorTabInterface {
    profileData: ExtendedProfileData,
    handleProfileUpdate: (field: keyof ExtendedProfileData, value: string) => void
}

export default function BehaviorTab({profileData, handleProfileUpdate}:BehaviorTabInterface) {
        return (
                <Section title="AI Behavior Configuration" icon={Brain}>
                    <FormField 
                    label="Behavior Prompt" 
                    icon={FileText}
                    htmlFor=''
                    description="This prompt will guide the AI's behavior and response patterns."
                    hint="Define specific instructions for how the AI should behave, respond, and interact. This affects the AI's tone, approach, and decision-making process."
                    >
                    <Textarea
                        value={profileData.behaviorPrompt}
                        onChange={(e) => handleProfileUpdate('behaviorPrompt', e.target.value)}
                        placeholder="Define how the AI should behave and respond..."
                        rows={5}
                        className="border-1 border-gray-300 focus:border-gray-700 focus-visible:ring-0 dark:border-gray-800 dark:focus:border-gray-600"
                    />
                    </FormField>
        
                    <FormField 
                    label="Rules & Guidelines" 
                    icon={Shield}
                    htmlFor=''
                    description="Define specific rules and ethical boundaries for AI responses."
                    hint="Set clear boundaries, restrictions, and ethical guidelines that the AI must follow. Include any topics to avoid or specific behavior requirements."
                    >
                    <Textarea
                        value={profileData.rules}
                        onChange={(e) => handleProfileUpdate('rules', e.target.value)}
                        placeholder="Set specific rules and ethical guidelines..."
                        rows={5}
                        className="border-1 border-gray-300 focus:border-gray-700 focus-visible:ring-0 dark:border-gray-800 dark:focus:border-gray-600"
                    />
                    </FormField>
                </Section>
            );
}