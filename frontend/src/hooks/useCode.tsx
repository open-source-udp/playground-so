import { create } from "zustand";

interface CodeStore {
  code: { [filename: string]: string };
  setCode: (filename: string, newCode: string) => void;
  addFile: (filename: string, content?: string) => void;
  removeFile: (filename: string) => void;
}

const useCode = create<CodeStore>((set) => ({
  code: { "main.cpp": "// Código principal" },
  setCode: (filename, newCode) => {
    set((state) => ({ code: { ...state.code, [filename]: newCode } }));
  },
  addFile: (filename, content = "") => {
    set((state) => ({ code: { ...state.code, [filename]: content } }));
  },
  removeFile: (filename) => {
    if (filename === "main.cpp") return;
    set((state) => {
      const newCode = { ...state.code };
      delete newCode[filename];
      return { code: newCode };
    });
  },
}));

export default useCode;
