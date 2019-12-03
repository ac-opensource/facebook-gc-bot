const config = require('config')
const supremeLeader = config.supremeLeader
const immunes = config.immunes
const threadID = config.thread_id

const kick = (api, message) => {
    const userId = Object.keys(message.mentions)[0]
    const mention = message.mentions[userId] //returns 'someVal'
    const content = message.body

    if (!mention) {
        api.sendMessage({body: `Invalid kick command! 
        
"${content}".`}, threadID)
        return
    } else if (immunes.some(immuneUser => userId.includes(immuneUser))) {

        api.sendMessage({body: `Fuck you! I cannot be kicked.`}, threadID)
        return
    } else if (userId === supremeLeader) {
        api.sendMessage({body: `You cannot kick the supreme leader.`}, threadID)
        return
    } else if (message.senderID === supremeLeader) {
        api.sendMessage({body: `Kicking ${mention}...`}, threadID)
        api.removeUserFromGroup(Object.keys(message.mentions)[0], threadID, (err) => {
            console.log(err)
        })
    } else {
        console.log(message.senderID)
        api.sendMessage({body: `Only the supreme leader can kick.`}, threadID)
    }
}

export { kick }