const { src, dest, parallel, series, watch } = require('gulp');

const nunjucks = require('gulp-nunjucks');
const nunjucks_lib = require('nunjucks');

const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');

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
  watch('./static/**/*', staticCopy);
  watch('./src/**/*.+(html|njk)', njk);
}

function njk() {
  return src("./src/pages/*.njk")
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
    .pipe(dest('./dist'))
    .pipe(browserSync.stream())
}

function staticCopy() {
  return src('./static/**/*')
    .pipe(dest("./dist"))
    .pipe(browserSync.stream())
}

exports.initBrowserSync = initBrowserSync
exports.njk = njk
exports.styles = styles
exports.staticCopy = staticCopy
exports.build = series(clean, parallel(njk, styles, staticCopy))
exports.default = series(
  clean,
  parallel(
    njk,
    styles,
    staticCopy
  ),
  initBrowserSync
)