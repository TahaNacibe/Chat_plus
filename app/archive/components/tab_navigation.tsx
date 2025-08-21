// Tab Navigation Component
const TabNavigation = ({ activeTab, setActiveTab, archivedChats, archivedMessages, isDark }: {
    activeTab: 'chats' | 'messages',
    setActiveTab: (tab: 'chats' | 'messages') => void,
    archivedChats: ChatEntry[],
    archivedMessages: Message[],
    isDark: boolean
}) => {
    return (
        <div className={`relative border-b dark:border-gray-800 border-gray-200 mb-3`}>
            <div className="flex">
                <button
                    onClick={() => setActiveTab('chats')}
                    className={`px-6 py-4 font-medium text-sm transition-all duration-200 relative ${
                        activeTab === 'chats'
                            ?  'dark:text-white text-gray-900'
                            :  'dark:text-gray-400 dark:hover:text-gray-300 text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Archived Chats ({archivedChats.length})
                </button>
                <button
                    onClick={() => setActiveTab('messages')}
                    className={`px-6 py-4 font-medium text-sm transition-all duration-200 relative ${
                        activeTab === 'messages'
                            ? 'dark:text-white text-gray-900'
                            : 'dark:text-gray-400 dark:hover:text-gray-300 text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Archived Messages ({archivedMessages.length})
                </button>
            </div>
            {/* Active Tab Indicator */}
            <div 
                className={`absolute bottom-0 h-0.5 transition-all duration-300 ease-out dark:bg-white bg-gray-900`}
                style={{
                    left: activeTab === 'chats' ? '24px' : `${24 + (archivedChats.length.toString().length * 8) + 152}px`,
                    width: activeTab === 'chats' 
                        ? `${archivedChats.length.toString().length * 8 + 128}px` 
                        : `${archivedMessages.length.toString().length * 8 + 144}px`
                }}
            />
        </div>
    );
};


export default TabNavigation