import { FileEdit, Film, Globe, ImageIcon, Link } from "lucide-react";
import React from "react";

type TabType = "file" | "images" | "links" | "videos" | "source";

interface TabNavigationProps {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
    isDark: boolean;
}

const tabs: { key: TabType; label: string, icon: any }[] = [
    { key: "images", label: "Images", icon: ImageIcon },
    { key: "videos", label: "Videos", icon:  Film},
    { key: "links", label: "Links", icon:  Link},
    { key: "file", label: "Files", icon:  FileEdit},
    { key: "source", label: "Source", icon:  Globe}
];

const TabNavigation = ({ activeTab, setActiveTab, isDark }: TabNavigationProps) => {
    return (
        <div className={`relative border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex w-full justify-between">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex gap-2 justify-center items-center text-center px-4 py-4 font-medium text-sm transition-colors duration-200 ${
                            activeTab === tab.key
                                ? isDark ? 'text-white' : 'text-gray-900'
                                : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <tab.icon size={20} />
                        {tab.label}
                    </button>
                ))}
            </div>
            <div
                className={`absolute bottom-0 h-0.5 transition-all duration-300 ease-out ${
                    isDark ? 'bg-white' : 'bg-gray-900'
                }`}
                style={{
                    width: `${100 / tabs.length}%`,
                    left: `${(tabs.findIndex(tab => tab.key === activeTab) * 100) / tabs.length}%`
                }}
            />
        </div>
    );
};


export default TabNavigation;
