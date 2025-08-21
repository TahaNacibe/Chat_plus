//? check connection state
const checkConnectionHealth = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        if (error instanceof TypeError) {
            console.error('Error checking connection health:', error);
            return { status: 'error', message: error.message };
        }
        // fallback for other errors
        console.error('Unexpected error:', error);
    }
}

//? check profile state
const get_userProfile = async () => { 
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/check_userprofile`);
        if (!response.ok) {
            throw new Error(response.statusText);
        }

        // get data from response
        const data = await response.json();
        if (data.status === 'success') {
            return data.message
        }
    
        // if the status is not success, return error message
        } catch (error) {
        if (error instanceof TypeError) {
            console.error('Error fetching user profile:', error);
            return { status: 'error', message: error.message };
        }
        // fallback for other errors
        console.error('Unexpected error:', error);
    }
}


//? 
const create_userProfile = async (profileData: ProfileData) => { 
    try {
        console.log("starting again")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create_profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                    image_path: profileData.profilePicture,
                    name: profileData.username,
                    preferences: profileData.aboutMe + " || " + profileData.additionalInfo,
                    mode: profileData.responseStyle,
            }),
        });

        console.log(JSON.stringify(response))
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return await response.json();
    } catch (error) {
        if (error instanceof TypeError) {
            console.error('Error Creating user profile', error);
            return { status: 'error', message: error.message };
        }
        // fallback for other errors
        console.error('Unexpected error:', error);
    }
}

//? export files path
const exportFilesPath = async (path: string) => { 
    try {
        const resp =  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/check_userprofile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: path })
        });
        const data = await resp.json();
        if (data.status === 'success') { 
            return data.message;
        }
        return 'Failed to export files path' ;
    } catch (error) {
        return error
    }
}

const get_profile_image = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/load_profile_image`);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return data.message; // Assuming message contains the base64 image string
        }
        return data.message;
    } catch (error) {
        console.error('Error fetching profile image:', error);
        return `error : ${error}`;
    }
}


async function updateProfileData({jsonData}:{jsonData:any}) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/edit_profile`, {
                method: "PUT",
                body:JSON.stringify({new_data:jsonData})
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json();
        if (data.status === 'success') {
            return {'success':true, "data":data.message};
        }
        return data.message;
    } catch (error) {
        console.error('Error updating user profile:', error);
        return {"success":false, "data":`error : ${error}`};
    }
}


export {checkConnectionHealth, create_userProfile, get_userProfile, exportFilesPath,get_profile_image, updateProfileData}