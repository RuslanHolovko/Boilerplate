const gulp = require ('gulp');
const twig = require ('gulp-twig');
const rename = require ('gulp-rename');
const sass = require ('gulp-sass');
const autoprefixer = require ('gulp-autoprefixer');
const cssnano = require ('gulp-cssnano');
const notify = require ("gulp-notify");
const plumber = require ("gulp-plumber");
const cmq = require ("gulp-group-css-media-queries");
const clean = require ('del');
const webpack = require ('webpack');
const gulpWebpack = require ('gulp-webpack');
const webpackConfig = require ('./webpack.config.js');
const browserSync = require ('browser-sync').create();
const svgSprite = require("gulp-svg-sprite");
const gulpif = require("gulp-if");
const imagemin = require("gulp-imagemin");

// base urls
const urls = {
    root: './build',
    templates : {
        pages: './src/views/pages/*.twig',
        src: './src/views/**/*.twig',
        dest: './build'
    },
    styles: {
        main: './src/assets/styles/main.sass',
        src: './src/assets/styles/**/*.sass',
        dest: './build/assets/styles',
    },
    scripts: {
        all: './src/assets/js/*.js',
        src: './src/assets/js/app.js',
        dest: './build/assets/js/'
    },
    svg: {
        src: './src/assets/images/icons/*.svg',
        srcsprites: './src/assets/images/sprites',
        dest: './build/assets/images',
    },
    images: {
        src: './src/assets/images/pictures/*',
        dest: './build/assets/images/pictures'
    },
    fonts: {
        src: './src/assets/fonts/**/*',
        dest: './build/assets/fonts'
    }
}

// svg sprites config
const config = {
    mode: {
        css: { 
            dest: '.',
            bust: false,
            sprite: '../images/icons/sprite.svg',
            layout: 'vertical',
            prefix: '.icon-',
            dimensions: true,
            render: {
                scss: {
                    dest: '_sprite.scss',
                }
            }
        }
    }
};

// image optimization
function imgOptimization() {
    return gulp.src(urls.images.src)
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 5,
        })) 
        .pipe(gulp.dest(urls.images.dest));
}

// fonts
function fonts (){
    return gulp.src(urls.fonts.src)
        .pipe(gulp.dest(urls.fonts.dest));
}

// svg sprites
function spriteNew (){
    return gulp.src(urls.svg.src)
    .pipe(svgSprite(config))
    .pipe(gulpif('*.scss', gulp.dest('./src/assets/styles/common'), gulp.dest(urls.svg.dest)));
}

// watch
function watch (){
    gulp.watch(urls.templates.src, templates);
    gulp.watch(urls.styles.src, styles);
    gulp.watch(urls.scripts.all, scripts);
    gulp.watch(urls.svg.src, gulp.series(spriteNew, gulp.parallel(styles)));
    gulp.watch(urls.images.src, imgOptimization);
    gulp.watch(urls.fonts.src, fonts);
}

// server
function server (){
    browserSync.init({
        server: {
            baseDir: urls.root
        }
    });
    browserSync.watch(urls.root, browserSync.reload)
}

// twig
function templates (){
    return gulp.src(urls.templates.pages)
        .pipe(twig())
        .pipe(gulp.dest(urls.templates.dest))
}

// sass
function styles (){
    return gulp.src(urls.styles.main)
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(sass().on("error", sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            cascade: false
        }))
        .pipe(cmq())
        // .pipe(cssnano())
        .pipe(rename("main.min.css"))
        .pipe(gulp.dest(urls.styles.dest))
}

// js
function scripts (){
    return gulp.src(urls.scripts.src)
        .pipe(gulpWebpack(webpackConfig, webpack))
        .pipe(rename("app.min.js"))
        .pipe(gulp.dest(urls.scripts.dest));
}

// clean
function del (){
    return clean(urls.root)
}

// export functions
exports.del = del;
exports.styles = styles;
exports.scripts = scripts;
exports.templates = templates;
exports.spriteNew = spriteNew;
exports.imgOptimization = imgOptimization;

// default task gulp
gulp.task('default', gulp.series(
    del,
    spriteNew,
    gulp.parallel(styles, templates, scripts, fonts, imgOptimization),
    gulp.parallel(watch, server)
))