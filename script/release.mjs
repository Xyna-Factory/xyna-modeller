import fs from "fs";
import { spawn, spawnSync } from "child_process";
import { ZipArchive } from "archiver";

const implDir = '../impl';
const buildDir = implDir.concat('/dist');
const mainDir = buildDir.concat('/xyna/browser');
const indexHtml = mainDir.concat('/index.html');
const webXML = mainDir.concat('/WEB-INF/web.xml');
const releaseDir = '../dist';
const copyrightHeader = './copyrightheader.js'

const appTitle = 'Modeller';
const appName = 'modeller';

main();

async function main() {

    console.log('Cleanup');
    cleanup();

    console.log('Lint');
    npmRun('lint');

    console.log('Release');
    npmRun('release');

    console.log('Replace href');
    replaceHref(appName);

    console.log('Inset App name in web.xml');
    replaceWebXml(appTitle, appName);

    console.log('Prepend Coppyright Header');
    await concatCoppyright();

    console.log('Build war file')
    await buildWar(appName);
}

function cleanup() {
    fs.rmSync(buildDir, { recursive: true, force: true });
    fs.rmSync(releaseDir, { recursive: true, force: true });
}

function npmRun(command) {

	spawnSync('npm', ['run', command] , {
		cwd: implDir,
		stdio: 'inherit',
		shell: true
	});
}

function replaceHref(baseurl) {

    const data = fs.readFileSync(indexHtml, 'utf8')
    const replaced = data.replace(/^(\s*<base href=").*(">\s*)$/gm, ''.concat('$1', baseurl, '$2'));
    fs.writeFileSync(indexHtml, replaced);
}

function replaceWebXml(title, name) {

    const data = fs.readFileSync(webXML, 'utf8')
    let replaced = data.replaceAll('@@TEMPLATE_APP_TITLE', title);
    replaced = replaced.replaceAll('@@TEMPLATE_APP_NAME', name);
    fs.writeFileSync(webXML, replaced);
}

function findMainJs() {
    let files = fs.readdirSync(mainDir);
    files = files.filter((path) => path.includes('main'));
    if (files.length !== 1) {
        throw 'main.js not found';
    }
    return mainDir.concat('/', files[0]);
}

function concatCoppyright() {

    const tmpMainJs = mainDir.concat('tmp.js');

    const destStream = fs.createWriteStream(tmpMainJs, { flags: "a" });
    const ret = new Promise((resolve, reject) => {
        destStream.on("finish", resolve);
        destStream.on("error", reject);
    });

    fs.createReadStream(copyrightHeader)

    const readStream = fs.createReadStream(copyrightHeader);
    readStream.pipe(destStream, { end: false });

    readStream.on("end", () => {
        fs.createReadStream(findMainJs()).pipe(destStream);
    });

    destStream.on("finish", () => {
        fs.copyFileSync(tmpMainJs, findMainJs());
        fs.rmSync(tmpMainJs);
    });

    return ret;
}

function buildWar(baseurl) {
    fs.mkdirSync(releaseDir.concat('/'), { recursive: true });
    const output = fs.createWriteStream(releaseDir.concat('/', baseurl, '.war'), { flags: "a" });
    const ret = new Promise((resolve, reject) => {
        output.on("finish", resolve);
        output.on("error", reject);
    });

    const archive = new ZipArchive("zip", {
        zlib: { level: 9 }
    });

    archive.on("warning", function (err) {
        if (err.code === "ENOENT") {
            console.log(err)
        } else {
            throw err;
        }
    });

    archive.on("error", function (err) {
        throw err;
    });

    archive.pipe(output);

    archive.directory(buildDir, false);

    return archive.finalize();
}

