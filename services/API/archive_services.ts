
//? load all chat's that the user archived
async function load_archived_chats() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/load-archived`);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {"success":true, "data":data.message}; 
        }
        return data;
    } catch (error) {
        console.error('Fail To load Archived Chats!', error);
        return {"success":false, "data":error};
    }
}


async function load_archived_messages() {
        try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/load-archived`);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {"success":true, "data":data.message}; 
        }
        return data;
    } catch (error) {
        console.error('Fail To load Archived Messages!', error);
        return {"success":false, "data":error};
    }
}

async function update_chat_archive_state({ chat_id, current_archive_state }: { chat_id: number, current_archive_state:boolean }){
    try {
        console.log("update state to " + Boolean(current_archive_state))
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/chat/archive`)
        url.searchParams.set("chat_id", chat_id.toString())
        {/* so basically it's because SQL don't save booleans as true false bu t1 and 0 so just treat it that way  */}
        url.searchParams.set("current_archive_state", Boolean(current_archive_state).toString().toLowerCase())
        const response = await fetch(url, {
            method: "PUT"
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        console.log(JSON.stringify(data))
        if (data.status === 'success') {
            return {"success":true, "data":"Entry Archive state updated"}; 
        }
        return data;
    } catch (error) {
        console.error('archiving failed:', error);
        return {"success":false, "data":error};
    }
}


async function update_message_archive_state({ message_id, current_archive_state }:
    { message_id: number, current_archive_state: boolean }) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/archive?current_archive_state=${current_archive_state}&message_id=${message_id}`, {
            method: "PUT"
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {"success":true, "data":"Entry Archive state updated"}; 
        }
        return data;
    } catch (error) {
        console.error('archiving failed:', error);
        return {"success":false, "data":error};
    }
}


export {
load_archived_chats,
load_archived_messages,
update_chat_archive_state,
update_message_archive_state,
}