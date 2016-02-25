var page = require("./pageElements.js");

var HomePage = (function () {


    return {

        searchFor: function (searchTerm) {
            return browser.url(page.url)
                .click(page.api)
                .setValue(page.apiSearch, "addValue")
                .setValue(page.apiSearch, searchTerm);
        },

        goToGuide: function () {
            return browser.click(page.guideButton).then(function () {
                console.log("guide button clicked");
            })
        },

        getSearchElements: function () {
            //return browser.elementIdElement(".commands action active", '[style="display: block;"]');
            return browser.element(page.api).then(function(element) {
                return element;
            });
        },

        getSearchElement: function () {
            return browser.element(page.api).then(function (element) {
                var elementText = "API"
                return elementText;
            });
        }
    }

    

})();

module.exports = HomePage;
