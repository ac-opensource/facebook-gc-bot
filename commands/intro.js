const sendIntro = (api, threadID) => {
    api.sendMessage({body: `
Please introduce yourself

# Personal intro
# Work/School
# Tech Stack
# Why are you in this GC
    `}, threadID)
}

export { sendIntro }