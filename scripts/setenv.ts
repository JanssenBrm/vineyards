const {writeFile, existsSync, mkdirSync, openSync, closeSync} = require('fs');
const {argv} = require('yargs');

require('dotenv').config();

// read the command line arguments passed with yargs
const dir = './src/environments';
const environment = argv.environment;
const isProduction = environment === 'prod';
const targetPath = isProduction
    ? `${dir}/environment.prod.ts`
    : `${dir}/environment.ts`;

const environmentFileContent = `
export const environment = {
      production: "${isProduction}",
      api: "${process.env.API_URL}",
      firebase: {
        apiKey: "${process.env.FB_API_KEY}",
        authDomain: "${process.env.FB_AUTH_DOMAIN}",
        databaseURL: "${process.env.FB_DATABASE_URL}",
        projectId: "${process.env.FB_PROJECT_ID}",
        storageBucket: "${process.env.FB_STORAGE_BUCKET}",
        messagingSenderId: "${process.env.FB_MESSAGE_SENDER_ID}",
        appId: "${process.env.FB_APP_ID}",
        measurementId: "${process.env.FB_MEASUREMENT_ID}"
  },
  owm_key: "${process.env.OWM_KEY}"
};
`;

closeSync(openSync(`${dir}/environment.ts`, 'w'))

if (!existsSync(dir)){
    mkdirSync(dir, {recursive: true});
}

writeFile(targetPath, environmentFileContent, function (err) {
    if (err) {
        console.log(err);
    }
    console.log(`Wrote variables to ${targetPath}`);
});

