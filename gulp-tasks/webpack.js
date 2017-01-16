var gulp = require('gulp');
var webpackStream = require('webpack-stream');
var webpack = require('webpack');
var rev = require('gulp-rev');
var plumber = require('gulp-plumber');
var del = require('del');
var named = require('vinyl-named');

gulp.task('clean-build', function () {
    return del(paths.distScripts);
});

gulp.task('webpack', ['clean-build'], function(cb) {
    var config = {
        output: {
            filename: "app.js"
        },
        resolve: {
            extensions: ['', '.js', '.jsx'],
            alias: {
                TweenLite: "gsap/src/uncompressed/TweenLite.js",
                TweenMax: "gsap/src/uncompressed/TweenMax.js",
            }
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new webpack.ProvidePlugin({
                jQuery: 'jquery',
                $: 'jquery',
                jquery: 'jquery',
                TweenLite: 'TweenLite',
                TweenMax: 'TweenMax'
            })
        ],
        descriptionFiles: ["package.json"],
        module: {
            loaders: [
                { test: /\.css$/, loader: "style!css" },
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel-loader'
                },
                {
                    test: /\.jsx$/,
                    exclude: /(node_modules|bower_components)/,
                    loaders: ['react-hot', 'babel']
                }
            ]
        }
    };

    if (process.env.NODE_ENV === 'production') {
        config.plugins.push(new webpack.optimize.UglifyJsPlugin());
        config.plugins.push(new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }));
        console.log('Uglified scripts.');
    } else {
        config.devtool = "eval";
        console.log('With eval source maps.');
    }

    return gulp.src(paths.entry)
        .pipe(plumber({
            handleError: function (err) {
                cb(err);
            }
        }))
        .pipe(named())
        .pipe(webpackStream(config))
        .pipe(rev())
        .pipe(gulp.dest(paths.distScripts));
});
