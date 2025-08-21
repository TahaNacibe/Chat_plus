async function loadAllMedia() {
    try {
        //? check if chat new and create it
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/load-all`);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {"success":true, "data":data.message}; 
        }
        return data;
    } catch (error) {
        console.error('Error fetching media failed:', error);
        return {"success":false, "data":error};
    }
}



export {loadAllMedia}