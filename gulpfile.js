require('dotenv').config();

const gulp = require('gulp');
const concat = require('gulp-concat');
const fs = require('fs');
const print = require('gulp-print').default;
const minify = require('gulp-minify');
const gulpif = require('gulp-if');
const cleanCss = require('gulp-clean-css');
const flatten = require('gulp-flatten');
const sass = require('gulp-sass')(require('sass'));
const del = require('del');
const vinylPaths = require('vinyl-paths');
const path = require('path');

const minifyOptions = {
  ext: {
    min: '.js'
  },
  noSource: true,
  mangle: true,
  // Ignore these files during JS minifying
  // (most likely because they are already minified)
  ignoreFiles: [
    'predictive-search.js',
    'global.js',
    'customer.js',
    'color-swatches.js',
    'cart.js',
    'vendor-v4.js',
    '-min.js'
  ]
};

const paths = {
  src: {
    folder: 'src',
    files: 'src/**/*',
    js: 'src/assets/*.js',
    css: 'src/assets/*.css',
    scss: 'src/assets/*.scss',
    assets: 'src/assets/*',
    assets_dir: 'src/assets',
    config: 'src/config/*',
    config_dir: 'src/config',
    layout: 'src/layout/*',
    layout_dir: 'src/layout',
    locales: 'src/locales/*',
    locales_dir: 'src/locales',
    sections: 'src/sections/*',
    section_groups: 'src/sections/*.json',
    sections_dir: 'src/sections',
    snippets: 'src/snippets/*',
    snippets_dir: 'src/snippets',
    templates: 'src/templates/*',
    templates_dir: 'src/templates',
    templates_customers: 'src/templates/customers/*',
    templates_customers_dir: 'src/templates/customers',
  },
  store: {
    config: `stores/${process.env.STORE}/config/*.*`,
    config_dir: `stores/${process.env.STORE}/config`,
    sections_dir: `stores/${process.env.STORE}/sections`,
    layout: `stores/${process.env.STORE}/layout/*`,
    layout_dir: `stores/${process.env.STORE}/layout`,
    locales: `stores/${process.env.STORE}/locales/*`,
    locales_dir: `stores/${process.env.STORE}/locales`,
    templates: `stores/${process.env.STORE}/templates/*`,
    templates_dir: `stores/${process.env.STORE}/templates`,
    templates_customers: `stores/${process.env.STORE}/templates/customers/*`,
    templates_customers_dir: `stores/${process.env.STORE}/templates/customers`,
  },
  dist: {
    folder: 'dist',
    files: 'dist/**/*',
    assets: 'dist/assets',
    config: 'dist/config',
    layout: 'dist/layout',
    locales: 'dist/locales',
    sections: 'dist/sections',
    snippets: 'dist/snippets',
    templates: 'dist/templates',
    templates_customers: 'dist/templates/customers',
  },
  download: {
    folder: 'download',
    files: 'download/**/*',
    not_scripts: '!download/assets/*.js',
    not_config: '!download/config/**/*',
    not_locales: '!download/locales/**/*',
    not_snippets: '!download/snippets/**/*',
    not_templates: '!download/templates/**/*',
    not_sections: '!download/sections/**/*',
    not_layout: '!download/layout/**/*',
    assets: 'download/assets/*.*',
    assets_dir: 'download/assets',
    config: 'download/config/*.*',
    config_dir: 'download/config',
    config_files: 'download/config/**/*',
    layout: 'download/layout',
    locales: 'download/locales/*.*',
    locales_dir: 'download/locales',
    locales_files: 'download/locales/**/*',
    sections: 'download/sections/*.*',
    sections_dir: 'download/sections',
    snippets: 'download/snippets/*.*',
    snippets_dir: 'download/snippets',
    templates: 'download/templates/*.*',
    templates_dir: 'download/templates',
    layout: 'download/layout/*.*',
    layout_dir: 'download/layout',
    templates_customers: 'download/templates/customers/*.*',
    templates_customers_dir: 'download/templates/customers',
  },
  concat: {
    folder: 'concat',
    files: 'concat/**/*',
  },
};

