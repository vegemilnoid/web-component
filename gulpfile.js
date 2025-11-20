import config from './package.json' with { type: 'json' };

import fs from 'node:fs';
import path from 'node:path';

import gulp from 'gulp';
import less from 'gulp-less';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import server from 'gulp-server-livereload';
import { deleteAsync } from 'del';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-providers';

import Confirm from 'prompt-confirm';
import mime from 'mime-types';
import { glob } from 'glob';
import cliProgress from 'cli-progress';

const name = config.name;
const version = config.version;
const source = 'app/source';
const distribution = 'app/distribution';

const sass = gulpSass(dartSass);

const location = {
  script: `${source}/script/**/*.js`,
  style: `${source}/style/**/*.scss`,
  image: `${source}/image/**/*.*`,
  api: `${source}/api/**/*.*`,
  library: `${source}/library/**/*.*`,
  static: `${source}/static/**/*.*`,
  template: `${source}/template/**/*.*`,
  html: `${source}/html/**/*.*`
};

export const clean = () => {
  return deleteAsync([distribution]);
};

export const transpileStyle = () => {
  ensureDirectory(extractDirectoryFromGlob(location.style));

  return gulp.src(location.style)
    .pipe(sass())
    .pipe(concat(`${name}-${version}.min.css`))
    .pipe(less())
    .pipe(cleanCSS())
    .pipe(gulp.dest(`${distribution}/style`));
};

export const concatScript = () => {
  ensureDirectory(extractDirectoryFromGlob(location.script));

  return gulp.src(location.script, { sourcemaps: true })
    .pipe(concat(`${name}-${version}.js`))
    .pipe(gulp.dest(`${distribution}/script`, { sourcemaps: true }));
};

export const transpileScript = () => {
  ensureDirectory(extractDirectoryFromGlob(location.script));

  return gulp.src(location.script, { sourcemaps: true })
    .pipe(uglify())
    .pipe(concat(`${name}-${version}.min.js`))
    .pipe(gulp.dest(`${distribution}/script`));
};

export const copyHTML = () => {
  ensureDirectory(extractDirectoryFromGlob(location.html));

  return gulp.src(location.html).pipe(gulp.dest(`${distribution}/`));
};

export const copyTemplate = () => {
  ensureDirectory(extractDirectoryFromGlob(location.template));

  return gulp.src(location.template, { encoding: false }).pipe(gulp.dest(`${distribution}/template`));
};

export const copyStatic = () => {
  ensureDirectory(extractDirectoryFromGlob(location.static));

  return gulp.src(location.static, { encoding: false }).pipe(gulp.dest(`${distribution}/static`));
};

export const copyImage = () => {
  ensureDirectory(extractDirectoryFromGlob(location.image));

  return gulp.src(location.image, { encoding: false }).pipe(gulp.dest(`${distribution}/image`));
};

export const copyAPI = () => {
  ensureDirectory(extractDirectoryFromGlob(location.api));

  return gulp.src(location.api).pipe(gulp.dest(`${distribution}/api`));
};

export const copyLibrary = () => {
  ensureDirectory(extractDirectoryFromGlob(location.library));

  return gulp.src(location.library).pipe(gulp.dest(`${distribution}/script`));
};

export const build = gulp.series(clean, concatScript, transpileScript, gulp.parallel(copyHTML, copyTemplate, copyStatic, copyImage, copyAPI, copyLibrary, transpileStyle));

export const watch = () => {
  gulp.watch(location.script, gulp.series(concatScript, transpileScript));
  gulp.watch(location.api, copyAPI);
  gulp.watch(location.library, copyLibrary);
  gulp.watch(location.style, transpileStyle);
  gulp.watch(location.image, copyImage);
  gulp.watch(location.html, copyHTML);
  gulp.watch(location.template, copyTemplate);
};

export const serve = () => {
  return gulp.src(`${distribution}/`).pipe(server({
    livereload: {
      enable: true,
      clientConsole: true
    },
    defaultFile: 'index.html',
    fallback: 'index.html',
    directoryListing: true,
    open: true,
    host: 'localhost',
    port: 443,
    https: {
      key: 'server.key',
      cert: 'server.cert'
    }
  }));
};

export const run = gulp.series(build, serve, watch);

export const deployDevelopment = done => {
  const bucket = 'dev.static.cloud.sbs.co.kr';

  new Confirm(`Do you want deploy \'${name} ${version}\' to \'${bucket}\'?`).ask(async confirmed => {
    if(!confirmed) {
      done();

      return;
    }

    const targets = glob.sync(`${distribution}/**/*`);
    const singleBar = new cliProgress.SingleBar({ format: '{bar} | {value}/{total} | ETA: {eta}s | {key}'}, cliProgress.Presets.shades_classic);

    singleBar.start(targets.length, 0);

    const s3 = new S3Client({
      region: 'ap-northeast-2',
      credentials: fromIni({ profile: 'dev' })
    });

    for(const target of targets) {
      if(fs.lstatSync(target).isFile()) {
        const key = target.replace(/\\/g, '/').replace(`${distribution}/`, 'program-desktop/');

        const sent = await s3.send(new PutObjectCommand({
          'ACL': 'public-read',
          'Bucket': bucket,
          'Key': key,
          'Body': fs.readFileSync(target),
          'ContentType': mime.lookup(target)
        }));

        // console.log(sent);

        singleBar.update(targets.indexOf(target) + 1, { key: key });
      }
    }

    singleBar.stop();

    done();
  });
};

