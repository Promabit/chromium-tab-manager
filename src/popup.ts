declare const chrome: any;

document.addEventListener("DOMContentLoaded", async () => {
  const archiveList: HTMLElement = document.getElementById(
    "archive-list",
  ) as HTMLElement;

  chrome.storage.local.get(["archivedTabs"], (result: any) => {
    const archivedTabs = (result.archivedTabs || []).reverse();
    archiveList.innerHTML = "";

    if (archivedTabs.length === 0) {
      archiveList.innerHTML = "<li>No archived tabs.</li>";
      return;
    }

    archivedTabs.forEach((tab: any) => {
      const aTag = document.createElement("a");
      aTag.style.display = "flex";
      aTag.href = tab.url;
      aTag.target = "_blank";

      if (tab.favIconUrl) {
        const favicon = document.createElement("img");

        favicon.src = tab.favIconUrl;
        favicon.alt = "Favicon";
        favicon.style.width = "16px";
        favicon.style.height = "16px";
        favicon.style.marginRight = "10px";

        aTag.appendChild(favicon);
      }

      const title = document.createElement("span");
      title.textContent = tab.title || tab.url;

      aTag.appendChild(title);
      archiveList.appendChild(aTag);
    });
  });
});