/**
 * WATCH and BUILD functions
 */

// Minify JS files if necessary and copy
gulp.task('copy:js', function () {
  return gulp
    .src([paths.src.js])
    .pipe(gulpif(process.env.MINIMIZE_JS == 'true', minify(minifyOptions)))
    .pipe(print())
    .pipe(gulp.dest(paths.dist.assets));
});

/**
 * COPY CSS AND SCSS FILES TO DIST FOLDER
 * 
 * If a css file has a corresponding .custom.scss file, it will process the scss file
 * and merge the two files in a single .css before sending to the dist folder
 * */
gulp.task('copy:css', function (done) {
  const assetsDirPath = paths.src.assets_dir.concat('/');
        // .scss and .css extension files
        stylingFiles = fs.readdirSync(paths.src.assets_dir, { withFileTypes: true }).filter(item => ! item.isDirectory() && item.name.indexOf('css') >= 0).map(item => item.name),
        
        // Your standard css files
        cssFiles = stylingFiles.filter(item => item.indexOf('.css') >= 0),
        
        // Non custom scss files - scss files created for new sections, e.g. section-product-content.scss
        nonCustomScssFiles = stylingFiles.filter(item => item.indexOf('.custom.') < 0 && item.indexOf('scss') >= 0).map(item => `${ paths.src.assets_dir }/${ item }`),

        // Custom scss files and their corresponding base css files, e.g. section-main-product.custom.scss, section-main-product.css
        customScssFiles = stylingFiles.filter(item => item.indexOf('.custom.scss') >= 0),
        cssFilesWithCustomScss = cssFiles.filter(item => customScssFiles.indexOf(item.replace('.css', '.custom.scss')) >= 0),

        // CSS that do not have a corresponding custom.scss file
        cssFilesWithoutCustomScss = cssFiles.filter(item => customScssFiles.indexOf(item.replace('.css', '.custom.scss')) < 0).map(item => `${ paths.src.assets_dir }/${ item }`);
  
  // First we go through all the css with no corresponding .custom.scss file and other non-custom scss files
  gulp.src(cssFilesWithoutCustomScss.concat(nonCustomScssFiles))
      .pipe(sass())
      .pipe(flatten())
      .pipe(gulpif(process.env.MINIMIZE_CSS == 'true', cleanCss()))
      .pipe(gulp.dest(paths.dist.assets));

  // Then we go through all the custom scss files
  customScssFiles.forEach(scssFile => {
    // Replace the custom.scss from the filename to get the original css name
    var cssFile = scssFile.replace('custom.scss', 'css'),
        filesToConcat = [assetsDirPath.concat(cssFile), assetsDirPath.concat(scssFile)];

    // Merge the original css and the scss and copy to concat folder
    gulp.src(filesToConcat, { allowEmpty: true })
        .pipe(concat(cssFile))
        .pipe(sass())
        .pipe(flatten())
        .pipe(gulpif(process.env.MINIMIZE_CSS == 'true', cleanCss()))
        .pipe(gulp.dest(paths.dist.assets));
  });

  done();
});

// Copy all other theme files
gulp.task('copy:assets', function (done) {
  gulp.src([paths.src.assets,'!src/assets/*.js','!src/assets/*.css','!src/assets/*.scss']).pipe(flatten()).pipe(gulp.dest(paths.dist.assets));
  done();
});

gulp.task('copy:layout', function (done) {
  gulp.src(paths.src.layout).pipe(flatten()).pipe(gulp.dest(paths.dist.layout));
  done();
});

gulp.task('copy:sections', function (done) {
  gulp.src(paths.src.sections).pipe(flatten()).pipe(gulp.dest(paths.dist.sections));
  done();
});

gulp.task('copy:snippets', function (done) {
  gulp.src(paths.src.snippets).pipe(flatten()).pipe(gulp.dest(paths.dist.snippets));
  done();
});

gulp.task('copy:config', function (done) {
  return gulp.src(paths.src.config).pipe(gulp.dest(paths.dist.config));
});

gulp.task('copy:locales', function (done) {
  return gulp.src(paths.src.locales).pipe(gulp.dest(paths.dist.locales));
});

