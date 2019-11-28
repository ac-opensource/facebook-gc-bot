const fs = require('fs')
const _ = require('lodash')
const login = require("facebook-chat-api")
const supremeLeader = '1202351542'
const timHowan = '100022971516931'
const progaTory = '100043858043477'
const config = require('config')

const threadID = config.thread_id


if (!fs.existsSync('reports.json')) {
    fs.writeFileSync('reports.json', '{}', { flag: 'wx' })
}
if (!fs.existsSync('warns.json')) {
    fs.writeFileSync('warns.json', '{}', { flag: 'wx' })
}
if (!fs.existsSync('commends.json')) {
    fs.writeFileSync('commends.json', '{}', { flag: 'wx' })
}

let realTimeReports = JSON.parse(fs.readFileSync('reports.json'))
let commends = JSON.parse(fs.readFileSync('commends.json'))
let warnings = JSON.parse(fs.readFileSync('warns.json'))
let lastUserAction = {}


let messages = require('./messages.json')
let bookmarks = messages.messages.filter(({content}) => content && content.startsWith('/bookmark')).map(bookmark => {
    return bookmark.content.replace('/bookmark', '').trim()
})
console.log(bookmarks)

let groupedMessages = _.groupBy(messages.messages, 'sender_name')


// let reports = messages.messages.filter(({content}) => content && content.startsWith('/report')).map(report => {
//     return report.content.replace('/report', '').trim()
// })
// console.log(reports)


// let myWarnings = groupedMessages['A-Ar Andrew Concepcion'].filter(({ content }) => content && content.startsWith('/warning') )
// let timWarnings = groupedMessages['Tim Howan'].filter(({ content }) => content && content.startsWith('/warning') )

// let warnings = myWarnings.concat(timWarnings).map(warning => {
//     return {
//         name: warning.content.substring('/warning '.length, warning.content.length)
//     }
// })

// console.log('warnings:', _.countBy(warnings, 'name'))

// let messages = JSON.parse(rawdata)
// let groupedMessages = _.groupBy(messages.messages, 'sender_name')

let participantsWithChatsCount = _.uniqBy(messages.participants, 'name').map(participant => {
    return {
        name: participant.name,
        chats: (groupedMessages[participant.name] || []).length
    }
})

_.sortBy(participantsWithChatsCount, 'chats')
.reverse()
.filter(pwc => {
    return pwc.chats === 0 
})
.forEach(pwc => {
    console.log(pwc)
})


let latestMessageTimeStamp = 0
login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err)
    var msg = {body: "Thanks for reporting!"}

    // api.getThreadInfo(threadID, (err, info) => {
    //     console.log(info)
    // })

    doCommands(api)
    let timerId = setInterval(() => {
        doCommands(api)
    }, 15000)
})

