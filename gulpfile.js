const twig = require ('gulp-twig');
const sass = require ('gulp-sass');
const cssnano = require ('gulp-cssnano');
const plumber = require ("gulp-plumber");
const gulp = require ('gulp');
const clean = require ('del');
const rename = require ('gulp-rename');
// const gulpWebpack = require ('gulp-webpack');
const autoprefixer = require ('gulp-autoprefixer');
const browserSync = require ('browser-sync').create();
const notify = require ("gulp-notify");
const svgSprite = require("gulp-svg-sprite");
const cmq = require ("gulp-group-css-media-queries");
const spritesmith = require('gulp.spritesmith');
// const webpack = require ('webpack');
const gulpif = require("gulp-if");
// const webpackConfig = require ('./webpack.config.js');
const imagemin = require("gulp-imagemin");
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const prettyHtml = require('gulp-pretty-html');

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
        dest: './build/assets/images'
    },
    png:{
        src: './src/assets/images/pngicons/*.png',
        spritedest: './build/assets/images/'
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
        // css: { 
        //     dest: '.',
        //     bust: false,
        //     sprite: '../images/icons/sprite.svg',
        //     layout: 'vertical',
        //     prefix: '.icon-',
        //     dimensions: true,
        //     render: {
        //         scss: {
        //             dest: '_sprite.scss',
        //         }
        //     }
        // },
        symbol: {
            dest: '.', // destination folder
            bust: false,
            sprite: 'svgicons/sprite.svg', //generated sprite name,
            prefix: '.svg-', // BEM-style prefix if styles rendered
            dimensions: "-icon",
            render: {
                css: false,
                scss: false
                // scss: {
                //     dest: '_sprite.scss',
                // }
            },
            // example: true  Build a sample page, please!
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

// favicon
function favicon() {
    return gulp.src('./src/assets/images/favicon/favicon.ico')
        .pipe(gulp.dest('./build/assets/images/favicon/'));
}

// fonts
function fonts (){
    return gulp.src(urls.fonts.src)
        .pipe(gulp.dest(urls.fonts.dest));
}

// svg sprites
function spriteSvg (){
    return gulp.src(urls.svg.src)
    .pipe(svgSprite(config))
    .pipe(gulpif('*.scss', gulp.dest('./src/assets/styles/common'), gulp.dest(urls.svg.dest)));
}

// png sprites
function spritePng (){
    return spriteData = gulp.src(urls.png.src)
        .pipe(spritesmith({
            imgName: '../images/pngicons/sprite.png',
            cssName: 'spritepng.css',
            padding: 10,
            cssVarMap: function (sprite) {
                sprite.name = 'png-' + sprite.name;
            }
        }))
        .pipe(gulpif('*.css', gulp.dest('./src/assets/styles/common'), gulp.dest(urls.png.spritedest)))    
}

// watch
function watch (){
    gulp.watch(urls.templates.src, templates);
    gulp.watch(urls.styles.src, styles);
    gulp.watch(urls.scripts.all, scriptsConcat);
    gulp.watch(urls.svg.src, gulp.series(spriteSvg, gulp.parallel(styles)));
    gulp.watch(urls.png.src, gulp.series(spritePng, gulp.parallel(styles)));
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
        .pipe(prettyHtml())
        .pipe(gulp.dest(urls.templates.dest))
}

// pretty html
// function prettyMarkup (){
//     return gulp.src('./build*.html')
//         .pipe(prettyHtml())
//         .pipe(gulp.dest(urls.templates.dest))
// }

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
// function scripts (){
//     return gulp.src(urls.scripts.src)
//         .pipe(gulpWebpack(webpackConfig, webpack))
//         .pipe(rename("app.min.js"))
//         .pipe(gulp.dest(urls.scripts.dest));
// }

function scriptsConcat (){
    return gulp.src([
        './node_modules/jquery/dist/jquery.min.js',
        './node_modules/gsap/src/minified/TweenMax.min.js',
        './src/assets/js/main.js'
    ])
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(urls.scripts.dest));
}

// clean
function del (){
    return clean(urls.root)
}

// export functions
exports.del = del;
exports.styles = styles;
// exports.scripts = scripts;
exports.scriptsConcat = scriptsConcat;
exports.templates = templates;
exports.spriteSvg = spriteSvg;
exports.spritePng = spritePng;
exports.favicon = favicon;
exports.imgOptimization = imgOptimization;

// default task gulp
gulp.task('default', gulp.series(
    del,
    spriteSvg,
    spritePng,
    favicon,
    gulp.parallel(styles, templates, scriptsConcat, fonts, imgOptimization),
    gulp.parallel(watch, server)
))