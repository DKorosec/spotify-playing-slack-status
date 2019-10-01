const request = require('request');
const SpotifyWebApi = require('spotify-web-api-node');

module.exports = class SpotifyApi {
  constructor({ clientId, clientSecret }) {
    this.config = { clientId, clientSecret, redirectUri: 'http://localhost:8888' };
    this.spotifyApi = new SpotifyWebApi(this.config);
    this.accessToken = null;
  }

  _constructObjectFromPlayerStatusResponse(responseBody) {
    if (!responseBody || !responseBody.item) {
      console.error('RESPONSE BODY MISSING ON 200 RESPONSE (returning null)', responseBody);
      return null;
    }
    return {
      artist: responseBody.item.artists[0] && responseBody.item.artists[0].name || '',
      title: responseBody.item.name,
      isPaused: !responseBody.is_playing,
      progressMs: {
        current: responseBody.progress_ms,
        total: responseBody.item.duration_ms
      }
    }
  }

  setAccessToken(token) {
    console.log(new Date(), 'access token set:', token);
    this.accessToken = token;
    this.spotifyApi.setAccessToken(token);
  }

  createAuthUrl() {
    //under //https://developer.spotify.com/dashboard
    //go to edit settings and add REDIRECT URIs : http://localhost:8888
    return this.spotifyApi.createAuthorizeURL(['user-read-playback-state'], 'read user\'s playback');
  }

  async _initLongLivingPolling() {
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    while (true) {
      try {
        const { body } = await this.spotifyApi.refreshAccessToken();
        this.setAccessToken(body['access_token']);
      } catch (e) {
        console.log('FAILED TO REFRESH ACCESS TOKEN');
      }
      await sleep(1000 * 60); //one minute
    }
  }

  async getAccessFromAuthCode(code) {
    //.createAuthUrl() follow the url, auth with spotify, then parse the ?code= param from url!
    const { body } = await this.spotifyApi.authorizationCodeGrant(code);
    this.setAccessToken(body['access_token']);
    this.spotifyApi.setRefreshToken(body['refresh_token']);
    this._initLongLivingPolling();
  }

  getUserPlayerStatus() {
    return new Promise(async resolve => {
      request.get('https://api.spotify.com/v1/me/player', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        json: true
      }, (error, response, body) => {
        if (error || response.statusCode !== 200) {
          return resolve(null);
        }
        return resolve(this._constructObjectFromPlayerStatusResponse(body));
      });
    })
  };
}
