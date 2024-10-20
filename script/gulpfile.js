/*
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Copyright 2023 Xyna GmbH, Germany
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
import gulp from 'gulp';
import concat from 'gulp-concat';
import clean from 'gulp-clean';
import replace from 'gulp-replace';
import zip from 'gulp-zip';
import rsync from 'gulp-rsync';
import { exec } from 'child_process';


let serverConfig = {};
try {
    if (fs.existsSync('./server.json')) {
        const data = fs.readFileSync('./server.json', 'utf8');
        serverConfig = JSON.parse(data);
    }
} catch (err) {
    console.error('Fehler beim Laden der server.json:', err);
}


// Konfigurationen
const config = {
    appTitle: "Modeller",
    appName: "modeller",
    baseUrl: "/modeller/",
    buildDir: process.argv.indexOf('--buildDir') >= 0 ? process.argv[process.argv.indexOf('--buildDir') + 1] : ".",
    releaseDir: process.argv.indexOf('--releaseDir') >= 0 ? process.argv[process.argv.indexOf('--releaseDir') + 1] : "../dist",
    releaseVersion: require('./package.json').version || "1.0.0",
    serverConfig: serverConfig,
    develOptions: {
        autoPageReload: false
    }
};

// Task: Clean
gulp.task('clean', function () {
    return gulp.src([`${config.buildDir}/../impl/dist/xyna/browser/`, `${config.releaseDir}`], { read: false, allowEmpty: true })
        .pipe(clean());
});

// Task: Concat
gulp.task('concat', function () {
    return gulp.src(['./copyrightheader.js', './_main.js'])
        .pipe(concat('_main_w_copyright.js'))
        .pipe(gulp.dest('.'));
});

// Task: Replace title and baseurl
gulp.task('replace-title', function () {
    return gulp.src(`${config.buildDir}/../impl/dist/xyna/browser/WEB-INF/web.xml`)
        .pipe(replace('TEMPLATE_APP_TITLE', config.appTitle))
        .pipe(replace('TEMPLATE_APP_NAME', config.appName))
        .pipe(gulp.dest(`${config.buildDir}/../impl/dist/xyna/browser/WEB-INF`));
});

gulp.task('replace-baseurl', function () {
    return gulp.src(`${config.buildDir}/../impl/dist/xyna/browser/index.html`)
        .pipe(replace(/<base href=\".*\">/g, `<base href="${config.baseUrl}">`))
        .pipe(gulp.dest(`${config.buildDir}/../impl/dist/xyna/browser`));
});

gulp.task('replace-baseurl-dev', function () {
    return gulp.src(`${config.buildDir}/../impl/dist/xyna/browser/index.html`)
        .pipe(replace(/<base href=\"\/\">/g, '<base href=".">'))
        .pipe(gulp.dest(`${config.buildDir}/../impl/dist/xyna/browser`));
});

// Task: Compress
gulp.task('compress', function () {
    return gulp.src(`${config.buildDir}/../impl/dist/xyna/browser/**/*`)
        .pipe(zip(`${config.appName}.war`))
        .pipe(gulp.dest(config.releaseDir));
});

// Task: Rsync
gulp.task('deploy-api-doc', function () {
    return gulp.src(`${config.buildDir}/../api/dist/**`)
        .pipe(rsync({
            root: `${config.buildDir}/../api/dist/`,
            hostname: `${config.serverConfig.username}@${config.serverConfig.host}`,
            destination: `${config.serverConfig.develTargetPath}/api/`,
            recursive: true,
            delete: true
        }));
});

gulp.task('deploy-modeller', function () {
    return gulp.src(`${config.buildDir}/../impl/dist/xyna/browser/**`)
        .pipe(rsync({
            root: `${config.buildDir}/../impl/dist/xyna/browser/`,
            hostname: `${config.serverConfig.username}@${config.serverConfig.host}`,
            destination: `${config.serverConfig.develTargetPath}/impl/`,
            recursive: true,
            delete: true
        }));
});

gulp.task('deploy-war', function () {
    return gulp.src(`${config.releaseDir}/${config.appName}.war`)
        .pipe(rsync({
            root: config.releaseDir,
            hostname: `${config.serverConfig.username}@${config.serverConfig.host}`,
            destination: config.serverConfig.warPath,
            recursive: true,
            delete: true
        }));
});

// Helper: Externes Kommando ausführen
function runCommand(command, options, cb) {
    exec(command, options, function (err, stdout, stderr) {
        console.log(stdout);
        if (err) {
            console.error(`Error: ${err}`);
            return;
        }
        cb();
    });
}

// Task: build-api-doc
gulp.task('build-api-doc', function (cb) {
    runCommand('npm run apidoc', { cwd: '../api' }, cb);
});

// Task: build-modeller
gulp.task('build-modeller', function (cb) {
    runCommand('npm run build', { cwd: '../impl' }, cb);
});

// Task: release-modeller
gulp.task('release-modeller', function (cb) {
    runCommand('npm run release', { maxBuffer: 500 * 1024, cwd: '../impl' }, cb);
});

// Task: Default
gulp.task('default', gulp.series('clean', 'build-modeller', 'replace-baseurl-dev', 'replace-title', 'concat'));

// Task: Release
gulp.task('release', gulp.series('clean', 'build-modeller', 'replace-baseurl', 'concat', 'compress'));

// Task: Deploy
gulp.task('deploy', gulp.series('deploy-api-doc', 'deploy-modeller'));

// Task: Release and Deploy
gulp.task('release-and-deploy', gulp.series('release', 'deploy-api-doc', 'deploy-war'));

// Watch Task
gulp.task('watch', function () {
    gulp.watch(`${config.buildDir}/../api/dist/**/*.*`, gulp.series('deploy-api-doc'));
});
