import { Maximize, Minus, X } from "lucide-react";



export default function AppTitleBar() {
  const minimizeWindow = () => (window as ElectronWindow).electronAPI!.minimize();
  const toggleMaximize = () => (window as ElectronWindow).electronAPI!.maximize();
  const closeWindow = () => (window as ElectronWindow).electronAPI!.close();

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 h-10 text-black dark:text-white flex items-center justify-end"
      style={{pointerEvents: "none", WebkitAppRegion: 'drag' } as React.CSSProperties as any}
    >
      {/* no gap between buttons */}
      <div className="flex" style={{pointerEvents: "auto", WebkitAppRegion: 'no-drag' } as React.CSSProperties as any}>
        <button 
        onClick={minimizeWindow}
        className="w-12 h-10 flex items-center justify-center hover:bg-neutral-800/80 hover:text-white transition-all duration-200">
          <Minus size={16} />
        </button>
        <button 
        onClick={() => toggleMaximize()}
        className="w-12 h-10 flex items-center justify-center hover:bg-neutral-800/80 hover:text-white transition-all duration-200">
          <Maximize size={16} />
        </button>
        <button 
        onClick={() => closeWindow()}
        className="w-12 h-10 flex items-center justify-center hover:bg-red-600/80 hover:text-white transition-all duration-200">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
