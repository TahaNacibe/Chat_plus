'use client'
import { Checkbox } from "@/components/ui/checkbox"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Label } from "@/components/ui/label"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { ListFilter } from "lucide-react";


export function ListItem({description, label, title, index}:{label: string, title: string, index: number, description:string}) {
    return (
        <div className="flex flex-col items-start space-x-2 py-2">
        {/* item */}
            <li className={"font-semibold"}>{label}</li>
                <dd>
                    {description}
                </dd>
        </div>
    )
}



export default function ListGenerator({ list_title, list_content }
    : { list_title: string, list_content: { title: string, description: string, completed: boolean }[] }) {

    return (
        <div className="px-2 py-4">
            {/* Tasks Title */}
                <Alert className="border border-gray-200 bg-white text-black dark:border-gray-800 dark:bg-black dark:text-white mb-2">
                <ListFilter />
                <AlertTitle>
                    {list_title}
                </AlertTitle>
            </Alert>
            {/* Tasks Items */}
            <div className="flex flex-col space-y-2 shrink-0 w-fit">
                <dl>
                    {
                    list_content.map((item, index) => (
                        <ListItem description={item.description} label={item.title} title={list_title} index={index} key={index} />
                    ))
                }
                </dl>
            </div>
        </div>
    )
    }