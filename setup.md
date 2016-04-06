When it comes to automated UI checking, there is a complex variety of tools at the disposal of the Tester; including Technologies, Test Runners, Test Frameworks, Cloud Services, Reporters, and CI Systems. While the project itself may dictate a small selection of the combination above, choosing the remainder and getting them to play nicely can be a daunting (and sometimes lonesome) task, if there isn’t extensive documentation to be found. 

Webdriver.IO is a Node.JS webdriver library designed to simplify the testing process by supporting the most popular test frameworks, cloud services, CI Systems, and Reporters out the box - for more info see [Webdriver's Getting Started Page](http://webdriver.io/guide/testrunner/gettingstarted.html)(and here for a [loosely] relevant [xckd](https://xkcd.com/927/)).

This blog post is written in an attempt to guide the user through setting up WebdriverIO, covering the basics, and then digging slightly deeper than the usual ‘Getting Started’ will take you by incorporating a page object model and automating the test workflow with Gulp.

To give a little context on the final product, run the test workflow with one command and no global dependencies. We’ll set up the WebdriverIO test runner to work with Mocha(Framework) and the Chai(assertion library). The tests will run on a local selenium server, using Gulp to launch this, run our tests, and then kill the server afterwards to keep things tidy.

### Getting Started 

First you need to install Node.Js and NPM if you haven’t already ([Node](https://nodejs.org/en/), NPM installs with node). This provides us with a javascript runtime environment, and installs npm globally so we can access it from the command line:
 
With that done, we can start with the task at hand. Let’s create a directory for our entire testing library to live in. Next, we want to change into the new directory and install WebdriverIO itself via npm. We’ll be working with v3.4.0, so we can specify that with `npm install webdriverio@3.4.0` (we’re installing to the current directory, if we wanted to install globally we’d append with –g, `npm install webdriverio@3.4.0 –g`).

Our once empty directory should now contain one new folder, node_modules with webdrverio inside, where all our dependencies will be living. Congratulations! We’re one big step closer to testing with webdriverIO. 

Wdio needs a configuration file before we can do any testing, which is essentially an object literal that specifies the location of test scripts/specs, the test framework, reporter, and some of our hooks(See [here] (http://webdriver.io/guide/testrunner/configurationfile.html) for full details). WebdriverIO comes with a handy commandline helper to set up the config file, this can be accessed by running `wdio config`:

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

As you can see, we’ve had to point directly to the ‘wdio’ command which resides in the node_modules folder, rather than being able to call `wdio` itself. This is a consequence of installing locally (the `wdio` command hasn’t been registered to the PATH), but this won’t be a problem once we set up Gulp.
You can either set up your config file by running the config helper from your newly created test directory, or create your own `wdio.conf.js` in the root of your test directory and copy the above code into it. The main points to take away are that we now have a config file in the root of our test directory, which specifies that we’ll be running our tests on the local machine (using a local selenium server, as opposed to Saucelabs etc), we’ll be using Mocha as our testing framework, and the location of the test specs relative to the location of the config file. 

Next up, we need a test/spec file for our test runner to find. After creating a spec file in the directory referenced in the config file, we can paste in the following test:

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

With that set up, we can execute the wdio test runner with our config file:
 



That’s good, no webdriverIO specific errors have fired, and it has found our config file and tests/specs. The next step is to deal with the rather obvious “ERROR: Couldn’t connect to selenium server”, and fix up a connection to the local selenium server.
Setting up the Selenium Server
Here we’ll be using [Selenium-Standalone](https://www.npmjs.com/package/selenium-standalone) npm package. This package allows us to install the selenium server binary, browser drivers, and the ability to launch a selenium server all from the command line (and programmatically, which will come in handy later), clever right? Let’s install this alongside webdriverio, using `npm install selenium-standalone`:
 
And following that, the browser drivers with `".\node_modules\.bin\selenium-standalone" install`:
 
This command pulls in the latest selenium server version, as well as the default versions of each browser driver. You can specify exactly which drivers and versions you want to install using variations of the following command(See the npm page for more info):

`selenium-standalone install --drivers.chrome.version=2.15 --drivers.chrome.baseURL=https://chromedriver.storage.googleapis.com`

But we’ll stick with the defaults now, following which, we should be able to launch our server using `".\node_modules\.bin\selenium-standalone" start`
 
Which means we’ll now be able to run our first test. The Selenium server remains registered to the command window, so after launching a new one and returning to our test directory, we can try to run our tests! Booyah!
 
….almost. There’s one last thing we need to do. As we’re using mocha as a test framework, we need to install this as a dependency too. After simply running `npm install mocha`:
 
Booyah! One running and passing UI test. Okay, so I guess that was the pretty long version of ‘Getting Started’, but we’re definitely getting somewhere. Although, having to point directly to the wdio command and manually launch the selenium server when we want to run a test is a bit of a pain; so, let’s make it a bit easier to run our specs by automating our automation!

### Setting up Gulp

We’re going to take a slight detour first and set up a package.json file so npm can recognise our directory as a package(we’ll see why soon!). Npm can create one for us by using the `npm init` command, which will make assumptions based on our existing package, and create a json from it. Running this in the root of our test directory should give us a package.json file that matches the following:

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

Appending the command with “—save” tells npm to add gulp to the list of dependencies in our package.json file. Another package that will help us is `gulp-webdriver` v1.0.3 (to be compatible with webdriverIO v3.4.0), from the WebdriverIO team. This package allows to easily access the webdriverIO test runner via gulp. 

`npm install gulp-webdriver@1.0.3 –save`

With gulp, selenium-standalone, and gulp-webdriver installed, we now have all the dependencies required to automate our test workflow. This is what we’re building:
 
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

Both commands can take an options object before the callback, but we want to run with the default options, so we provide only the callback functions. The default options are (baseURL is not used in the options for Start):

```javascript
{
  chrome: {
    version: '2.15',
    arch: process.arch,
    baseURL: 'https://chromedriver.storage.googleapis.com'
  },
  ie: {
    version: '2.45.0',
    arch: process.arch,
    baseURL: 'https://selenium-release.storage.googleapis.com'
  }
}
```

Looking inside the `selenium.start` callback, we set the selenium child process on to the selenium object so it can be shut down later.

Our second Gulp task is going to run the ‘wdio’ command, executing our tests:

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

Following the same structure as before, we’ve named this task ‘runTest’, declared our previous `Selenium` task as a dependency, and then defined the main operations for the task. Simply, `gulp.src` obtains the file located at the provided file location/glob, which can then be piped to the chained process. We’re piping the config file into the gulp-webdriver process, `webdriver()`, which is the equivalent of running `wdio wdio.conf.js` in the command line. It is possible to provide gulp-webdriver with config options at this stage, such as:
```javascript
.pipe(webdriver({ logLevel: 'verbose',
        waitforTimeout: 10000,
        reporter: 'spec' })
 ```
 
However, there is no requirement for us to do this as we defined these options in the config file( futher info on gulp-webdriver and available options can be found here - http://webdriver.io/guide/testrunner/gettingstarted.html and http://webdriver.io/guide/plugins/gulp-webdriver.html).

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
 
That’s it for setting up our workflow environment! Without gulp, each time the test were to run we’d need to (perhaps update) launch our selenium server, run our test scripts, and then kill the server. With it, we’ve automated this workflow, allowing us to run it all with one simple npm command. 

Perhaps time for some coffee.

