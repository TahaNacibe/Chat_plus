//* Define the regex pattern
export default function get_chat_title(message: string) {
    const regex = /\[BLOCK:\{"type":\s*"title",\s*"lang":\s*"eng"\}\]\s*([\s\S]*?)\s*\[\/BLOCK\]/;

    const match = message.match(regex);
    const title = match ? match[1].trim() : null;

    const cleanedString = message.replace(regex, '').trim();

    console.log("Title:", title);
    console.log("Cleaned string:", cleanedString);
    return { title, cleaned_string: cleanedString };
}
