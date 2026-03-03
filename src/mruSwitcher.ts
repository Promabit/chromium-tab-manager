import { getMRUSwitchableTabs } from "./utils/mruHistory";

declare const chrome: any;

let selectedIndex = 0;
let tabs: chrome.tabs.Tab[] = [];

document.addEventListener("DOMContentLoaded", async () => {
  await renderTabList();
  setupKeyboardNavigation();
});

async function renderTabList() {
  const tabList = document.getElementById("tab-list")!;
  tabs = await getMRUSwitchableTabs();

  if (tabs.length === 0) {
    tabList.innerHTML = '<div class="empty-state">No switchable tabs</div>';
    return;
  }

  tabList.innerHTML = tabs
    .map(
      (tab, index) => `
    <div class="tab-item ${index === 0 ? "selected" : ""}" data-index="${index}">
      <img class="tab-favicon" src="${tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'}" />
      <div class="tab-info">
        <div class="tab-title">${escapeHtml(tab.title || "Untitled")}</div>
        <div class="tab-url">${escapeHtml(tab.url || "")}</div>
      </div>
    </div>
  `
    )
    .join("");

  document.querySelectorAll(".tab-item").forEach((el) => {
    el.addEventListener("click", () => {
      const index = parseInt(el.getAttribute("data-index")!);
      switchToTab(tabs[index].id!);
    });
  });
}

function setupKeyboardNavigation() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveSelection(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveSelection(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (tabs[selectedIndex]) {
        switchToTab(tabs[selectedIndex].id!);
      }
    } else if (e.key === "Escape") {
      window.close();
    }
  });
}

function moveSelection(delta: number) {
  const items = document.querySelectorAll(".tab-item");
  if (items.length === 0) return;

  items[selectedIndex].classList.remove("selected");
  selectedIndex = (selectedIndex + delta + items.length) % items.length;
  items[selectedIndex].classList.add("selected");
  items[selectedIndex].scrollIntoView({ block: "nearest" });
}

function switchToTab(tabId: number) {
  chrome.tabs.update(tabId, { active: true }, () => {
    window.close();
  });
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
