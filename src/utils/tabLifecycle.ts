import { queryTabs } from "./tabs";
import { getTabData } from "./tabData";
import {
  CACHE_THRESHOLD_MS,
  getTabCategory,
  moveTabToCache,
} from "./tabGroups";

declare const chrome: any;

const getNextMidnight = (): number => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
};

export const checkTabsForCacheTransition = async (): Promise<void> => {
  console.log("Running daily Cache transition check...");
  const allTabs = await queryTabs({});

  for (const tab of allTabs) {
    const category = await getTabCategory(tab.id);
    if (category !== "active") continue;

    const metadata = getTabData(tab.id);
    if (!metadata?.createdAt) continue;

    const age = Date.now() - metadata.createdAt;
    if (age >= CACHE_THRESHOLD_MS) {
      console.log(
        `Moving tab ${tab.id} to Cache (age: ${Math.round(age / 1000 / 60 / 60)} hours)`
      );
      await moveTabToCache(tab.id);
    }
  }
};

export const scheduleDailyCheck = async (): Promise<void> => {
  chrome.alarms.create("dailyCacheCheck", {
    when: getNextMidnight(),
    periodInMinutes: 24 * 60,
  });

  chrome.alarms.onAlarm.addListener((alarm: any) => {
    if (alarm.name === "dailyCacheCheck") {
      console.log("Daily alarm fired - checking for Cache transitions");
      checkTabsForCacheTransition();
    }
  });

  console.log("Daily Cache check scheduled for midnight");
};
