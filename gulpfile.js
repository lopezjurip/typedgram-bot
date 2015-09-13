var gulp = require('gulp');
var ts = require('gulp-typescript');
var typedoc = require('gulp-typedoc');
var merge = require('merge2');
var dts = require('dts-bundle');

var tsProject = ts.createProject('./tsconfig.json');

gulp.task('script', function() {
  var tsResult = tsProject.src().pipe(ts(tsProject));

  return merge([
        tsResult.dts.pipe(gulp.dest('./definitions')),
        tsResult.js.pipe(gulp.dest('./lib')),
    ]);
});

gulp.task('definitions', ['script'], function() {
  dts.bundle({
    name: 'typedgram-bot',
    main: 'definitions/src/typedgram-bot.d.ts',
  });
});

gulp.task('typedoc', function() {
  return gulp
      .src(['./src/**/*.ts'])
      .pipe(typedoc({
        module: 'commonjs',
        target: 'es5',
        out: 'docs/',
        name: 'Typedgram Bot',
        includeDeclarations: true,
      }))
  ;
});

gulp.task('build', ['script', 'definitions']);
gulp.task('default', ['build']);
