import { getTabOriginIds } from "../utils/tabData";

declare const chrome: any;

export const onTabUpdated = (tabId: number, changeInfo: any, tab: any) => {
  if (
    tab.openerTabId || // opening a tab with middle click
    (changeInfo.groupId &&
      Number(changeInfo.groupId) > -1 &&
      !getTabOriginIds().find((id) => Number(id) === tabId))
  ) {
    console.log("now we should kick out the tab from group", {
      changeInfo,
      tab,
    });
    chrome.tabs.ungroup(tab.id);
  }
};
