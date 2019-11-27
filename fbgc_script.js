const fs = require('fs')
const _ = require('lodash')
const login = require("facebook-chat-api")
const threadID = 1355449081244322
const supremeLeader = '1202351542'
const timHowan = '100022971516931'

let rawdata = fs.readFileSync('message_1.json')
let rawdata2 = fs.readFileSync('message_2.json')

try {
    fs.writeFileSync('reports.json', '{}', { flag: 'wx' })
} catch (exception) {

}

try {
    fs.writeFileSync('commends.json', '{}', { flag: 'wx' })
} catch (exception) {

}


let realTimeReports = JSON.parse(fs.readFileSync('reports.json'))
let commends = JSON.parse(fs.readFileSync('reports.json'))
let lastUserAction = {}

function customizer(objValue, srcValue) {
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue)
    }
}

let messages = _.mergeWith(JSON.parse(rawdata), JSON.parse(rawdata2), customizer)
let bookmarks = messages.messages.filter(({content}) => content && content.startsWith('/bookmark')).map(bookmark => {
    return bookmark.content.replace('/bookmark', '').trim()
})
console.log(bookmarks)


let reports = messages.messages.filter(({content}) => content && content.startsWith('/report')).map(report => {
    return report.content.replace('/report', '').trim()
})
console.log(reports)

let groupedMessages = _.groupBy(messages.messages, 'sender_name')
let myWarnings = groupedMessages['A-Ar Andrew Concepcion'].filter(({ content }) => content && content.startsWith('/warning') )
let timWarnings = groupedMessages['Tim Howan'].filter(({ content }) => content && content.startsWith('/warning') )

let warnings = myWarnings.concat(timWarnings).map(warning => {
    return {
        name: warning.content.substring('/warning '.length, warning.content.length)
    }
})

console.log('warnings:', _.countBy(warnings, 'name'))

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

    api.getThreadInfo(threadID, (err, info) => {
        console.log(info)
    })

    doCommands(api)
    let timerId = setInterval(() => {
        doCommands(api)
    }, 15000)
})

const doCommands = (api) => {
    api.getThreadHistory(threadID, 50, undefined, (err, history) => {
        if(err) return console.error(err)
        /*
            Handle message history
        */
        history.filter(message => {
            return message.isUnread
        })
        .filter(message => {
            if (message.senderID === '1202351542') return true
            else {
                const content = message.body
                if (content && content.startsWith('/') && (lastUserAction[message.senderID] || 0) < (Date.now() - 30000)) {
                    lastUserAction = _.assign(lastUserAction, {[message.senderID]: Date.now()})
                    return true 
                } else {
                    return false
                }   
            }
        })
        .forEach(message => {
            console.log(latestMessageTimeStamp)
            const content = message.body
            api.markAsRead(threadID)
            if (!content) return
            if (content.startsWith('/commands')) {
                api.sendMessage({body: `
/commands
/faq
/allcommends
/commend <tag person> <commend reason>
/allreports
/report <tag person> <report reason>
/kick <tag person>
/bookmark <anything>
                `}, threadID)
            } else if (content.startsWith('/allreports')) {
                api.sendMessage({body: JSON.stringify(realTimeReports, null ,'\t')}, threadID)
            } else if (content.startsWith('/allcommends')) {
                api.sendMessage({body: JSON.stringify(commends, null ,'\t')}, threadID)
            } else if (content.startsWith('/commend')) {
                console.log(message)
                const userId = Object.keys(message.mentions)[0]
                const mention = message.mentions[userId] //returns 'someVal'

                if (!mention) {
                    api.sendMessage({body: `Invalid commend! 

"${content}".`}, threadID)
                    return
                } else if (commends[userId]) {
                    commends = _.assign(commends, {[userId]: {
                        name: mention,
                        count: (commends[userId].count || 0) + 1, 
                        commends: _.concat(commends[userId].reports || [], message.body.replace('/commend ', '').replace(mention, '').trim())
                    }})
                    console.log('reports: ', JSON.stringify(realTimeReports))
                    fs.writeFileSync('reports.json', JSON.stringify(realTimeReports))
                } else {
                    commends = _.assign(commends, {[userId]: { 
                        name: mention,
                        count: 1, 
                        commends: [message.body.replace('/commend ', '').replace(mention, '').trim()]
                    }})
                    fs.writeFileSync('commends.json', JSON.stringify(commends))
                    console.log('commends: ', JSON.stringify(commends))
                }
                
                api.sendMessage({body: `Thanks for commending ${mention}! Total number of commends: ${commends[userId].count}`}, threadID)
            } else if (content.startsWith('/report')) {
                console.log(message)
                const userId = Object.keys(message.mentions)[0]
                const mention = message.mentions[userId] //returns 'someVal'

                if (!mention) {
                    api.sendMessage({body: `Invalid report! 

"${content}".`}, threadID)
                    return
                } else if (userId == timHowan) {
                    api.sendMessage({body: `Fuck you! I cannot be reported.`}, threadID)
                    return
                } else if (userId === supremeLeader) {
                    api.sendMessage({body: `You cannot report the supreme leader.`}, threadID)
                    return
                } else if (realTimeReports[userId]) {
                    realTimeReports = _.assign(realTimeReports, {[userId]: {
                        name: mention,
                        count: (realTimeReports[userId].count || 0) + 1, 
                        reports: _.concat(realTimeReports[userId].reports || [], message.body.replace('/report ', '').replace(mention, '').trim())
                    }})
                    console.log('reports: ', JSON.stringify(realTimeReports))
                    fs.writeFileSync('reports.json', JSON.stringify(realTimeReports))
                } else {
                    realTimeReports = _.assign(realTimeReports, {[userId]: { 
                        name: mention,
                        count: 1, 
                        reports: [message.body.replace('/report ', '').replace(mention, '').trim()]
                    }})
                    fs.writeFileSync('reports.json', JSON.stringify(realTimeReports))
                    console.log('reports: ', JSON.stringify(realTimeReports))
                }
                
                api.sendMessage({body: `Thanks for reporting ${mention}! Total number of reports: ${realTimeReports[userId].count}`}, threadID)
            } else if (content.startsWith('/kick')) {
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
            } else if (content.startsWith('/faq')) {
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
            } else if (content && content.startsWith('/bookmark')) {

            }
        })
        latestMessageTimeStamp = Number(history[0].timestamp)
    })
}