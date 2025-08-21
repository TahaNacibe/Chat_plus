import { useState } from "react"
import { motion } from "framer-motion"
import Markdown from "react-markdown"
import { BrainCircuit } from "lucide-react"

export default function ThinkingHolder({thinking_content}:{thinking_content: string}) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="my-3 pb-1">
            <div className="flex gap-2 items-center pb-1 px-2">
                <BrainCircuit size={20} />
                <p>
                    Chain Of Thoughts
            </p>
            </div>
            <motion.div
            className={`overflow-hidden text-sm text-wrap border border-gray-300 dark:border-gray-700 px-3 py-2 flex bg-gray-100/20 dark:bg-gray-800/20 flex-col rounded-lg`}
            onClick={() => setIsExpanded(!isExpanded)}
            animate={{
            height:isExpanded? "auto" : "35px"
        }}
        >
            <Markdown>
                {thinking_content}
            </Markdown>
        </motion.div>
        </div>
    )
}