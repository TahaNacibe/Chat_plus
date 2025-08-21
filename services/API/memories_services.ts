


async function load_all_user_memories() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memories/all`);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {"success":true, "data":data.message}; 
        }
        return data;
    } catch (error) {
        console.error('Error fetching user memories:', error);
        return {"success":false, "data":error};
    }
}
async function delete_memory_entry(memory_id:number) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memories/delete/${memory_id}`,{method:"DELETE"});
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {"success":true, "data":data.message}; 
        }
        return data;
    } catch (error) {
        console.error('Error deleting user memory:', error);
        return {"success":false, "data":error};
    }
}


async function update_memory_entry({memory_id, updated_content}:{memory_id:number, updated_content:string}) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memories/update/${memory_id}`, {
            method: 'PUT',
            body: JSON.stringify({
                "updated_content":updated_content
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
        console.error('Error updating user memory:', error);
        return {"success":false, "data":error};
    }
}


async function create_memory_manually({memory_content, memory_weight}:{memory_weight:number, memory_content:string}) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memories/add`, {
            method: 'POST',
            body: JSON.stringify({
                "memory_content": memory_content,
                "memory_weight": memory_weight
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
        console.error('Error updating user memory:', error);
        return {"success":false, "data":error};
    }
}


export {
load_all_user_memories,
delete_memory_entry,
update_memory_entry,
create_memory_manually
}