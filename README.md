## INSTALLATION
This repo uses a build process powered by Gulp. This means that instead of editing the files that go online, you'll be editing a source folder containing replicas of those files, and they'll undergo a bit of modification before being uploaded.

1. Install [Node Package Manager](https://www.npmjs.com/get-npm), or NPM, which allows you to download scripts from online repositories.
2. Install [gulp-cli](https://www.npmjs.com/package/gulp-cli), the command line utility for Gulp: `npm install --global gulp-cli`
3. Navigate to your project and run `npm install`. This should install all of the dependencies listed in `package.json`, so the build process can use those tools.
4. Install [Shopify CLI](https://shopify.dev/docs/api/shopify-cli).

Once you have `npm` and `gulp-cli` installed, you can start developing. Briefly, what you should expect is that you can change files in `src`, and depending on your dev environment, the build process will do different things to them before sending them to `dist`. `dist` is what actually goes online, but it has to be built first from `src`. Your dev environment is determined by variables in `.env` and `shopify.theme.toml`.

## SHOPIFY CLI VARIABLES
- For a complete list of environment variables, refer to the [Shopify CLI documentation](https://shopify.dev/docs/storefronts/themes/tools/cli/environments).

## ENVIRONMENT VARIABLES
- STORE: determines which environment in `shopify.theme.toml` to use
- ENABLE_MULTI_STORE: set true if you are using the repo across multiple Shopify stores
- MINIMIZE_JS: minimise JS on build
- MINIMIZE_CSS: minimise CSS on build

## PRE-DEVELOPMENT
Before coding, configure your `.env` and `shopify.theme.toml` files correctly. If you see any errors during build or deployment, chances are one or more of the variables you have set in any of these two files is/are incorrect.

1. Copy `.env.copy` and name it as `.env`. Set the variable `STORE` to whatever store you are currently developing / working at. It must reflect the same environment set in your `shopify.theme.toml` file. Leave to `development` if you are not deploying this theme in multiple stores.
2. Copy `shopify.theme.toml.copy` and name it as `shopify.theme.toml`. Set the environment name to the value of the `STORE` variable in your `.env` file. Fill the `password` with the password you acquired from Theme Access app in Shopify.

## MULTI-STORE SETUP
If you intend to use this same repo / theme for various storefronts, ideally you will be using different settings / customisations / configuration files for each store. To make sure you are deploying the correct settings to the intended store and theme, always double check your `.env` and `shopify.theme.toml` files.

Store-specific files are stored in `stores`.

## RECONCILIATION
Other than locales, configs, and templates, theme files must always refer to this repo as the source of truth. For this reason, during reconciliation, theme files in assets, layout, sections, and snippets are not replaced.

## DEVELOPMENT COMMANDS
- `npm run build`: Takes the files from `src`, modifies them as needed, and sends them to `dist`.
- `npm run watch`: Runs `build`, then watches the theme you have identified in your `.env` file. Any changes you make to `src` will be built to `dist` and uploaded.
- `npm run deploy`: Uploads to your theme set up in `.env`.
- `npm run reconcile`: Downloads current theme `.json` configuration files including section `.json` files and copies them to `src` or to the `stores` folder if doing multi-store development,  so you can see any changes in your git client. Use this 90% of the time.
- `npm run reconcileall`: Much like `reconcile` but downloads ALL files (assets, snippets, layout, etc.). Use this only when necessary edits done via the Shopify code editor needs to be reconciled in the repo.
- `npm run zip`: Makes a zip file containing the theme files, in case you want to upload manually. This can be very quick for deployments.

## CUSTOM SCSS
When creating custom styling, create a .custom.scss file rather than overwriting the base css. Do not directly edit base CSS code from the base theme.

Example: overriding section styling
- To override styling in `section-video-hero.css`, create a file called `section-video-hero.custom.scss`
- The styling for both css and scss file will be merged into one file called `sectio-video-hero.css` and this will be uploaded to your dev theme
- You do not need to import `section-video-hero.custom.css` in your `.liquid` file

Example: creating styling for new section `product-banner.liquid`
- Create file `section-product-banner.scss`
- Import `section-product-banner.css` on your `product-banner.liquid` file

## KEEPING DEV THEME UP-TO-DATE WITH LIVE THEME
If, for some reason, the live theme was updated during development, you may update your branch by doing the following:

1. Commit any current changes
2. Checkout `master`
3. Copy the ID of the live theme and put it on your `shopify.theme.toml` file
4. Run `npm run reconcile`
5. Commit and push
6. Checkout your dev branch
7. Rebase off `master`
8. Continue development

## DEPLOYING TO LIVE
The main issue with this dev environment is that we cannot use this repository directly in Shopify because the folder structure is different. The workaround is to simply copy the contents of the `dist` folder after running `npm run build` to the directory with the repository that's connected to the live theme, then commit and push there. This is in no way an automatic CI/CD process but it solves the issue of having to repeatedly publish a dev theme.

Therefore, in theory, you will have at least two folders: one for this code base/dev environment, and another for the repository that's connected to the live theme in your Shopify store.

## TL;DR
Here's a high-level step-by-step quick guide on how to work on this dev environment. This assumes you have done the PRE-DEVELOPMENT steps outlined above.

1. Create a new branch from `master`
2. Duplicate the live theme, rename it with the new branch name, and take note of theme ID
3. Use the theme ID from Step 2 and put it on your `shopify.theme.toml` file
4. Run `npm run watch` to start development
5. Compile the source code by running `npm run build`
6. Copy the contents of `dist` folder to the directory of the repository that's connected to the live Shopify theme
7. Commit and push the code you copied on Step 6

## IMPORTANT NOTE FOR DEVELOPERS
- Do NOT edit code directly from Shopify code editor. Files edited in the code editor will be overwritten during deployment as the repo is always the source of truth. The exemption for this rule are config, layout, locale, template, and section/*.json files
- Editing the live theme is NOT permitted. Running `deploy` and `watch` with a live theme set in `shopify.theme.yml` WILL fail.
- Do NOT merge to `master` unless a feature is on a live theme
- Follow standard Shopify variable naming conventions
- Follow standard ES6 conventions

## VSCODE PLUGINS
For uniformity, use VScode as your IDE when working. At the same time, to make things easier for you, install these extensions:
- Shopify Liquid
- Liquid

Last updated: Dec 12, 2025
