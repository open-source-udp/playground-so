import { create } from "zustand";

interface CodeStore {
  code: string;
  setCode: (newCode: string) => void;
}

const useCode = create<CodeStore>((set) => ({
  code: '',
  setCode: (newCode) => set({ code: newCode }),
}));

export default useCode;
