import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FileDownIcon, X } from "lucide-react"


interface FileSelectionRagInterface {
    RAGFile: File | null,
    setRAGFile: (file: File | null) => void,
    setFormData: (formdata:FormData | null) => void
    isolationState: boolean,
    handle_update_isolation: (state:boolean) => void,
}


export default function FileSelectRag({RAGFile,setRAGFile, isolationState, handle_update_isolation, setFormData}:FileSelectionRagInterface) {
    return (
        <div className='max-w-2xl mx-auto bg-white dark:bg-black border rounded-xl border-gray-200 dark:border-gray-800 px-4 py-2 my-2'>
                <div className='flex'>
                    <div className='w-full flex'>
                {/* card for the file */}
                <div className='border border-gray-200 dark:border-gray-800 rounded-sm p-2 m-1 w-fit mb-4 text-red-600'>
                    <FileDownIcon size={25} />
                </div>
                {/* details */}
                    <div className='flex flex-col pl-2'>
                    <h2 className='font-semibold'>
                        {RAGFile?.name}
                    </h2>
                    <Badge className='text-sm text-gray-700 dark:text-gray-200 dark:bg-gray-400/20'>
                        {RAGFile?.name.split(".")[1]}
                    </Badge>
                </div>
                    </div>
                    {/* close button */}
                    <button
                        onClick={() => {
                            setRAGFile(null)
                            setFormData(null)
                    }}
                        className='rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-900 h-fit'>
                        <X />
                    </button>
                </div>
            {/* switch */}
            <div className='flex justify-between items-center'>
                <Label className='text-gray-500 dark:text-gray-200 text-sm'>
                    Use This file only in this chat 'You can change that from the settings later'
                </Label>
                    <Switch className='!bg-black !dark:bg-white' checked={isolationState} onCheckedChange={handle_update_isolation}/>
            </div>
            </div>
    )
}