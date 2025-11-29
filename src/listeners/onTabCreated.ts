import {
  deleteTabData,
  getTabOriginUrls,
  updateTabData,
} from "../utils/tabData";
import { closeTab, getTab, groupTabs } from "../utils/tabs";
import { getStringColor, queryTabGroups, updateTabGroup } from "../utils/utils";

declare const chrome: any;

export const onTabCreated = async (tab: any) => {
  const tabUrl = tab.pendingUrl;
  const originUrls = getTabOriginUrls();
  if (tabUrl === "chrome://newtab/") return; //skip if just "New tab"

  console.group("new tab", { tab, originUrls });

  const url = new URL(tabUrl);
  const tabGroupName = url.searchParams.get("tabManagerGroup");
  if (tabGroupName) {
    url.searchParams.delete("tabManagerGroup");
    chrome.tabs.update(tab.id, { url: url.toString() });
  }
  const matchingOrigin = originUrls.find(
    ([_key, originUrl]) => originUrl === url.toString(),
  );

  console.log({ tabGroupName, matchingOrigin });
  console.groupEnd();

  if (matchingOrigin) {
    const existingTabId = Number(matchingOrigin[0]);

    try {
      const existingTab = await getTab(existingTabId);
      if (existingTab && existingTabId !== tab.id) {
        await chrome.tabs.update(existingTabId, { active: true });
        await closeTab(tab.id);
        await updateTabGroup(existingTab.groupId, {
          collapsed: true,
        });
      }
    } catch {
      deleteTabData(String(existingTabId));
    }
  } else {
    await updateTabData(tab.id, { originUrl: url.toString() });

    if (tabGroupName) {
      const nextColor = getStringColor(tabGroupName);

      const matchingGroups = await queryTabGroups({ title: tabGroupName });
      if (matchingGroups.length > 0) {
        const groupId = matchingGroups[0].id;
        await groupTabs([tab.id], groupId);
        await updateTabGroup(groupId, {
          collapsed: true,
        });
      } else {
        const groupId = await groupTabs([tab.id]);
        await updateTabGroup(groupId, {
          title: tabGroupName,
          color: nextColor,
          collapsed: true,
        });
      }
    } else {
      if (tab.groupId) {
        console.log("skipping in theory");
        // await chrome.tabs.ungroup([details.tabId]);
      }
    }
  }
};
