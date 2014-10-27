var gulp   = require('gulp');
var mocha  = require('gulp-mocha');
var config = require('../config').tests;

gulp.task('tests', function() {
    return gulp.src(config.src, {read: false})
        .pipe(mocha());
});
