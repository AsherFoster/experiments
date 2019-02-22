const  {src, dest, parallel, series, watch} = require('gulp');
const htmlmin = require('gulp-htmlmin');
const del = require('del');
const babel = require('gulp-babel');

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
  return src('src/**/*.js', {base: 'src'})
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(dest(OUTPUT_DIR))
}

exports.default = series(clean, parallel(html, js));

exports.watch = () => watch('src/**/*', exports.default);


