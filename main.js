follow = function (word) {
    var query = word.selectionText;
    chrome.tabs.create({ url: "https://www.google.com/search?q=follow: " + query });
};

chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create({
        id: "1",
        title: "Follow-Up to: \"%s\"",
        contexts: ["selection"],  // ContextType
    });
    chrome.contextMenus.create({
        id: "2",
        title: "Reply to: \"%s\"",
        contexts: ["selection"],  // ContextType
   
    });
})

chrome.contextMenus.onClicked.addListener(follow);