gulp.task('copy:templates', function (done) {
  return gulp.src(paths.src.templates).pipe(gulp.dest(paths.dist.templates));
});

gulp.task('copy:templates:customers', function () {
  return gulp.src(paths.src.templates_customers).pipe(gulp.dest(paths.dist.templates_customers));
});

// Copy store-specific files
gulp.task('copy:config:store', function (done) {
  return gulp.src(paths.store.config).pipe(gulp.dest(paths.dist.config));
});

gulp.task('copy:layout:store', function (done) {
  gulp.src(paths.store.layout).pipe(flatten()).pipe(gulp.dest(paths.dist.layout));
  done();
});

gulp.task('copy:locales:store', function (done) {
  return gulp.src(paths.store.locales).pipe(gulp.dest(paths.dist.locales));
});

gulp.task('copy:templates:store', function (done) {
  return gulp.src(paths.store.templates).pipe(gulp.dest(paths.dist.templates));
});

gulp.task('copy:templates:customers:store', function () {
  return gulp.src(paths.store.templates_customers).pipe(gulp.dest(paths.dist.templates_customers));
});

gulp.task(
  'copy',
  gulp.series([
    'copy:js',
    'copy:css',
    'copy:assets',
    'copy:config',
    'copy:config:store',
    'copy:layout',
    'copy:layout:store',
    'copy:locales',
    'copy:locales:store',
    'copy:sections',
    'copy:snippets',
    'copy:templates',
    'copy:templates:customers',
    'copy:templates:store',
    'copy:templates:customers:store',
  ])
);

/**
 * RECONCILE functions
 */

gulp.task('del:settings', function () {
  return del([
    'download/config/*',
    '!download/config/settings_data.json',
    '!download/config/settings_schema.json',
  ]);
});

gulp.task('del:locales', function () {
  return gulp
    .src('download/locales/en_*', { allowEmpty: true })
    .pipe(vinylPaths(del));
});

gulp.task('copy:sync:assets', function (done) {
  // JS and CSS assets are not copied as these are usually minified on production
  return gulp.src([paths.download.assets, `!${paths.download.assets_dir}/*.js`, `!${paths.download.assets_dir}/*.css`], { allowEmpty: true })
    .pipe(vinylPaths(del))
    .pipe(gulp.dest(paths.src.assets_dir));
});

gulp.task('copy:sync:config', function (done) {
  return gulp.src([paths.download.config], { allowEmpty: true })
    // delete the remaining common files (ie. settings_schema.json) in the download/config directory
    .pipe(vinylPaths(del))
    .pipe(gulp.dest(paths.src.config_dir));
});

gulp.task('copy:sync:layout', function (done) {
  return gulp.src([paths.download.layout], { allowEmpty: true })
    .pipe(vinylPaths(del))
    .pipe(gulp.dest(paths.src.layout_dir));
});

gulp.task('copy:sync:locales', function (done) {
  return gulp.src([paths.download.locales])
    .pipe(vinylPaths(del))
    .pipe(gulp.dest(paths.src.locales_dir));
});

gulp.task('copy:sync:sections', function (done) {
  return gulp.src([paths.download.sections], { allowEmpty: true })
    .pipe(vinylPaths(del))
    .pipe(gulp.dest(paths.src.sections_dir));
});

gulp.task('copy:sync:sections:store', function (done) {
  const storeSectionFiles = fs.readdirSync(paths.store.sections_dir, {withFileTypes: true})
                          .filter(item => !item.isDirectory() && item.name.indexOf('.json') >= 0)
                          // Get only store files only in download/config
                          .map(item => `${paths.download.sections_dir}/${item.name}`);
  
  if(storeSectionFiles.length > 0) {
    // Check store files in downloads/config
    return gulp.src([...storeSectionFiles], { allowEmpty: true })
      // delete the original store-specific files(ie. header-group.json) in the download/sections directory
      // .pipe(vinylPaths(del))
      // paste the store files from download/sections to the store/sections directory
      .pipe(gulp.dest(paths.store.sections_dir));
  } else {
    done();
  }
});

