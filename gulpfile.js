const gulp = require('gulp');

const gulpLoadPlugins = require('gulp-load-plugins');
const gp = gulpLoadPlugins();
const del = require('del');
const browserSync = require('browser-sync').create();
const inlineCss = require('gulp-inline-css');

const paths = {

    build: './build',

    pug: {
        src: ['./src/**/*.pug', '!./src/pug-mixins/*.pug', '!./src/variables.pug'],
        dest: './build',
        watch: './src/**/*.pug'
    },

    styles: {
        main: './src/styles/**/*.scss',
        dest: './build',
        watch: './src/styles/**/*.scss'
    },

    inline: {
        src: './build/pug-blocks/*.html',
        dest: './build/pug-blocks'
    }
};

// очистка
function clean() {
    return del(paths.build);
}

// pug
function templates(){
    return gulp.src(paths.pug.src)
    .pipe(gp.pug({
        // locals : JSON.parse(fs.readFileSync('./src/content.json', 'utf8')),
        pretty: true
    }))
    .on('error', gp.notify.onError(function (error) {
        return {
            title: 'Pug',
            message: error.message
        }
    }))
    .pipe(gulp.dest(paths.build));
};

// scss
function styles() {
    return gulp.src(paths.styles.main)
        .pipe(gp.sassGlob())
        // .pipe(gp.sourcemaps.init())
        .pipe(gp.sass({
            includePaths: require('node-normalize-scss').includePaths
        }).on('error', gp.notify.onError({
            title: 'style'
        })))
        // .pipe(gp.autoprefixer({
        //     browsers: [
        //         'last 3 version',
        //         '> 1%',
        //         'ie 8',
        //         'ie 9',
        //         'Opera 12.1'
        //     ]
        // }))
        // .pipe(gp.cssUnit({
        //     type     :    'px-to-rem',
        //     buildSize :    16
        // }))
        // .pipe(gp.sourcemaps.write())
        .pipe(gulp.dest(paths.styles.dest))
}

// Инлайнер
function inline() {
  return gulp.src(paths.inline.src)
      .pipe(inlineCss({
        removeLinkTags: true,
        applyTableAttributes: true
      }))
      .pipe(gulp.dest(paths.inline.dest))
}

// server
function serve() {
    browserSync.init({
        open: false,
        server: {
            baseDir: "./build"
        }
    });
    // gulp.watch("./build").on("change", browserSync.reload);
}

// watch
function watch() {
    gulp.watch(paths.pug.watch, gulp.series(templates, inline, reload));
    gulp.watch(paths.styles.watch, gulp.series(styles, inline, reload));
}

function reload(done){
    browserSync.reload();
    done();
}

exports.templates = templates;
exports.styles = styles;
exports.inline = inline;
exports.clean = clean;
exports.serve = serve;
exports.watch = watch;

gulp.task('default', gulp.series(
    clean,
    gulp.parallel(
      styles,
      templates
    ),
    inline,
    gulp.parallel(
      watch,
      // serve
    )
));
