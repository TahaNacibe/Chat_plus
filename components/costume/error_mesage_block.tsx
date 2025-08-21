import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"

interface ErrorMessageBlockInterface {
    error_name:string,
    error_message:string 
}


export default function ErrorMessageBlock({ error_name, error_message }: ErrorMessageBlockInterface) {
    return (
        <div className="px-2 py-4">
            <Alert variant="destructive" className="bg-white border border-gray-200 text-red-700">
            <AlertCircleIcon />
            <AlertTitle>Unable to Display the Response.</AlertTitle>
            <AlertDescription >
                    <p className="text-red-500">Something went wrong while treating the Response "{ error_name }"</p>
                    <ul className="list-inside list-disc text-sm">
                    <li className="text-red-500">{error_message}</li>
                </ul>
            </AlertDescription>
        </Alert>
        </div>
    )
}