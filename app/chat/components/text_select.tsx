import { CornerUpRight, X } from "lucide-react"


interface TextSelectorMarkerInterface {
    selected_text: string,
    onRemove: () => void
    action_type: "Explain" | "Tag"
}


export default function TextSelectorMarker({selected_text, onRemove, action_type}:TextSelectorMarkerInterface) {
    return (
        <div className='max-w-2xl mx-auto bg-white dark:bg-black border rounded-xl border-gray-200 dark:border-gray-800 px-4 py-2 my-2'>
                <div className='flex'>
                    <div className='w-full flex'>
                {/* card for the file */}
                <div className=' p-2 m-1 w-fit mb-4 text-black dark:text-white'>
                    <CornerUpRight size={20} />
                </div>
                {/* details */}
                    <div className='flex flex-col pl-2'>
                    <h2 className='font-semibold'>
                        {action_type}
                    </h2>
                        <h2 className="text-gray-600">
                            {selected_text.length > 120 ? selected_text.substring(0, 120) + "..." : selected_text}
                    </h2>
                </div>
                    </div>
                    {/* close button */}
                    <button
                        onClick={() => onRemove()}
                        className='rounded-full p-1 hover:bg-gray-100 h-fit'>
                        <X size={18} />
                    </button>
                </div>
            </div>
    )
}