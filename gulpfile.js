var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    spawn = require('child_process').spawn;


gulp.task('default', ['serve']);

var node;
gulp.task('start', function() {
  if (node) {
    node.kill();
  }
  node = spawn('node', ['./src/server.js'], {stdio: 'inherit'});
});

gulp.task('serve', ['start'], function () {
  gulp.watch(['./src/*.js'], ['start']);
});

gulp.task('lint', function() {
  gulp.src('./src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('build', ['lint', 'test'], function() {
  // TODO
});
