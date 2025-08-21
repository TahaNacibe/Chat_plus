

const get_urls_metadata = async (urls: string[]) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get_url_metadata`, {
            method: "POST",
            body: JSON.stringify({
                "urls":urls
            })
        });
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const data = await response.json() as {status:string, message:any};

        return data.message;
    } catch (error) {
        console.error('Error fetching urls metadata ', error);
        return {status:"failed",message : `${error}`};
    }
}



export {get_urls_metadata}