create index.js file here.
```
/*
Get slack legacy token here:
https://api.slack.com/custom-integrations/legacy-tokens
Get spotify  clientId and client secret here:
https://developer.spotify.com/dashboard/
(you must create an app)
Leave authorizationCode as it is. And run the app.
A few steps will log out to terminal how to get the authorization code.
Follow them and when you retrieve authorizationCode insert it here.
Restart the app.
(NOTE: if app crashes, you must remove the authorization code and repeat the process of getting it)
*/
module.exports = {
  slackApiLegacyToken : '', 
  spotify : {
    clientId : '',
    clientSecret : '',
    authorizationCode : ''
  },
  slackStatusIcon : ':musical_note:',
  pollingIntervalMs : 8000
}
```