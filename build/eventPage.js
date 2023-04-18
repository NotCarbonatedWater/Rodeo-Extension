chrome.runtime.onInstalled.addListener(() => {
    // does not work in text boxes so an editable duplicated 
    // was added next
    chrome.contextMenus.create({
        id: "0",
        title: "Cold Open",
        type: "checkbox",
    });
    // duplicate that works in text boxes
    chrome.contextMenus.create({
        id: "1",
        title: "Cold Open",
        type: "checkbox",
        contexts: ["editable"],
    });
    chrome.contextMenus.create({
        id: "2",
        title: "Reply",
        contexts: ["selection"],

    });
    chrome.contextMenus.create({
        id: "3",
        title: "Follow-up",
        contexts: ["selection"],

    });
    chrome.contextMenus.create({
        id: "4",
        title: "Add to Data",
        contexts: ["selection"],

    });
}); 