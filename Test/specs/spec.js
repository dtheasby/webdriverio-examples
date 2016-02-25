var assert = require('assert');
var HomePage = require('../pages/homePage3.js');
var PageElements = require('../pages/pageElements.js');



describe('First Spec', function () {

    //var page;
    var home;

    before(function () {
        page = PageElements;
        home = new HomePage();
    });


    it('Ensure we can browse to Guide page', function () {
        return browser.url(home.url)
            .click(home.guideButton)
            .getUrl().should.eventually.equal(home.url + '/guide.html')
    });

    it("should be able to search", function () {
        return home.searchFor("Elements").then(function () {
            return browser.getValue(home.apiSearch).should.eventually.equal('Elements')
        });
    });

    it("should search and return the correct element", function () {
        var searchTerm = "selectByIndex";
        return home.searchFor(searchTerm).then(function () {
            return home.getSearchElements(searchTerm);
        }).then(function (isTrue) {
            isTrue.should.equal(true);
        });
    });
    
    after(function() {
        browser.end();
    })
});