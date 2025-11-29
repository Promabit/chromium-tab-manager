declare const chrome: any;

export type ArchivedTab = {
  id: string;
  title: string;
  url: string;
  favIconUrl: string;
  archivedAt: number;
};

const moveToLast = (arr: any[], index: number) => {
  if (index >= 0 && index < arr.length) {
    arr.push(...arr.splice(index, 1));
  }
  return arr;
};

export const archiveTab = async (tab: any) => {
  const archivedTab: ArchivedTab = {
    id: tab.id,
    title: tab.title || "Untitled",
    url: tab.url,
    favIconUrl: tab.favIconUrl || "",
    archivedAt: Date.now(),
  };

  chrome.storage.local.get(["archivedTabs"], (result: any) => {
    let archivedTabs: ArchivedTab[] = result.archivedTabs || [];
    const foundAtIndex = archivedTabs.findIndex(
      (archivedTab) => archivedTab.title === tab.title, // TODO: should check url too
    );

    if (foundAtIndex > -1) {
      archivedTabs = moveToLast(archivedTabs, foundAtIndex);
    } else {
      archivedTabs.push(archivedTab);
    }

    chrome.storage.local.set({ archivedTabs }, () => {
      console.log(`Archived tab: ${tab.title}`);
    });
  });
};
