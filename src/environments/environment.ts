// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  api: 'http://localhost:5000/winery-f4d20/us-central1/',
  firebase: {
    apiKey: "AIzaSyBUuVCnRdswfIv_AOJgbfRbo_R7th0naQo",
    authDomain: "myvineyards.tk",
    databaseURL: "https://winery-f4d20.firebaseio.com",
    projectId: "winery-f4d20",
    storageBucket: "winery-f4d20.appspot.com",
    messagingSenderId: "863507070004",
    appId: "1:863507070004:web:c53b2af1bcb19b44779e61",
    measurementId: "G-L6YC96115N"
  },
  owm_key: '4c72c6cc5bdf22958b2ad9088eb46c10'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
