import { Key } from "lucide-react";
import { FormField, PasswordInput, SelectInput } from "../components/costume_form_field";
import Section from "../components/costume_section";
import { SettingsData } from "../types";

interface GeneralTabInterface {
    settings: SettingsData,
    handleSettingsUpdate: (field: keyof SettingsData, value: any) => void,
}

const OPENAI_MODELS = [
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" }
];

const GEMINI_MODELS = [
    { value: "gemini-pro", label: "Gemini Pro" },
    { value: "gemini-pro-vision", label: "Gemini Pro Vision" },
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" }
];

export default function APITab({ settings, handleSettingsUpdate }: GeneralTabInterface) {
    return (
        <Section title="API Keys" icon={Key}>
            <FormField
                label="OpenAI API Key"
                htmlFor="openai-key"
                description="Your OpenAI API key for accessing GPT models"
                hint="Get your API key from platform.openai.com. This key will be encrypted and stored securely."
            >
                <PasswordInput
                    id="openai-key"
                    value={settings.openaiApiKey}
                    onChange={(e) => handleSettingsUpdate('openaiApiKey', e.target.value)}
                    placeholder="sk-..."
                    className="border-1 border-gray-300 focus:border-gray-700 dark:border-gray-900 dark:focus:border-gray-700 focus-visible:ring-0"
                />
            </FormField>

            <FormField
                label="OpenAI Model"
                htmlFor="openai-model"
                description="Select the OpenAI model to use"
                hint="Choose the GPT model that best fits your needs and budget."
            >
                <SelectInput
                    id="openai-model"
                    value={settings.openaiApiModel}
                    onChange={(e) => handleSettingsUpdate('openaiApiModel', e.target.value)}
                    placeholder="Select OpenAI model"
                    options={OPENAI_MODELS}
                    className="border-1 border-gray-300 focus:border-gray-700 dark:border-gray-900 dark:bg-black focus-visible:ring-0"
                />
            </FormField>

            <FormField
                label="Gemini API Key"
                htmlFor="gemini-key"
                description="Your Google Gemini API key for accessing Gemini models"
                hint="Get your API key from Google AI Studio. Required for accessing Google's Gemini models."
            >
                <PasswordInput
                    id="gemini-key"
                    value={settings.geminiApiKey}
                    onChange={(e) => handleSettingsUpdate('geminiApiKey', e.target.value)}
                    placeholder="AI..."
                    className="border-1 border-gray-300 focus:border-gray-300 dark:border-gray-900 dark:focus:border-gray-700 focus-visible:ring-0"
                />
            </FormField>

            <FormField
                label="Gemini Model"
                htmlFor="gemini-model"
                description="Select the Gemini model to use"
                hint="Choose the Gemini model that best fits your requirements."
            >
                <SelectInput
                    id="gemini-model"
                    value={settings.geminiApiModel}
                    onChange={(e) => handleSettingsUpdate('geminiApiModel', e.target.value)}
                    placeholder="Select Gemini model"
                    options={GEMINI_MODELS}
                    className="border-1 border-gray-300 focus:border-gray-700 dark:border-gray-900 dark:bg-black focus-visible:ring-0"
                />
            </FormField>
        </Section>
    );
}