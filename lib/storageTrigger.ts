// utils/storageTrigger.ts
export const triggerPageReload = (page: string) => {
  localStorage.setItem("pageReload", JSON.stringify({
    page,
    time: Date.now() // force uniqueness so event always fires
  }));
};
