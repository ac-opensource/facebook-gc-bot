const sendFaq = (api, threadID) => {
    api.sendMessage({body: `
FAQ:
Q: Why is this GC named progatory?
A: Programmers Purgatory, where lost programmer souls go

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
    - existing code mo
    - problem statements ng homework mo
    - Bilugan ang mga parte ng code mo na nahihirapan ka
    - describe mo bakit ka nalilito o nahihirapan
`}, threadID)
}

export { sendFaq }