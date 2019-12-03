const backTicks = "```"

const sendCommands = (api, threadID) => {
    api.sendMessage({body: `
${backTicks}
/commands
/intro
/rules
/faq
/whois
/whois set <your whois>
/whois <tag person>
/allcommends
/commend <tag person> <commend reason>
/allreports
/report <tag person> <report reason>
/allwarns
/warn <tag person> <warn reason>
/kick <tag person>
/bookmark <anything>
${backTicks}`}, threadID)
}

export { sendCommands }