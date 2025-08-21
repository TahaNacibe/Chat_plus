import { SidebarTrigger } from "../ui/sidebar";


export default function PageHeaders({title, have_border=true}:{title:string, have_border?:boolean}) {
    return (
        <div className={`overflow-hidden ${have_border? "border-b border-gray-100 dark:border-gray-800 text-black dark:text-white bg-white dark:bg-black" : ""}`}>
            <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4 z-50">
                <SidebarTrigger style={{ pointerEvents: "auto", WebkitAppRegion: "no-drag" } as React.CSSProperties as any}/>
                <h1 className="text-base font-medium">{title}</h1>
            </div>
            </div>
        </div>
    )
}