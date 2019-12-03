
const _ = require('lodash')
const fs = require('fs')
const config = require('config')
const supremeLeader = config.supremeLeader
const immunes = config.immunes
const threadID = config.thread_id

const setWhoIs = (api, state, message) => {
    state = _.assign(state, {[message.senderID]: message.body.replace('/whois set', '').trim()})
    fs.writeFileSync(`whois.json`, JSON.stringify(state))
    api.sendMessage({body: `Thanks for updating your whois`}, threadID)
}

const whoIs = (api, state, message) => {
    const userId = Object.keys(message.mentions)[0]
    
    const whois = state[userId || message.senderID] || 'No whois yet.'
    
    if (!userId) {
        api.sendMessage({body: `Who am I?\n\n${whois}`}, threadID, (err) => {
            console.log(err)
        })
    } else {
        const mention = message.mentions[userId].replace('@', '')
        api.sendMessage({body: `Who is ${mention}?\n\n${whois}`}, threadID, (err) => {
            console.log(err)
        })
    }
    
}

export { setWhoIs, whoIs }