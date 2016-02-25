var page = require("./pageElements.js");

var HomePage = (function () {
    
    var homePage = function() {};
    
    homePage.url = "http://webdriver.io";
    homePage.guideButton = "[href='/guide.html']",
    homePage.api = "[href='/api.html']",
    homePage.apiSearch = "[name='search']",
    


        homePage.searchFor = function (searchTerm) {
            return browser.url(page.url)
                .click(page.api)
                .setValue(page.apiSearch, "addValue")
                .setValue(page.apiSearch, searchTerm);
        },

        homePage.goToGuide = function () {
            return browser.click(page.guideButton).then(function () {
                console.log("guide button clicked");
            })
        },

        homePage.getSearchElements = function () {
            //return browser.elementIdElement(".commands action active", '[style="display: block;"]');
            return browser.element(page.api).then(function(element) {
                return element;
            });
        },

        homePage.getSearchElement = function () {
            return browser.element(page.api).then(function (element) {
                var elementText = "API"
                return elementText;
            });
        };
    
    return homePage;

    

})();

module.exports = HomePage;