gulp.task('copy:sync:snippets', function (done) {
  return gulp.src([paths.download.snippets], { allowEmpty: true })
    .pipe(vinylPaths(del))
    .pipe(gulp.dest(paths.src.snippets_dir));
});

gulp.task('copy:sync:templates', function (done) {
  return gulp.src([paths.download.templates], { allowEmpty: true })
    .pipe(vinylPaths(del))
    .pipe(gulp.dest(paths.src.templates_dir));

});

gulp.task('copy:sync:templates:customers', function (done) {
  return gulp.src([paths.download.templates_customers], { allowEmpty: true })
    .pipe(vinylPaths(del))
    .pipe(gulp.dest(paths.src.templates_customers_dir));
});

// Store-specific reconciliation
gulp.task('copy:sync:config:store', function (done) {
  const storeConfigFiles = fs.readdirSync(paths.store.config_dir, {withFileTypes: true})
                          .filter(item => !item.isDirectory())
                          // Get only store files only in download/config
                          .map(item => `${paths.download.config_dir}/${item.name}`);
  
  if(storeConfigFiles.length > 0) {
    // Check store files in downloads/config
    return gulp.src([...storeConfigFiles], { allowEmpty: true })
      // delete the original store-specific files(ie. settings_data.json) in the download/config directory
      .pipe(vinylPaths(del))
      // paste the store files from download/config to the store/config directory
      .pipe(gulp.dest(paths.store.config_dir));
  } else {
    done();
  }
});

gulp.task('copy:sync:layout:store', function (done) {
  const storeLayoutFiles = fs.readdirSync(paths.store.layout_dir, {withFileTypes: true})
                          .filter(item => !item.isDirectory())
                          // Get only snippet files only in download/layout
                          .map(item => `${paths.download.layout_dir}/${item.name}`);
    
  if(storeLayoutFiles.length > 0) {
    // Check store files in downloads/locales
    return gulp.src([...storeLayoutFiles], { allowEmpty: true })
      // delete the original store-specific layout in the download/layout directory
      .pipe(vinylPaths(del))
      // paste the store files from download/layout to the store/layout directory
      .pipe(gulp.dest(paths.store.layout_dir));
  } else {
    done();
  }
});

gulp.task('copy:sync:locales:store', function (done) {
  const storeLocalesFiles = fs.readdirSync(paths.store.locales_dir, {withFileTypes: true})
                          .filter(item => !item.isDirectory())
                          // Get only store files only in download/config
                          .map(item => `${paths.download.locales_dir}/${item.name}`);
    
  if(storeLocalesFiles.length > 0) {
    // Check store files in downloads/locales
    return gulp.src([...storeLocalesFiles], { allowEmpty: true })
      // delete the original store-specific locales(ie. en.default.json) in the download/locales directory
      .pipe(vinylPaths(del))
      // paste the store files from download/locales to the store/locales directory
      .pipe(gulp.dest(paths.store.locales_dir));
  } else {
    done();
  }
});

gulp.task('copy:sync:templates:store', function (done) {
  const storeTemplatesFiles = fs.readdirSync(paths.store.templates_dir, { withFileTypes: true })
                          .filter(item => !item.isDirectory())
                          // Get only snippet files only in download/templates
                          .map(item => `${paths.download.templates_dir}/${item.name}`);

  if(storeTemplatesFiles.length > 0) {
    // Check store files in downloads/locales
    return gulp.src([...storeTemplatesFiles], { allowEmpty: true })
      // delete the original store-specific templates in the download/templates directory
      .pipe(vinylPaths(del))
      // paste the store files from download/templates to the store/templates directory
      .pipe(gulp.dest(paths.store.templates_dir));

  } else {
    done();
  }
});

gulp.task('copy:sync:templates:customers:store', function (done) {
  const storeTemplateCustomersFiles = fs.readdirSync(paths.store.templates_customers_dir, {withFileTypes: true})
                          .filter(item => !item.isDirectory())
                          // Get only snippet files only in download/templates_customers
                          .map(item => `${paths.download.templates_customers_dir}/${item.name}`);

  if(storeTemplateCustomersFiles.length > 0) {
    // Check store files in downloads/locales
    return gulp.src([...storeTemplateCustomersFiles], { allowEmpty: true })
      // delete the original store-specific templates_customers in the download/templates_customers directory
      .pipe(vinylPaths(del))
      // paste the store files from download/templates_customers to the store/templates_customers directory
      .pipe(gulp.dest(paths.store.templates_customers_dir));

  } else {
    done();
  }
});

