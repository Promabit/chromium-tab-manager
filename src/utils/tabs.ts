declare const chrome: any;

export const groupTabs = (
  tabIds: number[],
  groupId?: number,
): Promise<number> =>
  new Promise((resolve, reject) =>
    chrome.tabs.group({ tabIds, groupId }, (id: number) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve(id);
    }),
  );

export const queryTabs = (query?: any): Promise<any[]> =>
  new Promise((resolve) =>
    chrome.tabs.query({ currentWindow: true, ...(query || {}) }, (tabs: any) =>
      resolve(tabs),
    ),
  );

export const getTab = (tabId: number): Promise<any> =>
  new Promise((resolve, reject) =>
    chrome.tabs.get(tabId, (tab: any) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve(tab);
    }),
  );

export const closeTab = (tabId: number): Promise<any> =>
  chrome.tabs.remove(tabId);

