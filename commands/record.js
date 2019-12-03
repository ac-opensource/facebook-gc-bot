const _ = require('lodash')
const fs = require('fs')
const config = require('config')
const supremeLeader = config.supremeLeader
const immunes = config.immunes
const threadID = config.thread_id

const record = (api, path, state, message, callback) => {
    console.log(message)
    const userId = Object.keys(message.mentions)[0]
    const mention = message.mentions[userId] //returns 'someVal'
    const content = message.body

    if (!mention) {
        api.sendMessage({body: `Invalid ${path}! 

"${content}".`}, threadID)
        return
    } else if (state[userId]) {
        state = _.assign(state, {[userId]: {
            name: mention,
            count: (state[userId].count || 0) + 1, 
            [`${path}s`]: _.concat(state[userId][`${path}s`] || [], message.body.replace(`/${path} `, '').replace(mention, '').trim())
        }})
    } else {
        state = _.assign(state, {[userId]: { 
            name: mention,
            count: 1, 
            [`${path}s`]: [message.body.replace(`/${path} `, '').replace(mention, '').trim()]
        }})    
    }
    console.log(`${path}s: `, JSON.stringify(state))
    fs.writeFileSync(`${path}s.json`, JSON.stringify(state))
    api.sendMessage({body: `Thanks for ${path}ing ${mention}. Total number of ${path}s: ${state[userId].count}`}, threadID)
    callback && callback(null, state)
}

export { record }