import { getStorage, setStorage } from "./utils";

export type TabDataValue = { originUrl?: string; lastActivityAt?: number };

const tabData: Record<string, TabDataValue> = {};

export const initTabData = async () => {
  const storedData = await getStorage("tabOrigins");
  Object.assign(tabData, storedData.tabOrigins || {});
  console.log("Loaded persisted tab origins:", tabData);
};

export const updateTabData = async (tabId: string, data: TabDataValue) => {
  tabData[tabId] = { ...(tabData[tabId] || {}), ...data };
  await setStorage({ tabOrigins: tabData });
};

export const getTabData = (tabId: string) => tabData[tabId];

export const deleteTabData = async (tabId: string) => {
  delete tabData[tabId];
  await setStorage({ tabOrigins: tabData });
};

export const getTabOriginUrls = () =>
  Object.entries(tabData)
    .map(([key, value]) => [key, value.originUrl])
    .filter(([_key, value]) => !!value);
export const getTabOriginIds = () =>
  Object.entries(tabData)
    .map(([key, data]) => {
      if (data.originUrl) {
        return key;
      }
      return null;
    })
    .filter((item) => !!item);