export const deployProduction = done => {
  const bucket = 'static.cloud.sbs.co.kr';

  new Confirm(`Do you want deploy \'${name} ${version}\' to \'${bucket}\'?`).ask(async confirmed => {
    if(!confirmed) {
      done();

      return;
    }

    const targets = glob.sync(`${distribution}/**/*`);
    const singleBar = new cliProgress.SingleBar({ format: '{bar} | {value}/{total} | ETA: {eta}s | {key}'}, cliProgress.Presets.shades_classic);

    singleBar.start(targets.length, 0);

    const s3 = new S3Client({
      region: 'ap-northeast-2',
      credentials: fromIni({ profile: 'default' })
    });

    for(const target of targets) {
      if(fs.lstatSync(target).isFile()) {
        const key = target.replace(/\\/g, '/').replace(`${distribution}/`, 'program-desktop/');

        const sent = await s3.send(new PutObjectCommand({
          'ACL': 'public-read',
          'Bucket': bucket,
          'Key': key,
          'Body': fs.readFileSync(target),
          'ContentType': mime.lookup(target)
        }));

        // console.log(sent);

        singleBar.update(targets.indexOf(target) + 1, { key: key });
      }
    }

    singleBar.stop();

    done();
  });
};

export const deployPublish = done => {
  const bucket = "sbs-pub-test";
  
  new Confirm(`Do you want deploy \'${name} ${version}\' to \'${bucket}\'?`).ask(async confirmed => {
    if(!confirmed) {
      done();
      
      return;
    }
    
    const targets = glob.sync(`${distribution}/**/*`);
    const singleBar = new cliProgress.SingleBar({ format: '{bar} | {value}/{total} | ETA: {eta}s | {key}' }, cliProgress.Presets.shades_classic);
    
    singleBar.start(targets.length, 0);
    
    const s3 = new S3Client({
      region: 'ap-northeast-2',
      credentials: fromIni({ profile: 'dev' }),
    });
    
    for(const target of targets) {
      if(fs.lstatSync(target).isFile()) {
        const key = target.replace(/\\/g, '/').replace(`${distribution}/`, '');
        // const key = target.replace(/\\/g, '/').replace(`${distribution}/`, '');
        
        const sent = await s3.send(new PutObjectCommand({
          ACL: 'public-read',
          Bucket: bucket,
          Key:  `program-component-pc/${key}`,
          Body: fs.readFileSync(target),
          ContentType: mime.lookup(target),
        }));
        
        // console.log(sent);
        
        singleBar.update(targets.indexOf(target) + 1, { key: key });
      }
    }
    
    singleBar.stop();
    
    done();
  });
};

/**
 * Ensures that the specified directory exists. If the directory does not exist, it is created.
 * Utilizes recursive creation to ensure all necessary parent directories are also created.
 *
 * @param {string} directory - The path of the directory to ensure.
 * @throws {Error} If there is an issue while creating the directory.
 */
const ensureDirectory = directory => {
  const resolvedDirectory = path.resolve(directory);

  if(fs.existsSync(resolvedDirectory)) {
    return;
  }

  fs.mkdirSync(resolvedDirectory, { recursive: true });
};

/**
 * Extracts the directory path from a given glob pattern.
 *
 * This function processes a glob pattern and removes any negation prefixes,
 * normalizes slashes to forward slashes, collapses multiple slashes,
 * and removes glob-specific tokens such as "**".
 * It subsequently identifies and extracts the directory portion
 * of the path up to the first occurrence of any glob meta characters.
 *
 * @param {string} pattern - The glob pattern from which to extract the directory path.
 * @returns {string} The extracted directory path. If the pattern starts with a root slash,
 * the returned path will also maintain it as absolute; otherwise, it will be relative.
 */
const extractDirectoryFromGlob = pattern => {
  const removedNegation = pattern.replace(/^!+/, '');
  const normalizedSlashes = removedNegation.replace(/\\/g, '/').replace(/\/+/g, '/');
  const withoutGlobStar = normalizedSlashes.replace(/(^|\/)\*\*($|\/)/g, '/');

  const pathSegments = withoutGlobStar.split('/').filter(Boolean);
  const globMetaRegex = /[*?[\]{}()!+@]/;

  const directorySegments = [];

  for(const segment of pathSegments) {
    if(globMetaRegex.test(segment)) {
      break;
    }

    directorySegments.push(segment);
  }

  const isAbsolute = withoutGlobStar.startsWith('/');
  const directoryPath = directorySegments.join('/');

  return `${isAbsolute ? '/' : ''}${directoryPath}`;
};