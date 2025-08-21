// Empty State Component
const EmptyState = ({ type }: { type: 'chats' | 'messages' }) => {
    return (
        <div className="flex items-center justify-center h-64 rounded-xl bg-white border border-gray-200 dark:bg-black dark:border-none">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {type === 'chats' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        )}
                    </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-300 text-lg">No archived {type} found</p>
                <p className="text-gray-400 dark:text-gray-100 text-sm mt-1">Your archived {type === 'chats' ? 'conversations' : 'messages'} will appear here</p>
            </div>
        </div>
    );
};

export default EmptyState
