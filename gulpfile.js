var path = require('path');
var gulp = require('gulp');
var selenium = require('selenium-standalone');
var webdriver = require('gulp-webdriver');


gulp.task('selenium', function (done) {
    selenium.install(function(err){
        if(err) return done(err);
    });
    selenium.start(function (err, child) {
      if (err) return done(err);
      selenium.child = child;
      done();
    });
});

gulp.task('runTest', ['selenium'], function() {
  return gulp.src(path.join(__dirname, 'wdio.conf.js'))
    .pipe(webdriver()).once('end', function() {
      selenium.child.kill();
    });
});