import { getStorage, setStorage } from "./utils";
import { getTab, queryTabs } from "./tabs";

declare const chrome: any;

export type MRUEntry = {
  tabId: number;
  lastActivatedAt: number;
};

export type MRUHistory = MRUEntry[];

let mruHistory: MRUHistory = [];

export const initMRUHistory = async () => {
  const storedData = await getStorage("mruHistory");
  mruHistory = storedData.mruHistory || [];
  console.log("Loaded persisted MRU history:", mruHistory);
};

export const updateMRUHistory = async (tabId: number): Promise<void> => {
  mruHistory = mruHistory.filter((entry) => entry.tabId !== tabId);
  mruHistory.unshift({ tabId, lastActivatedAt: Date.now() });
  await setStorage({ mruHistory });
};

export const getMRUHistory = (): MRUHistory => {
  return [...mruHistory];
};

export const removeMRUEntry = async (tabId: number): Promise<void> => {
  mruHistory = mruHistory.filter((entry) => entry.tabId !== tabId);
  await setStorage({ mruHistory });
};

const getTabCategory = async (
  tabId: number
): Promise<"active" | "cache" | null> => {
  try {
    const tab = await getTab(tabId);
    if (tab.groupId === -1) return null;

    const group = await chrome.tabGroups.get(tab.groupId);
    if (group.title === "Active") return "active";
    if (group.title === "Cache") return "cache";
    return null;
  } catch {
    return null;
  }
};

export const getMRUSwitchableTabs = async (): Promise<chrome.tabs.Tab[]> => {
  const allTabs = await queryTabs({});

  const switchableTabsSet = new Set<number>();
  const switchableTabs: chrome.tabs.Tab[] = [];

  for (const entry of mruHistory) {
    try {
      const tab = await getTab(entry.tabId);
      const category = await getTabCategory(entry.tabId);

      if (category !== "cache") {
        switchableTabs.push(tab);
        switchableTabsSet.add(tab.id!);
      }
    } catch {
      continue;
    }
  }

  for (const tab of allTabs) {
    if (switchableTabsSet.has(tab.id!)) continue;

    const category = await getTabCategory(tab.id!);
    if (category !== "cache") {
      switchableTabs.push(tab);
    }
  }

  return switchableTabs;
};
