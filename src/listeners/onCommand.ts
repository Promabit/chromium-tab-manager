declare const chrome: any;

console.log("onCommand.ts loaded - registering command listener");

chrome.commands.onCommand.addListener((command: string) => {
  console.log("Command received:", command);
  if (command === "open-mru-switcher") {
    console.log("Opening MRU switcher popup");
    chrome.action.openPopup();
  }
});

console.log("Command listener registered successfully");
