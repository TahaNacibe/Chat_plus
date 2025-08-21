

async function send_rag_candidate_to_db(formData: FormData) {
    try {
        
        //? check if chat new and create it
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rag/upload`, {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {success:true, data:"Completed"}; 
        }
        return data;
    } catch (error) {
        console.error('Error fetching specified chat messages:', error);
        return {"success":false, "data":error};
    }
}


async function load_all_files_db() {
    try {
        
        //? fetch all files metadata from the rag db
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rag/files`,);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
            return {success:true, data:data.files}; 
    } catch (error) {
        console.error('Error fetching all db files:', error);
        return {"success":false, "data":error};
    }
}


async function delete_rag_file(file_id:number) {
    try {
        //? delete a rag file
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rag/files/delete/${file_id}`, {
            method:"DELETE"
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
            return {success:true, data:"deleted"}; 
    } catch (error) {
        console.error('Error fetching all db files:', error);
        return {"success":false, "data":error};
    }
}




export {send_rag_candidate_to_db, load_all_files_db,delete_rag_file}