var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var open = require('open');
var autoprefixer = require('autoprefixer');
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync').create();
var minimist = require('minimist');

var envOptions = {
    string: 'env',
    default: {
        env: 'serve-dev'
    }
}
var options = minimist(process.argv.slice(2), envOptions);
var isDev = options.env === 'serve-dev';
var isBuild = options.env === 'build';
console.log('mode: ', options.env);

gulp.task('copyHTML', function (done) {
    return gulp.src('./source/**/*.html')
        .pipe($.stripComments())
        .pipe(gulp.dest('./public/'))
        .pipe(browserSync.reload({
            stream: true
        }));
    // .pipe($.connect.reload());
});

// 解析less
gulp.task('less', function () {
    var plugins = [
        autoprefixer({
            overrideBrowserslist: ['last 3 version']
        })
    ];
    return gulp.src('./source/less/**/*.less')
        .pipe($.less()) // less转为css
        // .pipe($.sourcemaps.init())
        .pipe($.postcss(plugins)) // 自动添加浏览器适应性前缀
        // .pipe($.sourcemaps.write('./map/css/'))
        .pipe($.concat('styles.css')) // 拼接css
        .pipe($.cleanCss()) // 压缩css
        .pipe($.rename({
            suffix: '.min'
        })) // 重命名
        .pipe(gulp.dest('./public/styles/'))
        .pipe(browserSync.reload({
            stream: true
        }));
    // .pipe($.connect.reload());
});

// 合并压缩js
gulp.task('js', function () {
    return gulp.src('./source/js/**/*.js')
        .pipe($.babel({
            presets: ['@babel/env']
        })) // ES6转为ES5
        .pipe($.concat('app.js')) // 合并js文件
        .pipe($.uglify()) // 压缩js文件
        .pipe($.rename({
            suffix: '.min'
        })) // 重命名
        .pipe(gulp.dest('./public/js/'))
        .pipe(browserSync.reload({
            stream: true
        }));
    // .pipe($.connect.reload());
});

// bower加载第三方依赖包
gulp.task('bower', function () {
    return gulp.src(mainBowerFiles())
        .pipe(gulp.dest('./.tmp/vendors'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// 合并第三方依赖包
gulp.task('vendors', gulp.series('bower', function () {
    return gulp.src('./.tmp/vendors/**/*.js')
        .pipe($.concat('lib.js'))
        .pipe($.uglify())
        .pipe($.rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./public/js/'))
        .pipe(browserSync.reload({
            stream: true
        }));
}));

// browser-sync
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: './public'
        }
    });
});

gulp.task('watch', function () {
    gulp.watch('./source/**/*.html', gulp.series('copyHTML'));
    gulp.watch('./source/less/*.less', gulp.series('less'));
    gulp.watch('./source/js/*.js', gulp.series('js'));
});

// gulp.task('server', function () {
//     $.connect.server({
//         root: './public/',
//         livereload: true,
//         port: 5000
//     });

//     open('http://localhost:5000');
// });

gulp.task('clean', function () {
    return gulp.src(['./.tmp', './public'], {
            read: false,
            allowEmpty: true
        })
        .pipe($.clean());
});

// 部署到github pages
gulp.task('deploy', function () {
    return gulp.src('./public/**/*')
        .pipe($.ghPages());
});

gulp.task('build', gulp.series('clean',
    gulp.parallel('copyHTML', 'less', 'js', 'vendors')));

gulp.task('default', gulp.series(
    'clean',
    gulp.parallel('copyHTML', 'less', 'js', 'vendors'),
    gulp.parallel('browser-sync', 'watch')));
