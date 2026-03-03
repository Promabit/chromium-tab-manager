import { getTab, groupTabs, queryTabs } from "./tabs";
import { queryTabGroups, updateTabGroup } from "./utils";
import { updateTabData } from "./tabData";

declare const chrome: any;

export const GROUP_NAMES = {
  ACTIVE: "Active",
  CACHE: "Cache",
} as const;

export const CACHE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export const getTabCategory = async (
  tabId: number
): Promise<"active" | "cache" | null> => {
  try {
    const tab = await getTab(tabId);
    if (tab.groupId === -1) return null;

    const group = await chrome.tabGroups.get(tab.groupId);
    if (group.title === GROUP_NAMES.ACTIVE) return "active";
    if (group.title === GROUP_NAMES.CACHE) return "cache";
    return null;
  } catch {
    return null;
  }
};

export const ensureCacheGroupExists = async (): Promise<number> => {
  const matchingGroups = await queryTabGroups({ title: GROUP_NAMES.CACHE });
  if (matchingGroups.length > 0) {
    return matchingGroups[0].id;
  }

  const allTabs = await queryTabs({});
  if (allTabs.length === 0) {
    throw new Error("No tabs available to create Cache group");
  }

  const tempTabId = allTabs[0].id;
  const groupId = await groupTabs([tempTabId]);
  await updateTabGroup(groupId, {
    title: GROUP_NAMES.CACHE,
    color: "grey",
    collapsed: true,
  });
  await chrome.tabs.ungroup([tempTabId]);

  return groupId;
};

export const moveTabToCache = async (tabId: number): Promise<void> => {
  const cacheGroupId = await ensureCacheGroupExists();
  await groupTabs([tabId], cacheGroupId);
  await updateTabGroup(cacheGroupId, { collapsed: true });
  console.log(`Moved tab ${tabId} to Cache group`);
};

export const moveTabToActive = async (tabId: number): Promise<void> => {
  const matchingGroups = await queryTabGroups({ title: GROUP_NAMES.ACTIVE });

  if (matchingGroups.length > 0) {
    const groupId = matchingGroups[0].id;
    await groupTabs([tabId], groupId);
    await updateTabGroup(groupId, { collapsed: true });
  } else {
    const groupId = await groupTabs([tabId]);
    await updateTabGroup(groupId, {
      title: GROUP_NAMES.ACTIVE,
      color: "blue",
      collapsed: true,
    });
  }

  await updateTabData(tabId, { createdAt: Date.now() });
  console.log(`Moved tab ${tabId} to Active group`);
};

export const isTabInCacheGroup = async (tabId: number): Promise<boolean> => {
  const category = await getTabCategory(tabId);
  return category === "cache";
};

export const findTabInCacheByUrl = async (
  url: string
): Promise<chrome.tabs.Tab | null> => {
  const allTabs = await queryTabs({});

  for (const tab of allTabs) {
    const category = await getTabCategory(tab.id);
    if (category === "cache" && tab.url === url) {
      return tab;
    }
  }

  return null;
};
