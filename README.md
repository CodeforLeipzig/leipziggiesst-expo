# leipziggiesst-expo
leipziggiesst mobile apps with [Expo](https://expo.dev)

## How to Run
1. download Expo Go App for [Android](https://play.google.com/store/apps/details?id=host.exp.exponent&referrer=www) or [iOS](https://itunes.apple.com/app/apple-store/id982107779)
2. clone repository
3. install dependencies `npm install`
4. start the bundler with `npm run start` and scan the QR-Code with your phone to open the app in Expo Go

## Config
`eas update:configure`


## Optimize 
* `npm install -g sharp-cli`
* `npx expo-optimize`

## Build
* `eas build --platform android`
* `eas build --platform ios`
 
## Submit
* `eas submit --platform android --profile internal`
* `eas submit --platform ios --profile internal`
