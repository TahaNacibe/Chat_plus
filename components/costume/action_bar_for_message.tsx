'use client'
import { Clipboard, RefreshCcw, BookmarkIcon, BookmarkCheck } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"



export default function ActionBarForMessage(
    { onCopy,
    onReGenerate,
    onSave,
    saved = false
    }:
    {
    onCopy : () => void,
    onReGenerate : () => void,
    onSave: () => void,
    saved?: boolean
        }) { 
    
    //* manage the save state
    const [savedState, setSavedState] = useState(saved);
    useEffect(() => {
        setSavedState(saved);
    }, [saved]);
    


    const ButtonItem = ({action, Icon, message}:{action: () => void, Icon: any, message: string}) => {
        return (<Tooltip>
            <TooltipTrigger asChild>
                <button 
                        onClick={action}
                        className="text-sm text-gray-500 flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded-2xl">
                        <Icon size={15} /> 
                </button>
            </TooltipTrigger>
                <TooltipContent>
                <p>{message}</p>
                </TooltipContent>
                </Tooltip>)
    }

    //* action bar for message
    return <div className="mb-1 pt-2 flex">
        <ButtonItem action={onCopy} Icon={Clipboard} message={"Copy"} />
        <ButtonItem action={onReGenerate} Icon={RefreshCcw} message={"Regenerate"} />
        <ButtonItem action={onSave} Icon={savedState? BookmarkCheck : BookmarkIcon} message={"BookMark"} />
        </div>
}