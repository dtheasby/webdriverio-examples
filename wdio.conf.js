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
      var chai = require('chai');
      expect = chai.expect;
    },
    after: function(failures, pid) {
        // do something
    },
    onComplete: function() {
        // do something
    }
};
