import { onTabCreated } from "./listeners/onTabCreated";
import { onTabUpdated } from "./listeners/onTabUpdated";
import { archiveTab } from "./utils/tabArchive";
import {
  deleteTabData,
  getTabData,
  initTabData,
  updateTabData,
} from "./utils/tabData";
import { closeTab, getTab, queryTabs } from "./utils/tabs";
import { resetCloseTabGroupsTimeout, updateTabGroup } from "./utils/utils";

declare const chrome: any;
const tabsArchiveTime = 12 * 60 * 60 * 1000; // 12 hours
const thirtySeconds = 30000;

(async () => {
  await initTabData();
})();

// main logic when tab is created
chrome.tabs.onCreated.addListener(onTabCreated);

// clicking on a _blank link it should remove from group
chrome.tabs.onUpdated.addListener(onTabUpdated);

chrome.tabs.onRemoved.addListener(async (tabId: number) => {
  resetCloseTabGroupsTimeout();
  deleteTabData(String(tabId));
});

chrome.tabGroups.onUpdated.addListener(() => {
  resetCloseTabGroupsTimeout();
});

chrome.tabs.onActivated.addListener(async ({ tabId }: any) => {
  const tab = await getTab(tabId);
  // console.log("UPDATING lastActivityAt", { tab });
  await updateTabData(tabId, { lastActivityAt: Date.now() });

  if (tab.groupId) {
    await updateTabGroup(tab.groupId, {
      collapsed: true,
    });
  }
});

setInterval(async () => {
  console.log("Running periodic tab checks...");

  const activeTabs = [
    ...(await queryTabs({ active: true })),
    ...(await queryTabs({ audible: true })),
  ];

  // update tabs that are currently in use
  for (let tab of activeTabs) {
    // console.log("UPDATING lastActivityAt", { tab });
    await updateTabData(tab.id, { lastActivityAt: Date.now() });
  }

  const inactiveTabs = await queryTabs({ active: false, audible: false });

  const archiveTreshold = Date.now() - tabsArchiveTime;
  const tabsToArchive = inactiveTabs.filter((tab: any) => {
    const tabWithTabData = { ...tab, ...(getTabData(tab.id) || {}) };
    if (tabWithTabData.lastActivityAt) {
      return tabWithTabData.lastActivityAt < archiveTreshold;
    }

    return tab.lastAccessed < archiveTreshold;
  });

  for (let tab of tabsToArchive) {
    console.log("ARCHIVING", { tab });
    await closeTab(tab.id);

    // we only want to put to the archive list if it is not in a group
    if (tab.groupId === -1) {
      await archiveTab(tab);
    }
  }
}, thirtySeconds);
