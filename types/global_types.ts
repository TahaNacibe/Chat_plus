// Add global type for electronAPI
  interface ElectronWindow {
    electronAPI?: {
      getUserDataPath: () => Promise<string>;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
