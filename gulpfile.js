var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var eslint = require('gulp-eslint');
var csslint = require('gulp-csslint');
var htmllint = require('gulp-htmllint')
var minify = require('gulp-minify');
var cleanCSS = require('gulp-clean-css');
var htmlmin = require('gulp-htmlmin');
var inject = require('gulp-inject-string');
var fs = require('fs');
var package = JSON.parse(fs.readFileSync('./package.json'));
var versionPlaceholder = '##VERSION##';

gulp.task('clean', function () {
	return gulp.src('dist', {read: false})
		.pipe(clean());
});

gulp.task('lint-js', function() {
  return gulp.src('src/**/*.js')
	.pipe(inject.replace(versionPlaceholder, 'v' + package.version))
	.pipe(eslint({
    'envs': ['browser'],
		'globals': {
			'Phaser': false
		},
    'rules': {
        'no-case-declarations': 'error',
        'no-class-assign': 'error',
        'no-cond-assign': 'error',
        'no-console': 'warn',
        'no-const-assign': 'error',
        'no-constant-condition': 'error',
        'no-control-regex': 'error',
        'no-debugger': 'error',
        'no-delete-var': 'error',
        'no-dupe-class-members': 'error',
        'no-dupe-keys': 'error',
        'no-dupe-args': 'error',
        'no-duplicate-case': 'error',
        'no-empty': 'error',
        'no-empty-character-class': 'error',
        'no-empty-pattern': 'error',
        'no-ex-assign': 'error',
        'no-extra-boolean-cast': 'error',
        'no-extra-semi': 'error',
        'no-fallthrough': 'error',
        'no-func-assign': 'error',
        'no-inner-declarations': 'error',
        'no-invalid-regexp': 'error',
        'no-irregular-whitespace': 'error',
        'no-mixed-spaces-and-tabs': 'error',
        'no-negated-in-lhs': 'error',
        'no-new-symbol': 'error',
        'no-obj-calls': 'error',
        'no-octal': 'error',
        'no-redeclare': 'error',
        'no-regex-spaces': 'error',
        'no-self-assign': 'error',
        'no-sparse-arrays': 'error',
        'no-this-before-super': 'error',
        'no-undef': 'error',
        'no-unexpected-multiline': 'error',
        'no-unreachable': 'error',
        'no-unused-labels': 'error',
        'no-unused-vars': 'warn',
        'comma-dangle': 'error',
        'complexity': ['off', 11],
        'constructor-super': 'error',
        'semi': 'warn',
        'strict': 'error',
        'use-isnan': 'error',
        'valid-typeof': 'error'
    }
  }))
  .pipe(eslint.format())
  .pipe(eslint.failOnError());
});

gulp.task('lint-css', function() {
  return gulp.src('src/**/*.css')
    .pipe(csslint())
    .pipe(csslint.reporter(function(file) {
			gutil.log(gutil.colors.cyan(file.csslint.errorCount) + ' errors in ' + gutil.colors.magenta(file.path));
			file.csslint.results.forEach(function(result) {
				gutil.log(result.error.message + ' on line ' + result.error.line);
			});
		}))
    .pipe(csslint.reporter('fail'));
});

gulp.task('lint-html', function() {
	return gulp.src('src/**/*.html')
		.pipe(htmllint({}, function(filepath, issues) {
			if (issues.length > 0) {
				issues.forEach(function (issue) {
					gutil.log(gutil.colors.cyan('[gulp-htmllint] ') + gutil.colors.white(filepath + ' [' + issue.line + ',' + issue.column + ']: ') + gutil.colors.red('(' + issue.code + ') ' + issue.msg));
				});
				// failOnError not working, so exit here instead
				process.exit(1);
			}
		}));
});

gulp.task('minify-js', ['clean', 'lint-js'], function() {
  return gulp.src('src/js/*.js')
		.pipe(inject.replace(versionPlaceholder, 'v' + package.version))
    .pipe(minify({
        ext:{
            min:'.js'
        },
        noSource: true
    }))
    .pipe(gulp.dest('dist/js'))
});

gulp.task('minify-css', ['clean', 'lint-css'], function() {
  return gulp.src('src/css/*.css')
    .pipe(cleanCSS({
      compatibility: 'ie8'}
    ))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('minify-html', ['clean', 'lint-html'], function() {
  return gulp.src('src/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('minify', ['minify-js', 'minify-css', 'minify-html']);

gulp.task('copy-images', ['clean'], function() {
  return gulp.src(['src/images/*.*'])
  .pipe(gulp.dest('dist/images'));
});

gulp.task('copy-sounds', ['clean'], function() {
  return gulp.src(['src/sounds/*.*'])
  .pipe(gulp.dest('dist/sounds'));
});

gulp.task('copy-dependencies', ['clean'], function() {
	return gulp.src(['node_modules/phaser/build/phaser.min.js', 'node_modules/phaser/build/phaser.map'])
  .pipe(gulp.dest('dist/js'));
});

gulp.task('default', ['minify', 'copy-images', 'copy-sounds', 'copy-dependencies']);
gulp.task('lint', ['lint-js', 'lint-css', 'lint-html']);

gulp.task('watch', ['default'], function () {
   return gulp.watch('src/**/*', ['default']);
});
