const request = require('request');

module.exports = class SlackApi {
  constructor(legacyApiToken) {
    this.legacyApiToken = legacyApiToken;
  }

  updateProfile(statusText, statusEmoji) {
    return new Promise(resolve => {
      request.post('https://slack.com/api/users.profile.set', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.legacyApiToken}`
        },
        json: true,
        body: {
          profile: {
            status_emoji : statusEmoji,
            status_text: statusText,
          }
        }
      }, (error, response, body) => {
        if (error || !body.ok) {
          return resolve(false);
        }
        resolve(true);
      });
    })
  };
}