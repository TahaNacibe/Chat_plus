type ChatEntry = {
    id: number,
    title: string,
    is_archived: boolean,
    created_at: any,
    messages: Message[]
}

    type Message = {
    id?: number;
    chat_id:number
    role: "user" | "assistant";
    content: string;
    created_at: string;
    is_archived: boolean;
    original_message_id?: number | null
    };