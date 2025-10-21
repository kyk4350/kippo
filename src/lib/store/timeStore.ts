import { create } from 'zustand';

interface TimeStore {
  // 현재 시간 (타임스탬프)
  currentTime: number;
  // 시간 업데이트 함수
  updateTime: () => void;
}

export const useTimeStore = create<TimeStore>((set) => ({
  currentTime: Date.now(),
  updateTime: () => set({ currentTime: Date.now() }),
}));

// 전역 타이머 시작 (1분마다 업데이트)
if (typeof window !== 'undefined') {
  setInterval(() => {
    useTimeStore.getState().updateTime();
  }, 60000); // 60초 = 1분
}
