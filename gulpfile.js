const  {src, dest, parallel, series, watch} = require('gulp');
const htmlmin = require('gulp-htmlmin');
const del = require('del');
const babel = require('gulp-babel');
const jsonmin = require('gulp-jsonminify');

const OUTPUT_DIR = 'dist';

function clean() {
  return del([OUTPUT_DIR]);
}

function html() {
  return src('src/**/*.html', {base: 'src'})
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      maxLineLength: 120
    }))
    .pipe(dest(OUTPUT_DIR));
}

function js() {
  return src(['src/**/*.js', '!src/assets/**/*'], {base: 'src'})
    .pipe(babel({
      presets: ['@babel/preset-env', 'minify']
    }))
    .pipe(dest(OUTPUT_DIR))
}

function json() {
  return src('src/**/*.json', {base: 'src'})
    .pipe(jsonmin())
    .pipe(dest(OUTPUT_DIR))
}

function assets() {
  return src('src/assets/**/*')
    .pipe(dest(OUTPUT_DIR + '/assets'))
}

exports.default = series(clean, parallel(html, js, json));

exports.watch = () => watch('src/**/*', exports.default);


