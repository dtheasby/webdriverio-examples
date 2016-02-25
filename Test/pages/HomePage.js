var page = require("./pageElements.js");

var HomePage = function (browser) {
};

HomePage.prototype.Constructor = HomePage;

HomePage.prototype.searchFor = function (searchTerm) {
    return browser.url(page.url)
        .click(page.api)
        .setValue(page.apiSearch, "addValue")
        .setValue(page.apiSearch, searchTerm);
}

HomePage.prototype.goToGuide = function () {
    return browser.click(page.guideButton).then(function () {
        console.log("guide button clicked");
    });
}

HomePage.prototype.getSearchElements = function (searchTerm) {
    return browser.elements('[style="display: block;"]').then(function (elements) {
        var doesExist = false
        
        elements.forEach(function (elem) {
            var elementText = browser.elementIdText(elem.ELEMENT);
            if (elementText === searchTerm) {
                doesExist = true;
            }
        });
        
        return doesExist;
    }).then(function(doesExist) {
        return doesExist;
    });
}


HomePage.prototype.getSearchElementText = function () {
    //return browser.elementIdElement(".commands action active", '[style="display: block;"]').then(function (elem) {
    return browser.element(page.api).then(function (elem) {
        console.log(elem);
        return browser.elementIdText(elem.value.ELEMENT);
    }).then(function (elementText) {
        console.log(elementText);
        return elementText.value;
    });
}


module.exports = HomePage;
    
  
  