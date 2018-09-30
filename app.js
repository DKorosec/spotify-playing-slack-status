const config = require('./config');
const SpotifyApi = require('./libs/spotify-api');
const SlackApi = require('./libs/slack-api');
const spotifyApi = new SpotifyApi(config.spotify);
const slackApi = new SlackApi(config.slackApiLegacyToken);
const { convertToMMSS } = require('./libs/seconds-formatter');
let hasPlayerData = true;

async function logic() {
  const spotifyPlayerStatus = await spotifyApi.getUserPlayerStatus();
  if (spotifyPlayerStatus) {
    hasPlayerData = true;
    const { artist, title, isPaused, progressMs } = spotifyPlayerStatus;
    const currentSecs = Math.floor(progressMs.current / 1000);
    const totalSecs = Math.floor(progressMs.total / 1000);
    const mmssText = `[${convertToMMSS(currentSecs)}/${convertToMMSS(totalSecs)}]`;
    const status = `${artist} - ${title} ${isPaused ? '[PAUSED]' : mmssText}`
    await slackApi.updateProfile(status, config.slackStatusIcon);
  } else {
    if (hasPlayerData) {
      // only set status once, so user can change his status in the meantime while there is no player status data
      await slackApi.updateProfile('', '');
    }
    hasPlayerData = false;
  }
  setTimeout(() => logic(), config.pollingIntervalMs);
}

async function main() {
  await spotifyApi.getAccessFromAuthCode(config.spotify.authorizationCode);
  logic();
}

if (!config.spotify.authorizationCode) {
  console.error('Configure your app:');
  console.log(`0. on https://developer.spotify.com/dashboard go to "edit settings" and add "REDIRECT URIs" : ${spotifyApi.config.redirectUri}`);
  console.log('1. Click and accept: ');
  console.log(spotifyApi.createAuthUrl());
  console.log('2. It will redirect and then parse out "?code=" parameter and insert it in config (spotify.authorizationCode)');
  console.log('3. Re run app (it should work :^)');
  console.log('NOTE: if app crashes, you will have to remove authorizationCode and restart the process');
} else {
  main();
}