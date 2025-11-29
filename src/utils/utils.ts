declare const chrome: any;

export const groupColors = [
  "grey",
  "blue",
  "red",
  "yellow",
  "green",
  "pink",
  "purple",
  "cyan",
];

const fixColors: Record<string, string> = { ICF: "blue" };

export const getStorage = (key: string): Promise<any> =>
  new Promise((resolve) => chrome.storage.local.get(key, resolve));

export const setStorage = (data: Record<string, any>): Promise<void> =>
  new Promise((resolve) => chrome.storage.local.set(data, resolve));


export const updateTabGroup = (
  groupId: number,
  properties: any,
): Promise<void> =>
  new Promise((resolve, reject) => {
    if (!groupId || groupId === -1) return resolve();

    return chrome.tabGroups.update(groupId, properties, () => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve();
    });
  });

export const queryTabGroups = (query: any): Promise<any[]> =>
  new Promise((resolve) =>
    chrome.tabGroups.query(query, (groups: any) => resolve(groups)),
  );


export const getStringColor = (str: string) => {
  if (fixColors[str]) return fixColors[str];

  const hash = [...str].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return groupColors[hash % groupColors.length];
};

export const collapseAllTabGroups = async () => {
  const matchingGroups = await queryTabGroups({});
  for (const matchingGroup of matchingGroups) {
    await updateTabGroup(matchingGroup.id, {
      collapsed: true,
    });
  }
};

let collapseAllTimeout: any = null;
export const resetCloseTabGroupsTimeout = () => {
  if (collapseAllTimeout) clearTimeout(collapseAllTimeout);
  collapseAllTimeout = setTimeout(collapseAllTabGroups, 3000);
};

