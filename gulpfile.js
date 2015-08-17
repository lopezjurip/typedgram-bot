var gulp = require('gulp');
var ts = require('gulp-typescript');
var typedoc = require('gulp-typedoc');
var merge = require('merge2');

var tsProject = ts.createProject('./tsconfig.json');

gulp.task('script', function() {
  var tsResult = tsProject.src().pipe(ts(tsProject));

  return merge([
        tsResult.dts.pipe(gulp.dest('./definitions')),
        tsResult.js.pipe(gulp.dest('./lib')),
    ]);
});

gulp.task('typedoc', function() {
  return gulp
      .src(['./src/**/*.ts'])
      .pipe(typedoc({
        module: 'commonjs',
        target: 'es5',
        out: 'docs/',
        name: 'Typedgram Bot',
      }))
  ;
});

gulp.task('build', ['script']);
gulp.task('default', ['build']);
