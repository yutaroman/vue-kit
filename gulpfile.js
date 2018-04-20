'use strict';
/**
 * プラグイン
 */
var gulp = require('gulp');
var gulpLoadPluginsulp = require('gulp-load-plugins');
var $ = gulpLoadPluginsulp();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var fs = require('fs');
var through2 = require('through2');
var browserify = require('browserify');
var babelify = require('babelify');
var vueify = require('vueify');
var envify = require('envify/custom');

/**
 * 定数
 */
var SRC_PATH = "src";
var PROD_PATH = "prod";
var PLUMBER_OPTIONS = {
    errorHandler: function (error) {
        console.log(error.messageFormatted);
        this.emit('end');
    }
};

/**
 * 生成
 * $ build
 */
gulp.task('build-html', function () {
    return gulp.src(SRC_PATH + '/*.html')
        .pipe($.plumber(PLUMBER_OPTIONS))
        .pipe(gulp.dest(PROD_PATH));
});
gulp.task('build-js', function () {
    return gulp.src(SRC_PATH + '/assets/js/main.js')
        .pipe($.changed('./'))
        .pipe(through2.obj(function (file, encode, callback) {
            browserify(file.path, {
                debug: true
            })
            .transform(babelify, {
                presets: ['es2015']
            })
            .transform(vueify)
            .transform({
                global: true
            }, envify({
                NODE_ENV: 'production'
               })
            )
            .bundle(function (err, res) {
                if (err) {
                    return callback(err);
                }
                file.contents = res;
                callback(null, file)
            });
        }))
        .pipe($.plumber())
        .pipe($.uglify())
        .pipe(gulp.dest(PROD_PATH + '/assets/js'));
});
gulp.task('build', [
    'build-html',
    'build-js'
]);

/**
 * ローカルwebサーバーの起動
 * $ serve
 */
gulp.task('serve', function() {
    browserSync({
        host: 'localhost',
        port: 8000,
        server: {
            baseDir: PROD_PATH,
            directory: true
        }
    });
});

/**
 * ブラウザのオートリロード
 * $ reload
 */
gulp.task('reload', function() {
	return browserSync.reload();
});

/**
 * 変更ファイルの監視
 * $ watch
 */
gulp.task('watch', ['serve'], function () {
    gulp.watch(SRC_PATH + '/*.html', function() {
      runSequence('build-html', 'reload');
    });
    gulp.watch(SRC_PATH + '/assets/js/**/*', function() {
      runSequence('build-js', 'reload');
    });
});

/**
 * デフォルト
 * $ gulp
 */
gulp.task('default', [
    'build', 'watch'
]);
