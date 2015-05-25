var gulp = require('gulp');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');

gulp.task('watch', function(){
	gulp.watch('src/js/**/*.js', ['concat']);
});

gulp.task('concat', function(){
	gulp.src('src/js/**/*.js')
		.pipe(plumber())
		.pipe(concat('manusort.js'))
		.pipe(gulp.dest('dist/js'));
});
