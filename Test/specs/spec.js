var HomePageObject = require("../page-objects/HomePageObject.js")
var DevGuidePageObject = require("../page-objects/DevGuidePageObject.js")


describe("First Spec", function() {
    
    var home;
    var devGuide; 
    
    before(function() {
       home = new HomePageObject(); 
       devGuide = new DevGuidePageObject();
    });
    
    it("should navigate to the webdriverIO homepage", function(){
        return browser.url(home.url)
        .click(home.guideButton)
        .getUrl().then(function(url){
            console.log(url) // outputs "http://webdriver.io/guide.html"
            expect(url).to.equal(home.url + "guide.html");
        });      
    });    
    
    it("should count the number of testrunner menu subelements", function() {
        return browser.url(home.url)
            .click(home.guideButton)
            .click(devGuide.testRunnerElement)
            .element(devGuide.testRunnerDropdown)
            .then(function(elem) {
                return devGuide.getElementId(elem);
            }).then(function(id) {
                return devGuide.numberOfSubElements(id)
            }).then(function(numberOfElements) {
                console.log(numberOfElements)
                return expect(numberOfElements).to.equal(5);
            });
    });
});
