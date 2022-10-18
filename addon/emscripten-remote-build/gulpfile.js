const gulp = require('gulp');
const nls = require('vscode-nls-dev');
const es = require('event-stream');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const typescript = require('typescript');
const tsProject = ts.createProject('./tsconfig.json', { typescript });
const filter = require('gulp-filter');

const languages = [
    { id: "ja", folderName: "jpn" },
];

const jsonSchemaFilesPatterns = [
    "*.schema.json"
];

// Generate package.nls.*.json files from: ./i18n/*/package.i18n.json
// Outputs to root path, as these nls files need to be along side package.json
const generateAdditionalLocFiles = () => {
    return gulp.src(['package.nls.json'])
        .pipe(nls.createAdditionalLanguageFiles(languages, 'i18n'))
        .pipe(gulp.dest('.'));
};

// Generates ./dist/nls.bundle.<language_id>.json from files in ./i18n/** *//<src_path>/<filename>.i18n.json
// Localized strings are read from these files at runtime.
const generateSrcLocBundle = () => {
    // Transpile the TS to JS, and let vscode-nls-dev scan the files for calls to localize.
    return tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject()).js
        .pipe(nls.createMetaDataFiles())
        .pipe(nls.createAdditionalLanguageFiles(languages, "i18n"))
        .pipe(nls.bundleMetaDataFiles('emscripten-remote-build', 'dist'))
        .pipe(nls.bundleLanguageFiles())
        .pipe(filter(['**/nls.bundle.*.json', '**/nls.metadata.header.json', '**/nls.metadata.json']))
        .pipe(gulp.dest('dist'));
};

const generateLocalizedJsonSchemaFiles = () => {
    return es.through(function (file) {
        let jsonTree = JSON.parse(file.contents.toString());
        languages.map((language) => {
            let stringTable = {};
            // Try to open i18n file for this file
            let relativePath = removePathPrefix(file.path, file.cwd);
            let locFile = path.join("./i18n", language.folderName, relativePath + ".i18n.json");
            if (fs.existsSync(locFile)) {
                stringTable = jsonc.parse(fs.readFileSync(locFile).toString());
            }
            // Entire file is scanned and modified, then serialized for that language.
            // Even if no translations are available, we still write new files to dist/schema/...
            let keyPrefix = relativePath + ".";
            keyPrefix = keyPrefix.replace(/\\/g, "/");
            let descriptionCallback = (path, value, parent) => {
                if (stringTable[keyPrefix + path]) {
                    if (!parent.markdownDescription)
                        parent.description = stringTable[keyPrefix + path];
                    else
                        parent.markdownDescription = stringTable[keyPrefix + path];
                }
            };
            traverseJson(jsonTree, descriptionCallback, "");
            let newContent = JSON.stringify(jsonTree, null, '\t');
            this.queue(new vinyl({
                path: path.join("schema", language.id, relativePath),
                contents: Buffer.from(newContent, 'utf8')
            }));
        });
    });
};

// Generate localized versions of JSON schema files
// Check for corresponding localized json file in i18n
// Generate new version of the JSON schema file in dist/schema/<language_id>/<path>
const generateJsonSchemaLoc = () => {
    return gulp.src(jsonSchemaFilesPatterns)
        .pipe(generateLocalizedJsonSchemaFiles())
        .pipe(gulp.dest('dist'));
};

gulp.task('translations-generate', gulp.series(generateSrcLocBundle, generateAdditionalLocFiles, generateJsonSchemaLoc));