const doCommands = (api) => {
    api.listenMqtt((err, message) => {
        if(message.type !== 'message') return
        if(err) return console.error(err)
        
        if (message.senderID !== '1202351542') {
            const content = message.body
            if (content && content.startsWith('/') && (lastUserAction[message.senderID] || 0) < (Date.now() - (3 * 60 * 1000))) {
                lastUserAction = _.assign(lastUserAction, {[message.senderID]: Date.now()})
                return
            } else {
                return
            }   
        }

        const content = message.body
        if (content.includes("ar-ar") && message.senderID !== '100043858043477') {
            api.sendMessage({body: "It's A-Ar not ar-ar."}, threadID)
        }
        api.markAsRead(threadID)
        if (!content) return
        
        if (content.startsWith('/commands')) {
            sendCommands(api)
        } else if (content.startsWith('/allreports')) {
            api.sendMessage({body: JSON.stringify(realTimeReports, null ,'\t')}, threadID)
        } else if (content.startsWith('/allcommends')) {
            api.sendMessage({body: JSON.stringify(commends, null ,'\t')}, threadID)
        } else if (content.startsWith('/allwarns')) {
            api.sendMessage({body: JSON.stringify(warnings, null ,'\t')}, threadID)
        } else if (content.startsWith('/commend')) {
            record(api, 'commend', commends, message)
        } else if (content.startsWith('/report')) {
            console.log(message)
            const userId = Object.keys(message.mentions)[0]

            if (userId == timHowan) {
                api.sendMessage({body: `Fuck you! I cannot be reported.`}, threadID)
                return
            } else if (userId === supremeLeader) {
                api.sendMessage({body: `You cannot report the supreme leader.`}, threadID)
                return
            }
            
            record(api, 'report', realTimeReports, message)
        } else if (content.startsWith('/warn')) {
            console.log(message)
            const userId = Object.keys(message.mentions)[0]

            if (userId == timHowan) {
                api.sendMessage({body: `Fuck you! I cannot be warned. I do what I want.`}, threadID)
                return
            } else if (userId === supremeLeader) {
                api.sendMessage({body: `You cannot warn the supreme leader. The supreme leader warns you.`}, threadID)
                return
            }

            if (message.senderID === supremeLeader) {
                record(api, 'warn', warnings, message, (err, state) => {
                    if (err) return

                    if (state[userId].count >= 3) {
                        api.sendMessage({body: `3 strikes protocol initiated...`}, threadID)
                        api.removeUserFromGroup(userId, threadID, (err) => {
                            console.log(err)
                        })
                    }
                })
            }
        } else if (content.startsWith('/kick')) {
            kick(api, message)
        } else if (content.startsWith('/faq')) {
            sendFaq(api)
        } else if (content && content.startsWith('/bookmark')) {

        }
        // history.filter(message => {
        //     return message.isUnread
        // })
        // .filter(message => {
            
        // })
        // .forEach(message => {
            
        // })
        // latestMessageTimeStamp = Number(history[0].timestamp)
    });
    // api.getThreadHistory(threadID, 50, undefined, (err, history) => {
        
    // })
}


const addWarning = (api) => {
    
}

const record = (api, path, state, message, callback) => {
    console.log(message)
    const userId = Object.keys(message.mentions)[0]
    const mention = message.mentions[userId] //returns 'someVal'

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

const kick = (api, message) => {
    const userId = Object.keys(message.mentions)[0]
    const mention = message.mentions[userId] //returns 'someVal'
    
    if (!mention) {
        api.sendMessage({body: `Invalid kick command! 
        
        "${content}".`}, threadID)
        return
    } else if (userId == timHowan) {
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

const sendFaq = (api) => {
    api.sendMessage({body: `
FAQ:

Q: Why is this GC named progatory?
A: Programmers Purgatory, where lost programmer souls go

Q: Rules? 
A:
    1. No trolling
    2. You can debate but within context
    3. Ask questions responsibly
    4. No illegal stuffs

Q: What is this group for?
A: Knowledge sharing for IT/Dev related things

Q: Can I chat out of topic things?
A: Yes as long as it doesn't break any rules

Q: Can I share memes?
A: Any memes you like as long as it has no lewds. Marami samin nag-oopisina you know. Respect everyone.

Q: pwede magpalit ng nickname?
A: Oo pero sayo lang and as much as possible no common words to avoid accidental tagging

Q: Pwede manghingi ng codes
A: Why ask for codes when you can make your own? Kaya ka andito 

Q: Hiya ako hehe, pwede maglurk lang ako?
A: Okay lang pero from time to time participate ka sa GC. Kasi may monthly culling dito ng mga inactive.

Q: Pwede po pahelp sa assignment ko?
A: Sure! We require the following items:
    >existing code mo
    >problem statements ng homework mo
    >Bilugan ang mga parte ng code mo na nahihirapan ka
    >describe mo bakit ka nalilito o nahihirapan
`}, threadID)
}

const backTicks = "```"
const sendCommands = (api) => {
    api.sendMessage({body: `
${backTicks}
/commands
/faq
/allcommends
/commend <tag person> <commend reason>
/allreports
/report <tag person> <report reason>
/allwarns
/warn <tag person> <warn reason>
/kick <tag person>
/bookmark <anything>
${backTicks}
`}, threadID)
}