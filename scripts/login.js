const login = require("facebook-chat-api")
const fs = require('fs')
const config = require('config')

login({email: config.fb_user, password: config.fb_pass}, (err, api) => {
	if(err) return console.error(err);
	fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
});
