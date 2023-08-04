## INSTALLATION
This repo uses a build process powered by Gulp. This means that instead of editing the files that go online, you'll be editing a source folder containing replicas of those files, and they'll undergo a bit of modification before being uploaded.

1. Install [Node Package Manager](https://www.npmjs.com/get-npm), or NPM, which allows you to download scripts from online repositories.
2. Install [gulp-cli](https://www.npmjs.com/package/gulp-cli), the command line utility for Gulp: `npm install --global gulp-cli`
3. Navigate to your project and run `npm install`. This should install all of the dependencies listed in `package.json`, so the build process can use those tools.

Once you have `npm` and `gulp-cli` installed, you can start developing. Briefly, what you should expect is that you can change files in `src`, and depending on your dev environment, the build process will do different things to them before sending them to `dist`. `dist` is what actually goes online, but it has to be built first from `src`. Your dev environment is determined by variables in `.env` and `config.yml`.

## PRE-DEVELOPMENT
Before coding, configure your `.env` and `config.yml` files correctly. If you see any errors during build or deployment, chances are one or more of the variables you have set in any of these two files is/are incorrect.

1. Copy `.env.copy` and name it as `.env`. Set the variable `STORE` to whatever store you are currently developing / working at. It must reflect the same environment set in your `config.yml` file. Leave to `development` if you are not deploying this theme in multiple stores.
2. Copy `config.yml.copy` and name it as `config.yml`. Set the environment name to the value of the `STORE` variable in your `.env` file. Fill the `password` from the Theme Kit Access app in Shopify.
3. Copy `dev.code-workspace.copy` and name it as `<your-store>.code-workspace`. This file ensures that all developers have the same set up in their work environments.

## MULTI-STORE SETUP
If you intend to use this same repo / theme for various storefronts, ideally you will be using different settings / customisations / configuration files for each store. To make sure you are deploying the correct settings to the intended store and theme, always double check your `.env` and `config.yml` files.

Store-specific files are stored in `stores`.

## RECONCILIATION
Other than locales, configs, and templates, theme files must always refer to this repo as the source of truth. For this reason, during reconciliation, theme files in assets, layout, sections, and snippets are not replaced.

## DEVELOPMENT COMMANDS
- `npm run build`: Takes the files from `src`, modifies them as needed, and sends them to `dist`.
- `npm run watch`: Runs `build`, then watches the theme you have identified in your `.env` file. Any changes you make to `src` will be built to `dist` and uploaded.
- `npm run deploy`: Uploads all files that have been changed to your theme set up in `.env`.
- `npm run reconcile`: Downloads the current theme set up in `.env` to a folder called `download` and copies the files to `src`, so you can see any changes in your git client. If a folder for the current STORE is present, the downloaded version of the files existing in that folder will be copied to that folder instead. Files and folders listed in `.theme_ignores` will not be included in the reconcile.
- `npm run reconcileall`: Much like `reconcile`, but will reconcile all files and folders, regardless if they are listed in `.theme_ignores`.
- `npm run zip`: Makes a zip file containing the theme files, in case you want to upload manually. This can be very quick for deployments.

## CUSTOM SCSS
When creating custom styling, create a custom.scss instead of overwriting the base css. Do not directly edit base CSS code from the base theme.

Scenario 1: overriding section styling
- To override styling in `section-video-hero.css`, create a file called `section-video-hero.custom.scss`
- The styling for both css and scss file will be merged into one file called `sectio-video-hero.css` and this will be uploaded to your dev theme
- You do not need to import `section-video-hero.custom.css` in your `.liquid` file

Scenario 2: creating styling for new section `product-banner.liquid`
- Create file `section-product-banner.scss`
- Import `section-product-banner.css` on your `product-banner.liquid` file

## IMPORTANT NOTE FOR DEVELOPERS
- Do NOT edit code directly from Shopify code editor. Files edited in the code editor will be overwritten during deployment as the repo is always the source of truth. The exemption for this rule are config, layout, locale, and template files
- Editing the live theme is NOT permitted. Running `deploy` and `watch` with a live theme set in `config.yml` WILL fail.
- Do NOT merge to `master` unless a feature is on a live theme

## VSCODE PLUGINS
For uniformity, use VScode as your EDM when working. At the same time, to make things easier for you, install these extensions:
- Shopify Liquid
- Liquid

Last updated: 2023-08-04