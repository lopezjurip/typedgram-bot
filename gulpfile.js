var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');

var tsProject = ts.createProject('./tsconfig.json');

gulp.task('script', function() {
  var tsResult = tsProject.src().pipe(ts(tsProject));

  return merge([
        tsResult.dts.pipe(gulp.dest('./definitions')),
        tsResult.js.pipe(gulp.dest('./lib')),
    ]);
});

gulp.task('build', ['script']);
gulp.task('default', ['build']);
