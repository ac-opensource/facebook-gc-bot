const fs = require('fs')
const _ = require('lodash')
const login = require("facebook-chat-api")
const config = require('config')
const supremeLeader = config.supremeLeader
const immunes = config.immunes
const threadID = config.thread_id
const https = require('https')

import {sendFaq} from './commands/faq'
import {sendRules} from './commands/rules'
import {sendIntro} from './commands/intro'
import {sendCommands} from './commands/commands'
import {kick} from './commands/kick'
import {whoIs, setWhoIs} from './commands/whois'
import {record} from './commands/record'

const jokeApi = "https://sv443.net/jokeapi/category/Programming"
const cursed = ['react native', 'xamarin', 'ionic', 'nativescript', 'phonegap', 'electron']
const meme = ['javascript', 'js', 'php', 'julia']
const validCommands = ['/rules','/faq','/whois','/whois set','/whois','/allcommends','/commend','/allreports','/report','/allwarns','/warn','/kick','/bookmark']

let realTimeReports = JSON.parse(fs.readFileSync('reports.json'))
let commends = JSON.parse(fs.readFileSync('commends.json'))
let warnings = JSON.parse(fs.readFileSync('warns.json'))
let whois = JSON.parse(fs.readFileSync('whois.json'))
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
    // sendJoke(api)
    // setInterval(() => {
    //     sendJoke(api)
    // }, 900000)
    
    doCommands(api)
})

const sendJoke = (api) => {
    https.get(jokeApi, (resp) => {
        let data = '';
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            const jokeObj = JSON.parse(data)
            if (jokeObj.type === 'single') {
                api.sendMessage({body: `${jokeObj.joke}`}, threadID)
            } else {
                api.sendMessage({body: `${jokeObj.setup}`}, threadID, (err) => {
                    if (!err) {
                        api.sendMessage({body: `${jokeObj.delivery}`}, threadID)
                    }
                })
            }
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

const doCommands = (api) => {
    api.listenMqtt((err, message) => {
        if(message.type !== 'message') return
        if(err) return console.error(err)
        
        const content = message.body
        if (!content) return

        // if ((content.toLowerCase().includes("ar-ar") || content.toLowerCase().includes("ar ar")) && message.senderID !== progaTory) {
        //     api.setMessageReaction(":thumbsdown:", message.messageID)
        //     api.sendMessage({body: "It's A-Ar not ar-ar."}, threadID)
        // } else {
        //     if (meme.some(word => content.toLowerCase().includes(word))) {
        //         api.setMessageReaction(":haha:", message.messageID)
        //     }
    
        //     if (cursed.some(word => content.toLowerCase().includes(word))) {
        //         api.setMessageReaction(":angry:", message.messageID)
        //     }
        // }

        if (message.senderID !== supremeLeader) {
            if (content.startsWith('/') && 
                validCommands.some(validCommand => message.body.startsWith(validCommand)) &&
                (lastUserAction[message.senderID] || 0) < (Date.now() - (3 * 60 * 1000))) {
                lastUserAction = _.assign(lastUserAction, {[message.senderID]: Date.now()})
            } else {
                return
            }   
        }
        api.markAsRead(threadID)
        
        if (content.startsWith('/commands')) {
            sendCommands(api, threadID)
        } else if (content.startsWith('/allreports')) {
            let body = ''
            Object.keys(realTimeReports).forEach(key => {
                const report = realTimeReports[key]
                body = body.concat(`${report.name}\ncount: ${report.count}\nlast report: \n${(report.reports || []).slice(-1).pop() || 'n/a'}\n\n`)
            })
            api.sendMessage({body: body}, threadID, (err) => {
                console.log(err)
            })        } else if (content.startsWith('/allcommends')) {
            let body = ''
            Object.keys(commends).forEach(key => {
                const commend = commends[key]
                body = body.concat(`${commend.name}\ncount: ${commend.count}\last commend: \n${(commend.commends || []).slice(-1).pop() || 'n/a'}\n\n`)
            })
            api.sendMessage({body: body}, threadID, (err) => {
                console.log(err)
            })
        } else if (content.startsWith('/allwarns')) {
            api.sendMessage({body: JSON.stringify(warnings, null ,'\t')}, threadID)
        } else if (content.startsWith('/commend')) {
            record(api, 'commend', commends, message)
        } else if (content.startsWith('/report')) {
            console.log(message)
            const userId = Object.keys(message.mentions)[0]

            if (immunes.some(immuneUser => userId.includes(immuneUser))) {
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

            if (immunes.some(immuneUser => userId.includes(immuneUser))) {
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
            sendFaq(api, threadID)
        } else if (content.startsWith('/rules')) {
            sendRules(api, threadID)
        } else if (content.startsWith('/intro')) {
            sendIntro(api, threadID)
        } else if (content.startsWith('/whois set')) {
            setWhoIs(api, whois, message)
        } else if (content.startsWith('/whois')) {
            whoIs(api, whois, message)
        }
    });
}