const fs = require('fs')

if (!fs.existsSync('reports.json')) {
    fs.writeFileSync('reports.json', '{}', { flag: 'wx' })
}
if (!fs.existsSync('warns.json')) {
    fs.writeFileSync('warns.json', '{}', { flag: 'wx' })
}
if (!fs.existsSync('commends.json')) {
    fs.writeFileSync('commends.json', '{}', { flag: 'wx' })
}
if (!fs.existsSync('whois.json')) {
    fs.writeFileSync('whois.json', '{}', { flag: 'wx' })
}
