const load_user_chats = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/load-all`);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {"success":true, "data":data.message}; 
        }
        return data;
    } catch (error) {
        console.error('Error fetching user chats:', error);
        return {"success":false, "data":error};
    }
}

const load_all_messages_for_chat = async (chat_id: number) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/load-all?chat_id=${chat_id}`);
        if (!response.ok) {
            throw new Error(response.statusText + chat_id);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {"success":true, "data":data.message}; 
        }
        return data;
    } catch (error) {
        console.error('Error fetching specified chat messages:', error);
        return {"success":false, "data":error};
    }
}

const sent_new_message = async ({ chat_id, user_message, use_rag, title, mode="Conversational", action, user_settings }
    : { chat_id: number, user_message: string, use_rag: boolean, title: string, mode:string, action:string | null, user_settings:string | null }) => {
    try {
        
        //? create the url for the message request
        const create_title = title.includes("New Chat")
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/model/chat/new?chat_id=${chat_id}`)
        url.searchParams.set("need_title", create_title.toString().toLowerCase())
        url.searchParams.set("useRag", use_rag.toString().toLowerCase())
        url.searchParams.set("mode", mode)
        action && url.searchParams.set('action', action) 


        //`${process.env.NEXT_PUBLIC_API_URL}/model/chat/new?chat_id=${chat_id}&need_title=${create_title}&useRag=${use_rag}&mode=${mode}&action=${action}`
        //? request 
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "user_message": user_message,
                "user_settings": user_settings
            })
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
        console.error('Error fetching specified chat messages:', error);
        return {"success":false, "data":error};
    }
}


const delete_message_entry = async ({ chat_id }: { chat_id: number }) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/delete-one?chat_id=${chat_id}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {"success":true, "data":"Deleted Completed"}; 
        }
        return data;
    } catch (error) {
        console.error('Error fetching specified chat messages:', error);
        return {"success":false, "data":error};
    }
}



const rename_chat_entry = async ({ chat_id, new_chat_name }: { chat_id: number, new_chat_name:string }) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/rename?chat_id=${chat_id}&new_name=${new_chat_name}`, {
            method: "PUT"
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {"success":true, "data":"Chat renamed"}; 
        }
        return data;
    } catch (error) {
        console.error('renaming failed:', error);
        return {"success":false, "data":error};
    }
}


const save_chat_locally = async ({ chat_id }: { chat_id: number}) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/save?chat_id=${chat_id}`, {
            method: "GET"
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {"success":true, "data":data}; 
        }
        return data;
    } catch (error) {
        console.error('failed to save file :', error);
        return {"success":false, "data":error};
    }
}


const create_new_chat = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/new`);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {"success":true, "data":data.message}; 
        }
        return data;
    } catch (error) {
        console.error('Error failed to create the chat entry', error);
        return {"success":false, "data":error};
    }
}


async function regenerate_model_response({ 
    chat_id, 
    original_user_message, 
    original_model_response, 
    mode = "Conversational", 
    use_rag = false, 
    action, 
    user_settings 
}: {
    chat_id: number,
    original_user_message: Message,
    original_model_response: Message,
    mode: string,
    use_rag: boolean,
    action: string | null,
    user_settings: string | null
}) {
    try {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/model/chat/re`);
        const searchParams = url.searchParams;
        
        searchParams.set('chat_id', chat_id.toString());
        searchParams.set('original_message_id', original_user_message.id!.toString());
        searchParams.set('original_reply_id', original_model_response.id!.toString());
        searchParams.set('use_rag', use_rag.toString());
        searchParams.set('mode', mode);
        if (action !== null) {
            searchParams.set('action', action);
        }
        
        const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "user_message": original_user_message.content,
                "model_replay": original_model_response.content,
                "user_settings": user_settings
            })
        });
        
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        
        const data = await response.json();
        if (data.status === 'success') {
            console.log(JSON.stringify(data))
            return { "success": true, "data": data.message.regenerated_assistant_message }; 
        }
        return data;
    } catch (error) {
        console.error('Error failed to regenerate the message entry', error);
        return { "success": false, "data": error };
    }
}


export {
    load_user_chats, load_all_messages_for_chat, sent_new_message, create_new_chat, delete_message_entry,
    rename_chat_entry, save_chat_locally,regenerate_model_response
}