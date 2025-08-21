import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"


interface AlertDialogComponentInterFace {
    Trigger: any,
    title: string,
    description: string,
    confirmButtonText: string,
    onConfirmation: () => void
}


export function AlertDialogComponent({Trigger,title,description,confirmButtonText, onConfirmation}:AlertDialogComponentInterFace) {
    return (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            {Trigger}
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white text-black">
        <AlertDialogHeader>
            <AlertDialogTitle>
                    {title}
            </AlertDialogTitle>
            <AlertDialogDescription>
                    {description}
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel className="border border-gray-400 hover:bg-gray-50">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="border border-gray-400 hover:bg-gray-50"
                        onClick={(e) => {
                        onConfirmation()
                    }}>
                        {confirmButtonText}
            </AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    )
}
