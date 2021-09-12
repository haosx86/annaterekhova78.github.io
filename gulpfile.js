const { src, dest, parallel, series, watch } = require('gulp');

const nunjucks = require('gulp-nunjucks');
const nunjucks_lib = require('nunjucks');

const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cwebp = require('gulp-cwebp');
const cleanCSS = require('gulp-clean-css');

const exec = require('child_process').exec;

function clean(cb) {
  exec('rm -rf ./dist/*', cb);
}

function initBrowserSync() {
  browserSync.init({
    server: { baseDir: 'dist/' },
    notify: false,
    online: true
  })

  watch('./src/**/*.less', styles);
  watch('./static/font/**/*', fontCopy);
  watch('./static/img/**/*', imgCopy);
  watch('./src/**/*.+(html|njk)', njk);
}

function njk() {
  return src("./src/pages/**/*.njk")
    .pipe(nunjucks.compile({}, {
      env: new nunjucks_lib.Environment(new nunjucks_lib.FileSystemLoader('./src/particials'))
    }))
    .pipe(dest('./dist'))
    .pipe(browserSync.stream())
}


function styles() {
  return src('./src/index.less')
    .pipe(less())
    .pipe(concat('styles.css'))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 4 versions'], grid: true }))
    .pipe(cleanCSS())
    .pipe(dest('./dist'))
    .pipe(browserSync.stream())
}

function fontCopy() {
  return src('./static/font/**/*')
    .pipe(dest("./dist/font"))
    .pipe(browserSync.stream())
}

function imgCopy() {
  return src('./static/img/**/*')
    .pipe(dest("./dist/img"))
    .pipe(browserSync.stream())
}

function convertImages() {
  return src('./static/img_source/**/*')
  .pipe(cwebp())
  .pipe(dest('./static/img'))
  .pipe(browserSync.stream())
}

exports.initBrowserSync = initBrowserSync
exports.njk = njk
exports.styles = styles
exports.fontCopy = fontCopy
exports.convertImages = convertImages
exports.imgCopy = imgCopy
exports.build = series(clean, parallel(njk, styles, fontCopy, imgCopy))
exports.default = series(
  clean,
  parallel(
    njk,
    styles,
    fontCopy,
    imgCopy
  ),
  initBrowserSync
)