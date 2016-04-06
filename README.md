# webdriverio-examples

Currently WIP


## Time to Test

The test we have at the moment is a fairly straight forward, although with the lack of any type of assertion, can we really call it a test? We can crumble any doubt by installing an assertion library, such as Chai! Chai provides three different styles(Expect, Should, and Assert), that allow us to write syntactically delicious assertions. 

We’ll be going with Expect for the moment. After installing Chai via npm, and then initialising itself and ‘Expect’ in the Before hook located in the wdio config file, we have:
     
```javascript
// “./wdio.conf.js”
…
    onPrepare: function() {
        // do something
    },
    before: function() {
      var chai = require('chai');
      expect = chai.expect;
    },
    after: function(failures, pid) {
        // do something
    },
…
```

WebdriverIO sets up the test hooks in it’s config file by default. Each hook is executed at different stages of the test’s flow:
onPrepare(): This is executed before any workers are set up, which makes it a good place to set up environmental dependencies(it’s possible to initialise selenium at this stage, for example).

* `before()`: Executed prior to any [It] blocks being run in each [Describe] block, custom global variables that apply to every spec should be defined here. 
* `beforeEach()`: Executed prior to each it() block, which makes it a good place to define any test set up. It’s good practice to ensure each test case/ [it] block runs independently, so generic set up steps such as navigating to the home-page URL and logging-In are well placed here.
* `afterEach()`: Executed after every it() block, test clean up (such as deleting cookies, logging out) should be defined here.
* `after()`: Executed at the end of each describe() block, once all [it] blocks have completed.
* `onComplete()`: As you can probably guess, this runs after all tests/specs have finished, just prior to the process exiting. Can be used to tear down your selenium server, for example.
* 
With Chai and Expect declared at the start of our describe block, we can now add the first assertion to our test:

```javascript
//”.test/specs/spec.js”
describe("First Spec", function() {
    it("should navigate to the webdriverIO homepage", function(){
        return browser.url("http://webdriver.io/")
        .click("[href='/guide.html']")
        .getUrl().then(function(url){
            console.log(url) // outputs "http://webdriver.io/guide.html"
            expect(url).to.equal("http://webdriver.io/guide.html");
        });      
    });
}) ;
```
 

Running this should present you with a passing test. Now let’s take a quick tour of what’s actually going on. 
As we’re using mocha’s BDD syntax, we’re defining our test suites and cases with `Describe` and `It` blocks, respectively.
If you have eagle eyes, you might have spotted that the first thing we do is `return` our command chain. As we’re running in an asynchronous environment, mocha needs to know when our browser commands have completed and assertions have finished. It has two ways of doing this, either via the `done()` callback, or by returning a promise. 

Every WebdriverIO command is chainable, and returns a promise, making it incredibly easy to write synchronous code to test the asynchronous browser environment. Each command in the chain is essentially queued, waiting for the promise from the previous command to resolve before executing. By returning this promise chain, mocha knows when the final promise has been resolved, and can end the test. Another advantage of using and returning promises is that can avoid the numerous call-backs and error-handling code normally associated with using `done()`, making our code simpler, and our lives easier.

Looking back at our test case:
```javascript
     return browser.url("http://webdriver.io/")
        .getUrl().then(function(url){
            console.log(url) // outputs "http://webdriver.io""
            expect(url).to.equal("http://webdriver.io/");
        });  
```

`browser` is an object representation of our selenium browser instance, and is where we direct our actions/commands. The first command we chain to it is `url(“http://www.webdriver.io”)`, sending the browser to go to the given url. The browser object is passed into `url`, and returned with a promise attached to represent this action; only once this promise is resolved will the following chained action, `Click`, execute;

`.click("[href='/guide.html']")`

