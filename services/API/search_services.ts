

async function searchForMessage(query:string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/search?query=${query}`, {
            method: "GET"
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {"success":true, "data":data.message}; 
        }
        return data;
    } catch (error) {
        console.error('failed to fetch any items in messages search:', error);
        return {"success":false, "data":error};
    }
}


async function searchForChat(query:string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/search?query=${query}`, {
            method: "GET"
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {"success":true, "data":data.message}; 
        }
        return data;
    } catch (error) {
        console.error('failed to fetch any items in chats search:', error);
        return {"success":false, "data":error};
    }
}

export {
    searchForChat,
    searchForMessage
}