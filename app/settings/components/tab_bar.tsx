import { User, Brain, Settings, Key, Bot, Database, Info, LockOpenIcon } from "lucide-react";
import { TabType } from "../types";


interface TabNavigationProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const tabs: { key: string; label: string, icon: any }[] = [
    { key: "profile", label: "Profile", icon: User },
    { key: "behavior", label: "Behavior", icon: Brain },
    { key: "general", label: "General", icon: Settings },
    { key: "security", label: "Security", icon: LockOpenIcon },
    { key: "api", label: "API Keys", icon: Key },
    { key: "models", label: "Models", icon: Bot },
    { key: "data", label: "Data", icon: Database },
    { key: "info", label: "Info", icon: Info },
];

const TabNavigation = ({ activeTab, setActiveTab }: TabNavigationProps) => {
    return (
        <div className={`relative border-b dark:border-gray-700 border-gray-200`}>
            <div className="flex w-full justify-between">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex gap-2 justify-center items-center text-center px-4 py-4 font-medium text-sm transition-colors duration-200 ${
                            activeTab === tab.key
                                ? 'dark:text-white text-gray-900'
                                : 'dark:text-gray-400 dark:hover:text-gray-300 text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <tab.icon size={20} />
                        {tab.label}
                    </button>
                ))}
            </div>
            <div
                className={`absolute bottom-0 h-0.5 transition-all duration-300 ease-out dark:bg-white bg-gray-900`}
                style={{
                    width: `${100 / tabs.length}%`,
                    left: `${(tabs.findIndex(tab => tab.key === activeTab) * 100) / tabs.length}%`
                }}
            />
        </div>
    );
};


export default TabNavigation