Every WebdriverIO element interaction accepts a string which is used to locate the associated html element in the DOM, the string can reference the element’s ID, class, tag, or more (see http://webdriver.io/guide/usage/selectors.html). Our click command takes the browser object which has been returned from the `url` command, and the string locator we provided (`[href='/guide.html']`). It then locates this element, initiates the action, and returns the browser object with the click command’s promise attached. 
Following this, we have the `getUrl` action which follows a slightly different syntax;

`.getUrl().then(function(url){ `

`getUrl` returns a promise that eventually resolves to give the current url. However, we don’t want to run our assertion until this promise has been fulfilled, so we attach a ‘then’ function to the command, which has the following structure:

`promise.then(onFulfilled, onRejected)]`

We supply our `then` with an onFulfilled callback containing our assertion, which is executed only once our `getUrl()` promise has been positively resolved. The result of the promise is passed into the onFulfilled function, which contains our assertion. Our `then` function returns yet another promise, which eventually resolves to the result of our assertion. 


For further understanding of promises, I recommend this blog post [here]( https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html).




## Improving with Page Objects

At the moment, we’ve set up our tests to run with each element explicitly declared in the test itself. While it works now, as your project expands, readability and maintainability will start to become a big issue. For every change in the DOM, we’ll need to manually change each affected locator in our tests. Using the Page Object allows us to add a layer of abstraction to our test specs; by grouping together element locators from each web page of the site in external modules and exposing these to the test spec, we can both increase readability by giving our elements human-friendly names (guideButton, rather than `[href='/guide.html']`), as well as increasing maintainability via encapsulation. 

```javascript
//”./test/page-objects/HomePageObject.js”
var HomePage =(function(){

function HomePage() {
    this.url = "http://webdriver.io/";
    this.guideButton = "[href='/guide.html']";
    this.apiButton = "[href='/api.html']"; 
};

return HomePage;

})();

module.exports = HomePage;
```

```javascript
// “./test/specs/spec.js”
var HomePageObject = require("../page-objects/HomePageObject.js")

describe("First Spec", function() {
    
    var home;
    
    before(function() {
       home = new HomePageObject(); 
    });
    
    it("should navigate to the webdriverIO homepage", function(){
        return browser.url(home.url)
        .click(home.guideButton)
        .getUrl().then(function(url){
            console.log(url) // outputs "http://webdriver.io/guide.html"
            expect(url).to.equal(home.url + "guide.html");
        });      
    });
}) ;
```

It doesn’t look like much at the moment, but I’m sure you’ll agree our test spec is definitely more readable. 

In our page-object file(which is created in a new page-object directory), we start by declaring ‘HomePage’ as an Immediately-Invoked Function Expression. Wrapping the constructor function in an IIFE may seem like overkill at the moment, but doing so gives us the potential to add private or static variables and helper functions if they are required in the future, without being detrimental to our code. The remainder is fairly self-explanatory:

```javascript
function HomePage() {
        this.url = "http://webdriver.io/";
        this.guideButton = "[href='/guide.html']";
        this.apiButton = "[href='/api.html']";
    };
```

 We set up a constructor function `HomePage()`, and publicly assign our element-finder strings to it, this is then returned by the IIFE and exposed by `module.exports` so we can access it from our spec files. Using a Constructor pattern means we can instance our page-objects, in case we want to run our specs in parallel at a later date.
We then use `require` to access the page-object assigning it to the HomePage variable. We create a new variable in the describe block, `var home`, and then use the `before` hook to create a new instance of the page-object before any of the ‘it’ blocks are executed. The home variable is declared within the `describe` block so that it is accessible to each `it` block. If it was declared in `before`, the `it` blocks would be unable to access it due to JavaScript’s function scope. 

### Expanding our use of Page Objects:

The current page-object works, but is fairly straight forward at the moment. What if we want to include helper methods and manipulate data from elements in the DOM? Let’s create a second test that demonstrates this by navigating to the Developer Guide(http://webdriver.io/guide.html) page of the WebdriverIO site, and asserting that the Test Runner dropdown contains the correct number of links.

Navigating to the guide page and clicking on the Test Runner dropdown is fairly straight forward. However, the test will now be interacting with new elements on a separate page, so let’s create a page-object for the Developer Guide page:

```javascript
“./test/page-objects/DevGuidePageObject.js”
var DevGuide = (function() {
    
  function DevGuide() {
    this.testRunnerElement = '[data-open="testrunner"]';
    this.testRunnerDropdown = ".commands.testrunner";
    
};

DevGuide.prototype.getElementId = function(ele) {
    return ele.value.ELEMENT;   
};

DevGuide.prototype.numberOfSubElements = function(ID) {
   return browser.elementIdElements(ID,'<a>').then(function(elementsArray){
        return Object.keys(elementsArray.value).length;
    });
}

return DevGuide;
})();

module.exports = DevGuide; 
```

```javascript
var HomePageObject = require("../page-objects/HomePageObject.js")
var DevGuidePageObject = require("../page-objects/DevGuidePageObject.js")

//”./test/specs/spec.js”
describe("First Spec", function() {
    
    var home;
    var devGuide; 
    
    before(function() {
       home = new HomePageObject(); 
       devGuide = new DevGuidePageObject();
    });

…    

    it("should count the number of testrunner menu subelements", function() {
        return browser.url(home.url)
            .click(home.guideButton)
            .click(devGuide.testRunnerButton)
            .element(devGuide.testRunnerDropdown)
            .then(function(elem) {
                return devGuide.getElementId(elem);
            }).then(function(id) {
                return devGuide.numberOfSubElements(id)
            }).then(function(numberOfElements) {
                return expect(numberOfElements).to.equal(5);
            });
    });
});
```

The page-object now contains elements for each potential drop down we want to test, and our [it] block references them. The next thing we want to do is find a way of determining the number of sub-elements. WebdriverIO has the command ```elementIdElements```:

`elementIdElements(ID,selector).then(callback);`

which simply lets you search for elements down the branch of a specified element. The command takes the ID of a WebElement JSON object (not the CSS ID), and returns an array of WebElement JSON objects matching the selector provided. Using this, we can search for and return all link elements that are children of the testrunner element. Sounds good, right? The first thing we do is declare the locator to reference the test runner dropdown `testRunnerDropdown`, and then create a helper function that returns the WebElement ID of a given element, ```getElementID```:

```javascript
//”./test/page-objects/DevGuidePageObject.js
…
DevGuide.prototype.getElementId = function(ele) {
    return ele.value.ELEMENT;   
}; 
…
```

WebdriverIO is slightly awkward in the way it deals with elements. We’re unable to pass elements around as first-class citizens, so instead we’re left passing around WebElement ID’s of the elements we want, or string references for selectors, and re-finding the element when we need it. As a result, in a larger project, it might be beneficial to have `getElementID` as a generic helper function in a helper module, so that whenever we need to perform an action on an element we can easily call that function and grab the element’s ID and pass that forward. However, we’ll keep it in our Dev Guide page-object for now. 
We’ve added `getElementID` to the prototype so that each instanced page-object has access to it without re-declaring it each time, as this could adversely affect memory usage during large-scale parallel tests. The final function we need implements `elementIdElements`, and returns the length of the resulting WebElement JSON array:

```javascript
//”./test/page-objects/DevGuidePageObject.js
…
DevGuide.prototype.numberOfSubElements = function(ID) {
   return browser.elementIdElements(ID,'<a>').then(function(elementsArray){
      return Object.keys(elementsArray.value).length;
    });
};
…
```

This takes a given ID, and finds and returns all child elements that match the given tag. We can then implement these in our test spec:

```javascript
//“./test/specs/spec.js”
…
    it("should count the number of testrunner menu subelements", function() {
        return browser.url(home.url)
            .click(home.guideButton)
            .click(devGuide.testRunnerButton)
            .element(devGuide.testRunnerDropdown)
            .then(function(elem) {
                return devGuide.getElementId(elem);
            }).then(function(id) {
                return devGuide.numberOfSubElements(id)
            }).then(function(numberOfElements) {
                return expect(numberOfElements).to.equal(5);
            });
});
```

After clicking on the `testRunnerButton`, the element containing our drop down (and the links) appears. This encompassing element is then passed to a chain of `then` functions, allowing us to;

1. Return the element’s WebElement ID
2. Find all the child-elements of this element that match the <a> tag, and return this value.
3. Assert that the correct number of links are shown.

That’s it! It’s a simple test that may not have huge implications in a real test case, but it successfully demonstrates how to surmount some of the minor difficulties associated with the element finder model implemented in WebdriverIO. 
