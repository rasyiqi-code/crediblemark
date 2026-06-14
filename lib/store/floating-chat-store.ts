import { create } from 'zustand';

interface FloatingChatStore {
    isOpen: boolean;
    isMenuOpen: boolean;
    mode: 'ai' | 'human_onboarding' | 'human_chat';
    defaultInput?: string;
    openChat: (mode?: 'ai' | 'human_onboarding' | 'human_chat', defaultInput?: string) => void;
    closeChat: () => void;
    toggleChat: () => void;
    setIsMenuOpen: (open: boolean) => void;
    setDefaultInput: (text?: string) => void;
}

export const useFloatingChat = create<FloatingChatStore>((set) => {
    // OPTIMASI H6: Definisikan aksi sekali saat inisialisasi agar referensi fungsi tetap stabil secara permanen
    const actions = {
        openChat: (mode: 'ai' | 'human_onboarding' | 'human_chat' = 'ai', defaultInput?: string) => 
            set((state) => ({ 
                isOpen: true, 
                mode, 
                isMenuOpen: false,
                defaultInput: defaultInput !== undefined ? defaultInput : state.defaultInput 
            })),
        closeChat: () => 
            set({ isOpen: false, isMenuOpen: false }),
        toggleChat: () => 
            set((state) => ({ isOpen: !state.isOpen, isMenuOpen: false })),
        setIsMenuOpen: (open: boolean) => 
            set({ isMenuOpen: open, isOpen: false }),
        setDefaultInput: (text?: string) =>
            set({ defaultInput: text }),
    };

    return {
        isOpen: false,
        isMenuOpen: false,
        mode: 'ai',
        defaultInput: '',
        ...actions,
    };
});
