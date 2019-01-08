var config = require('./config'),
	log = require('./libs/winston-logger')(module),
	gulp = require('gulp'),
	src = config.get('src'), // Откуда минифицировать и сшивать
	public = config.get('public'), // Куда класть всё минифицированное и сшитое
	temp = config.get('temp'), // Временная папка, вроде использовал для семантика
	port = config.get('port'), // Порт для локалхоста
	nodemon = require('gulp-nodemon'), //Перезапуск
	uglify = require('gulp-uglify'), // Минификация JS
	imagemin = require('gulp-imagemin'), // Минификация изображений
	csso = require('gulp-csso'), // Минификация CSS
	browserSync = require('browser-sync'), //Синхронизатор страниц
	plumber = require('gulp-plumber'), //Если ошибки пуга не вылетать
	stylus = require('gulp-stylus'), // Обработка файлов стилуса в css
	concat = require('gulp-concat'), // Склейка файлов в один
	del = require('del'), // Удаляет любые папки и файлы
	imageResize = require('gulp-image-resize'),
	rename = require('gulp-rename');

// Очистка папки со скомпилированной статикой (перед новой компиляцией)
gulp.task('clear', function () {
	return del(public + '/*');
});

// Компилятор всех стилусов
gulp.task('stylus-compile-minify', function () {
	return gulp.src([
		src + '/styles/*.styl'
	])
	.pipe(plumber())
	.pipe(stylus())
	.pipe(csso())
	.pipe(gulp.dest(public + '/css/'));
});

// Создаём минифицированный JS
gulp.task('js-minify', function () {
	return gulp.src([src + '/js/**/*.js'])
	.pipe(concat('main.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest(public + '/js/'));
});

/* 
 * Задачи BrowserSync
 */
gulp.task('browser-sync', ['nodemon'], function () {
	// for more browser-sync config options: http://www.browsersync.io/docs/options/
	browserSync({
		// informs browser-sync to proxy our expressjs app which would run at the following location
		proxy: 'http://localhost:' + port,
		// informs browser-sync to use the following port for the proxied app
		// notice that the default port is 3000, which would clash with our expressjs
		port: 4000,
		ui: false,
		open: false
	});
});
gulp.task('bs-reload', function () {
	browserSync.reload();
});
// we'd need a slight delay to reload browsers
// connected to browser-sync after restarting nodemon
var BROWSER_SYNC_RELOAD_DELAY = 500;
gulp.task('nodemon', function (cb) {
	var called = false;
	return nodemon({
		// nodemon our expressjs server
		script: 'app.js',
		// watch core server file(s) that require server restart on change
		watch: ['app.js', 'db/*.json', 'routes']
	})
		.on('start', function onStart() {
			// ensure start only got called once
			if (!called) {
				cb();
			}
			called = true;
		})
		.on('restart', function onRestart() {
			// reload connected browsers after a slight delay
			setTimeout(function reload() {
				browserSync.reload({
					stream: false
				});
			}, BROWSER_SYNC_RELOAD_DELAY);
		});
});

/* 
 * Запуск Браузера с отслеживанием BrowserSync
 */
gulp.task('work', [
	'browser-sync',
	'stylus-compile-minify',
	'js-minify'
], function () {
	gulp.watch(src + '/styles/**/*.styl', ['compilate-css', browserSync.reload]);
	gulp.watch(src + '/inlineJS/**/*.js', ['js-inline', browserSync.reload]);
	gulp.watch('views/**/*.jade', browserSync.reload);
	gulp.watch('views/**/*.json', browserSync.reload);
	gulp.watch('routes/**/*.js', browserSync.reload);
	log.info("GULPED! ---> Work, Bitch! Please!");
});
gulp.task('build', [
		'stylus-compile-minify',
		'js-minify'
], function () {
	log.info("GULPED! ---> Builded");
});
