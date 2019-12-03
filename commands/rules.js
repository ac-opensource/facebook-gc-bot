const backTicks = "```"

const sendRules = (api, threadID) => {
api.sendMessage({body: `
${backTicks}
Rules:
1. No trolling
2. You can debate but within context
3. Ask questions responsibly
4. No illegal stuffs
${backTicks}
`}, threadID)
}

export { sendRules }