// Reconcile with the current theme set in config.yml
// This should not really be necessary as code development in Shopify
// code editor is forbidden. However, third-party app developers may
// touch live/production files from time to time
gulp.task(
  'reconcileall',
  gulp.series([
    'del:settings',
    'del:locales',
    'copy:sync:assets',
    'copy:sync:config',
    'copy:sync:layout',
    'copy:sync:locales',
    'copy:sync:sections',
    'copy:sync:snippets',
    'copy:sync:templates',
    'copy:sync:templates:customers',
    // Reconcile store-specific files
    'copy:sync:config:store',
    'copy:sync:layout:store',
    'copy:sync:locales:store',
    'copy:sync:sections:store',
    'copy:sync:templates:store',
    'copy:sync:templates:customers:store',
  ])
);

gulp.task(
  'reconcile',
  gulp.series([
    'copy:sync:sections',
    'copy:sync:sections:store',
    'copy:sync:templates',
    'copy:sync:templates:customers',
    'copy:sync:config:store',
    'copy:sync:locales:store',
    'copy:sync:templates:store',
    'copy:sync:templates:customers:store',
  ])
);

gulp.task('copy:prereconcile', function (done) {
  gulp.src(paths.dist.files).pipe(gulp.dest(paths.download.folder));
  done();
});

gulp.task('build', gulp.series(['copy']));

gulp.task('watch', function (done) {
  gulp.watch(
    [paths.src.config, paths.store.config],
    { usePolling: true },
    gulp.series(['copy:config', 'copy:config:store'])
  );

  gulp.watch(
    [paths.src.locales, paths.store.locales],
    { usePolling: true },
    gulp.series(['copy:locales', 'copy:locales:store'])
  );

  gulp.watch(
    [paths.store.templates, paths.store.templates_customers],
    { usePolling: true },
    gulp.series(['copy:templates', 'copy:templates:store'])
  );

  var watcher = gulp.watch(
    [
      paths.src.assets,
      paths.src.layout,
      paths.src.sections,
      paths.src.snippets,
      paths.src.templates,
      paths.src.templates_customers
    ],
    { usePolling: true }
  );

  watcher.on('change', function (file) {
    var fileExtension = file.split('.');

    fileExtension = fileExtension[fileExtension.length - 1];

    switch(fileExtension) {
      case 'css':
      case 'scss':
        var filesToProcess = file,
            filename = file;

        if(file.indexOf('.custom.scss') >= 0) {
          var css = file.replace('.custom.scss', '.css');

          filename = css.replace(paths.src.assets_dir.concat('/'), '');
          filesToProcess = [css, file];
        }

        return gulp.src(filesToProcess)
          .pipe(flatten())
          .pipe(gulpif(typeof filesToProcess == 'object', concat(filename)))
          .pipe(sass())
          .pipe(gulpif(process.env.MINIMIZE_CSS == 'true', cleanCss()))
          .pipe(print())
          .pipe(gulp.dest(paths.dist.assets));

      case 'js':
        return gulp.src(file)
          .pipe(gulpif(process.env.MINIMIZE_JS == 'true', minify(minifyOptions)))
          .pipe(print())
          .pipe(gulp.dest(paths.dist.assets));

      default:
        return gulp.src(file, { base: 'src/' }).pipe(gulp.dest(paths.dist.folder));
    }
  })
  // Watch for file deletions
  .on('unlink', (file) => {
    var fileToDelete = file.replace('src', 'dist');

    // Only delete custom scss
    if(fileToDelete.indexOf('.scss') >= 0 && fileToDelete.indexOf('.custom.scss') < 0) {
      fileToDelete = fileToDelete.replace('.scss', '.css');
    }

    fs.unlink(fileToDelete, () => {});
  });

  done();
});