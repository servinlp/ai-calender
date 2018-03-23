// // Dependencies
// var gulp = require('gulp');
// var nodemon = require('gulp-nodemon');
// var notify = require('gulp-notify');
// var livereload = require('gulp-livereload');
// var sass = require('gulp-sass');

// gulp.task('sass', function () {
//  return gulp.src('./sass/**/*.scss')
//    .pipe(sass().on('error', sass.logError))
//    .pipe(gulp.dest('./css'));
// });

// gulp.task('sass:watch', function () {
// 	gulp.watch('./sass/**/*.scss', ['scss']);
// });
// // Task
// // gulp.task('default', function() {
// // 	// listen for changes
// // 	livereload.listen();
// // 	// configure nodemon
// // 	nodemon({
// // 		// the script to run the app
// // 		script: 'app.js',
// // 		ext: 'js'
// // 	}).on('restart', function(){
// // 		// when the app has restarted, run livereload.
// // 		gulp.src('app.js')
// // 			.pipe(livereload())
// // 			.pipe(notify('Reloading page, please wait...'));
// // 	})
// // })
// gulp.task('serve', ['watch', 'sass'], function(){
// 	livereload.listen();
	
// 	return nodemon({
// 	  script: 'app.js',
// 	  ext: 'html'
// 	})
// 	.on('restart', function(){
// 	  console.log('restarted');
// 	})
//   })
  

var gulp = require('gulp');  
var nodemon = require('gulp-nodemon');  
var sass = require('gulp-ruby-sass');  
var autoprefixer = require('gulp-autoprefixer');  
var livereload = require('gulp-livereload');  

gulp.task('styles', function() {  
	return sass('public/styles/*.scss', { style: 'expanded' })
		.pipe(autoprefixer('last 2 version'))
		.pipe(gulp.dest('public/styles'))
		.pipe(livereload());
});

gulp.task('scripts', function() {  
	return gulp.src('public/*.js')
	.pipe(livereload());
});
gulp.task('ejs',function(){  
	return gulp.src('views/*.ejs')
    .pipe(livereload());
});
  
gulp.task('watch', function() {  
	livereload.listen();
	gulp.watch('public/styles/*.scss', ['styles']);
	gulp.watch('public/*.js', ['scripts']);
	gulp.watch('views/*.ejs', ['ejs']);
});

gulp.task('server',function(){  
	nodemon({
		'script': 'app.js',
		'ignore': 'public/*.js'
	});
});

gulp.task('serve', ['server','watch']);  
