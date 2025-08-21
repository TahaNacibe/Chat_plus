import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { Moon, Sun } from "lucide-react";
import { SwitchField, FormField } from "../components/costume_form_field";
import Section from "../components/costume_section";
import { SettingsData } from "../types";
import { useTheme } from "next-themes";

interface GeneralTabInterface  {
    settings: SettingsData,
    handleSettingsUpdate: (field: keyof SettingsData, value: any) => void,
}



export default function GeneralTab({ settings, handleSettingsUpdate }: GeneralTabInterface) {
    
    const {theme, setTheme} = useTheme()
    return (
            <Section title="General Settings">
            <div className="space-y-4">
                <SwitchField
                    label="Dark Mode"
                    description="Toggle dark/light theme"
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => {
                        handleSettingsUpdate('darkMode', checked)
                        setTheme(checked? "light":"dark")
                    }}
                    icon={settings.darkMode ? Moon : Sun}
                />

                <SwitchField
                    label="Auto Save"
                    description="Automatically save changes"
                    checked={settings.autoSave}
                    onCheckedChange={(checked) => handleSettingsUpdate('autoSave', checked)}
                />

                <SwitchField
                    label="Notifications"
                    description="Enable system notifications"
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingsUpdate('notifications', checked)}
                />
                </div>

                <div className='px-2'>
                <FormField 
                label="Language" 
                htmlFor="language"
                hint="Select your preferred language for the interface and AI responses."
                >
                <Select value={settings.language} onValueChange={(value) => handleSettingsUpdate('language', value)}>
                    <SelectTrigger className="border-1 border-gray-300 dark:border-gray-100 dark:text-white">
                    <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                </Select>
                </FormField>
                </div>
            </Section>
        );
}