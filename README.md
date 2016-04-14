# webdriverio-examples

Currently WIP

When it comes to automated UI checking, there is a complex variety of tools at the disposal of the Tester; including Technologies, Test Runners, Test Frameworks, Cloud Services, Reporters, and CI Systems. While the project itself may dictate a small selection of the combination above, choosing the remainder and getting them to play nicely can be a daunting (and sometimes lonesome) task, if there isn’t extensive documentation to be found. 

Webdriver.IO is a Node.JS webdriver library and test runner designed to simplify the testing process by supporting the most popular test frameworks, cloud services, CI Systems, and Reporters out the box - for more info see [Webdriver's Getting Started Page](http://webdriver.io/guide/testrunner/gettingstarted.html)(and here for a [loosely] relevant [xckd](https://xkcd.com/927/)).

This blog post is written in an attempt to guide the user through setting up WebdriverIO, automating the test workflow with gulp, and then expanding the tests to incorporate the page object model.

The final product will be set up with WebdriverIO using Mocha as a test framework and Chai(the assertion library). All tests will be executed on a local Selenium server, with Gulp used to launch the server, run the test runner, and then kill the server afterwards(to keep things tidy), using an npm script command. 

### Getting Started 

First you need to install Node.Js and NPM if you haven’t already ([Node](https://nodejs.org/en/), NPM installs with node). This provides us with a javascript runtime environment, and installs npm globally so we can access it from the command line:

[ screenshot here ]
 
With that done, next we create a new directory for the entire testing library to live in, and install WebdriverIO itself. We’ll be working with v3.4.0, so we can specify that with `npm install webdriverio@3.4.0` (we’re installing to the current directory, if we wanted to install globally we’d append with –g, `npm install webdriverio@3.4.0 –g`).

[ screenshot here ]

Our once empty directory should now contain one new folder, node_modules with WebdriverIO inside, this will contain all the npm dependencies.

The WebdriverIO provided test runner, `wdio`, executes all commands synchronously and handles session management very well, so we’ll be using this to execute the test suite(more info [here](http://webdriver.io/v3.4/guide/testrunner/gettingstarted.html)). `wdio`  needs a configuration file, which is essentially an object that specifies the location of test scripts/specs, the framework, reporter, and some of our hooks, before it can run any suites. Luckily, WebdriverIO comes with a handy commandline helper to set up the config file, this can be accessed by running `wdio config`:

[ screenshot here ]

```javascript
//./wdio.conf.js
exports.config = {

    specs: [
        './test/specs/*.js'
    ],
    exclude: [
    ],
    capabilities: [{
        browserName: 'firefox'
    }],
    logLevel: 'error',
    coloredLogs: true,
    screenshotPath: './errorShots/',
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    framework: 'mocha',
    reporter: 'dot',
    mochaOpts: {
        ui: 'bdd'
    },
    onPrepare: function() {
        // do something
    },
    before: function() {
        // do something
    },
    after: function(failures, pid) {
        // do something
    },
    onComplete: function() {
        // do something
    }
};
```

As you can see, we’ve had to point directly to the ‘wdio’ command which resides in the node_modules folder, rather than being able to call `wdio` itself. This is a consequence of installing locally (the `wdio` command hasn’t been added to PATH), but this won’t be a problem once we set up Gulp.
You can either set up your config file by running the config helper from your newly created test directory, or create your own `wdio.conf.js` in the root of your test directory and copy the above code into it. The main points to take away are that we now have a config file in the root of our test directory, which specifies that we’ll be running our tests on the local machine (using a local selenium server, as opposed to Saucelabs etc), we’ll be using Mocha as our testing framework, and the location of the test specs relative to the location of the config file. 

Next up, we need a test/spec file for `wdio` to execute. After creating a spec file in the directory referenced in the config file, we can paste in the following test:

```javascript
//”./test/specs/spec.js”

describe("First Spec", function() {
    
    it("should navigate to the webdriverIO homepage", function(){
        return browser.url("http://webdriver.io/")
        .click("[href='/guide.html']")
        .getUrl().then(function(url){
            console.log(url) // outputs "http://webdriver.io/guide.html"           
        });      
    });
}) ;
```

With that set up, we can run `wdio` providing it with the config file:

[ screenshot here ]
 
That’s good, no webdriverIO specific errors have fired, and it has found our config file and tests/specs. The next step is to deal with the rather obvious “ERROR: Couldn’t connect to selenium server”, and fix up a connection to the local selenium server.
Setting up the Selenium Server

### Setting up the Selenium Server

Here we’ll be using [Selenium-Standalone](https://www.npmjs.com/package/selenium-standalone) npm package. This package allows us to install the selenium server binary, browser drivers, and the ability to launch a selenium server all from the command line (and programmatically, which will come in handy later), clever right? Let’s install this alongside webdriverio, using `npm install selenium-standalone`:

[ screenshot here ]
 
And following that, run `selenium-standalone`'s `install` command with `".\node_modules\.bin\selenium-standalone" install`:

[ screenshot here ]
 
This command pulls in the latest selenium server version, as well as the default versions of each browser driver. You can specify exactly which drivers and versions you want to install using variations of the following command(See the npm page for more info):

`selenium-standalone install --drivers.chrome.version=2.15 --drivers.chrome.baseURL=https://chromedriver.storage.googleapis.com`

But we’ll stick with the defaults now, following which, we should be able to launch our server using `".\node_modules\.bin\selenium-standalone" start`

[ screenshot here ]
 
Which means we’ll now be able to run our first test. The Selenium server remains registered to the command window, so after launching a new one and returning to our test directory, we can try to run our tests! Booyah!

[ screenshot here ]
 
….almost. There’s one last thing we need to do. As we’re using mocha as a test framework, we need to install this as a dependency too. After simply running `npm install mocha`:

[ screenshot here ]
 
Booyah! One running and passing UI test. Okay, so I guess that was the pretty long version of ‘Getting Started’, but we’ve covered all the basics and developed a solid foundation. Although, having to point directly to the wdio command and manually launch the selenium server when we want to run a test is a bit of a pain; so, let’s make it a bit easier to run our specs by automating our automation!

### Setting up Gulp

We’re going to take a slight detour first and set up a package.json file so npm can recognise our directory as a package(allowing us to use the `npm run` command later!). Npm can create one for us by using the `npm init` command, which will make assumptions based on our existing directory, and create a package.json from it. Running this in the root of our test directory should give us a package.json that matches the following:

[ screenshot here ]

```javascript
//./package.json
{
  "name": "webdriveriotutorial",
  "version": "1.0.0",
  "description": "A quick look at webdriverIO",
  "main": "wdio.conf.js",
  "directories": {
    "test": "test"
  },
  "dependencies": {
    "selenium-standalone": "^5.1.0",
    "webdriverio": "^3.4.0"
  },
  "devDependencies": {
    "mocha": "^2.4.5"
  },
  "scripts": {
    "test": "mocha"
  },
  "author": "",
  "license": "ISC"
}
```
With that done, we can now install gulp locally with the following command;

`npm install gulp --save`

Appending the command with “—save” tells npm to add gulp to the list of dependencies in the package.json file. Another package that will help us is `gulp-webdriver` v1.0.3 (to be compatible with webdriverIO v3.4.0), from the WebdriverIO team. This package allows us to easily access the webdriverIO test runner via gulp. 

`npm install gulp-webdriver@1.0.3 –-save`

With gulp, selenium-standalone, and gulp-webdriver installed, we now have all the dependencies required to automate the test workflow. This is what we’re building:
 
 [ screenshot here ]
 
 ```javascript
 //./gulpfile.js
var path = require('path');
var gulp = require('gulp');
var selenium = require('selenium-standalone');
var webdriver = require('gulp-webdriver');


gulp.task('selenium', function (done) {
    selenium.install({
    logger: function (message) { }
  }, function(err){
        if(err) return done(err);
		selenium.start(function (err, child) {
			if (err) return done(err);
			selenium.child = child;
			done();
		});
    });
});

gulp.task('runTest', ['selenium'], function() {
  return gulp.src(path.join(__dirname, 'wdio.conf.js'))
    .pipe(webdriver()).once('end', function() {
      selenium.child.kill();
    });
});
```
 
First off, we need to create a ‘gulpfile.js’ file next to our wdio config file, in the root of our test directory. Initially, we need to load all our gulp dependencies:

```javascript
var path = require('path');
var gulp = require('gulp');
var selenium = require('selenium-standalone');
var webdriver = require('gulp-webdriver');]
```

And then declare the first gulp task we’ll need, `selenium`, which follows the structure;

`gulp.task(name [, deps, fn])`

Where we give the task a name, declare the task’s dependencies (our `Selenium` task has no other dependencies), and then a function that performs the task’s main processes. Generally, the options for these main processes are outlined on the plugin’s github/npm page (see [here](https://www.npmjs.com/package/selenium-standalone) for selenium-standalone's options). Our `Selenium` task comprises of two processes, `selenium.install()` and `selenium.start()`:

```javascript
//.gulpfile.js
...
gulp.task('selenium', function (done) {
    selenium.install(function(err){
        if(err) return done(err);
		selenium.start(function (err, child) {
			if (err) return done(err);
			selenium.child = child;
			done();
		});
    });
});
...
```

Both commands can take an options object before the callback, but we want to run with the default options, so we provide only the callback functions. 

Looking inside the `selenium.start` callback, we set the selenium child process on to the selenium object so it can be shut down later.

Our second Gulp task is going to run the `wdio` command, executing our tests:

```javascript
//./gulpfile.js
...
gulp.task('runTest', ['selenium'], function() {
  return gulp.src(path.join(__dirname, 'wdio.conf.js'))
    .pipe(webdriver()).once('end', function() {
      selenium.child.kill();
    });
});
...
```

Following the same setup as before, we’ve named this task ‘runTest’, declared our previous `Selenium` task as a dependency, and then defined the main operations for the task. Simply, `gulp.src` obtains the file located at the provided file location/glob, which can then be piped to the chained process. We’re piping the config file into the gulp-webdriver process, `webdriver()`, which is the equivalent of running `wdio wdio.conf.js` in the command line. It is possible to provide gulp-webdriver with config options at this stage, such as:
```javascript
.pipe(webdriver({ logLevel: 'verbose',
        waitforTimeout: 10000,
        reporter: 'spec' })
 ```
 However, it is much more maintainable to contain these in the external config file( futher info on gulp-webdriver and available options can be found here - [Getting-started](http://webdriver.io/guide/testrunner/gettingstarted.html) and [gulp-webdriver](http://webdriver.io/guide/plugins/gulp-webdriver.html)).

The final thing we need to do before running is set up an npm [run](https://docs.npmjs.com/cli/run-script) script so we can access our newly created gulp tasks from the command line. We could run them via `gulp runTasks`, but as we only have Gulp installed locally we would have to point directly to the gulp command in our node_modules eg `“./node_modules/.bin/gulp” runTasks`, which is a lot of effort and I’m lazy.

Setting up the `npm run` task is super simple, and is done in our project.json file. Our init command should have been kind enough to set up a “Scripts” attribute. In here we can define our gulp task:

```javascript
//./package.json
…  
},
  "devDependencies": {
    "mocha": "^2.4.5"
  },
  "scripts": {
    "test": "mocha",
    "runTest": "gulp runTest"
  }, 
 "author": "",
…
```
From here, all we need to do is execute `npm run runTasks` to access the assigned gulp workflow. This works because the `npm run` command adds `node_modules/.bin`, our local dependency directory, to the shell’s PATH, allowing us to run Gulp like it’s installed globally!

[ screenshot here ]
 
That’s it for setting up our workflow environment! Without gulp, each time the test were to run we’d need to (perhaps update) launch our selenium server, run our test scripts, and then kill the server. With it, we’ve automated this workflow, allowing us to run it all with one simple npm command. 

Perhaps time for some coffee.

### Time to Test

The test we have at the moment is a fairly straight forward, although with the lack of any type of assertion, can we really call it a test? We can crumble any doubt by installing an assertion library, such as Chai! Chai provides three different styles(Expect, Should, and Assert), that allow us to write syntactically delicious assertions. 

We’ll be going with Expect for the moment. After installing Chai via npm, and then initialising itself and ‘Expect’ in the Before hook located in the wdio config file, we have:

[ screenshot here ]
     
```javascript
// ./wdio.conf.js
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

WebdriverIO sets up the test hooks in it’s config file by default. Each hook is executed at different stages of the test’s flow, with the `Before` hook running once per `Describe` block, before any `It` blocks have run.

With Chai and Expect declared at the start of our describe block, we can now add the first assertion to our test:

```javascript
//.test/specs/spec.js
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
 
 [ screenshot here ]

Running this should present you with a passing test. Now let’s take a quick tour of what’s actually going on. 

As we’re using mocha’s BDD syntax, we’re defining the test suites and cases with `Describe` and `It` blocks, respectively.

If you have eagle eyes, you might have spotted that the first thing declared in the `It` block is a `return` on our command chain. As we’re running tests in an asynchronous environment, mocha needs to know when our browser commands have completed and assertions have finished. It has two ways of doing this, either via the `done()` callback, or by returning a promise. 

Furthermore, every WebdriverIO command is chainable and returns a promise, making it incredibly easy to write synchronous code to test the asynchronous browser environment - essentially queing each command in the chain, waiting for the promise from the previous command to resolve before executing the latter. By returning this promise chain, mocha knows when the final promise has been resolved, and will wait for this before ending the test. Another advantage of using and returning promises is that we can avoid the numerous call-backs and error-handling code normally associated with using `done()`, making our code simpler, and our lives easier.

Looking back at the test case:

```javascript
     return browser.url("http://webdriver.io/")
        .getUrl().then(function(url){
            console.log(url) // outputs "http://webdriver.io""
            expect(url).to.equal("http://webdriver.io/");
        });  
```

`browser` is an object representation of our selenium browser instance, and is where we direct our actions/commands. The first command we chain to it is `url(“http://www.webdriver.io”)`, sending the browser to the given url. The browser object is passed into `url`, and returned with a promise attached to represent this action; only once this promise is resolved will the following chained action, `Click`, execute;

`.click("[href='/guide.html']")`

Every WebdriverIO element interaction accepts a string which is used to locate the associated html element in the DOM, the string can reference the element’s ID, class, tag, or more (see http://webdriver.io/guide/usage/selectors.html). 

The click command takes the browser object which has been returned from the `url` command, and the string locator we provided (`[href='/guide.html']`). It then locates this element, initiates the action, and returns the browser object with the click command’s promise attached. 

Following this, we have the `getUrl` action which follows a slightly different syntax;

`.getUrl().then(function(url){ `

`getUrl` returns a promise that eventually resolves to give the broswer's current url. The final assertion relies on the result of this promise, so we want to wait for the promise to resolve before running the assertion. This can be done by attaching a `then` function that "holds" our assertion:

`promise.then(onFulfilled, onRejected)]`

This waits for the promise to resolve, before executing the relevent callback depending on whether it resolved successfully or was rejected/error'd. In place of "onfulfilled" we pass the function containing our assertion, with the result of the `getUrl` promise passed into the function upon resolution. 

Finally, Mocha sees that all promises have resolved, and the result of the assertion, ending the test.

For further understanding of promises, I recommend this blog post [here]( https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html).


### Improving with Page Objects

At the moment, we’ve set up our tests to run with each element locator explicitly declared in the test itself. While it works now, as a project expands, readability and maintainability will start to become a big issue. For every change in the DOM, we’ll need to manually change each affected locator in our tests. Using the Page Object model adds a layer of abstraction to the test specs; by grouping together element locators from each web page of the site in external modules and exposing these to the test spec, we can both increase readability by giving our elements human-friendly names (guideButton, rather than `[href='/guide.html']`), as well as increasing maintainability via encapsulation. 

```javascript
//./test/page-objects/HomePageObject.js
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
// ./test/specs/spec.js
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

It doesn’t look like much at the moment, but I’m sure you’ll agree the test spec is definitely more readable. 

In the page-object file (which is created in a new page-object directory), we start by declaring ‘HomePage’ as an Immediately-Invoked Function Expression. Wrapping the constructor function in an IIFE may seem like overkill at the moment, but doing so gives us the potential to add private or static variables and helper functions if they are required in the future, without being detrimental to our code. The remainder is fairly self-explanatory:

```javascript
function HomePage() {
        this.url = "http://webdriver.io/";
        this.guideButton = "[href='/guide.html']";
        this.apiButton = "[href='/api.html']";
    };
```

We set up a constructor function `HomePage()`, and publicly assign our element-finder strings to it, this is then returned by the IIFE and exposed by `module.exports` so we can access it from our spec files. Using a Constructor pattern means we can instance our page-objects, in case we want to run our specs in parallel at a later date.
We then use `require` to access the page-object assigning it to the HomePage variable. We create a new variable in the describe block, `var home`, and then use the `before` hook to create a new instance of the page-object before any of the ‘it’ blocks are executed.

### Expanding our use of Page Objects:

The current page-object works, but is fairly straight forward at the moment. What if we want to include helper methods and manipulate data from elements in the DOM? Let’s create a second test that demonstrates this by navigating to the Developer [Guide](http://webdriver.io/guide.html) page of the WebdriverIO site, and asserting that the Test Runner dropdown contains the correct number of links.

Navigating to the guide page and clicking on the Test Runner dropdown is fairly straight forward operation. However, the test will now be interacting with new elements on a separate page, so let’s create a page-object for the Developer Guide page:

```javascript
//./test/page-objects/DevGuidePageObject.js
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
//./test/specs/spec.js
var HomePageObject = require("../page-objects/HomePageObject.js")
var DevGuidePageObject = require("../page-objects/DevGuidePageObject.js")

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
            .click(devGuide.testRunnerElement)
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

The page-object now contains elements for the element and dropdown we want to test, and our [it] block references them. The next thing we want to do is find a way of determining the number of sub-elements. WebdriverIO has the command ```elementIdElements```:

`elementIdElements(ID,selector).then(callback);`

which simply lets you search for elements down the branch of a specified element. The command takes the ID of a WebElement JSON object (not the CSS ID), and returns an array of WebElement JSON objects matching the selector provided. Using this, we can search for and return all link elements that are children of the testrunner element.

The first thing to do to use `elementIdElements` is create a helper function that returns the WebElement ID of a given element, `getElementID`, so that it can be passed into the command:

```javascript
//./test/page-objects/DevGuidePageObject.js
…
DevGuide.prototype.getElementId = function(ele) {
    return ele.value.ELEMENT;   
}; 
…
```

We’ve added `getElementID` to the prototype so that every instanced page-object has access to it without re-declaring it each time, as this could adversely affect memory usage during large-scale parallel tests. 

WebdriverIO is slightly awkward in the way it deals with elements. We’re unable to pass elements around as first-class citizens, so instead we’re left passing around WebElement ID’s of the elements we want, or string references for selectors and re-finding the element when we need it. As a result, in a larger project, it might be beneficial to have `getElementID` as a generic helper function in a helper module, so that whenever we need to perform an action on an element we can easily call that function. However, we’ll keep it in our Dev Guide page-object for now, as our test spec is testing the associated page. 

The final function we need implements `elementIdElements`, and returns the length of the resulting WebElement JSON array:

```javascript
//./test/page-objects/DevGuidePageObject.js
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
//./test/specs/spec.js”
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
