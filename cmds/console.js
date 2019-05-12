const { execSync } = require('child_process')

module.exports = {
  regexp: /^(к[оа]н[сз]оль|кмд)/i,
  func: async (msg) => {
    let code = msg.text.split(' ').slice(1).join(' ')

    if (!code) return msg.error('Вы не указали команду для выполнения.')

    try {
      let result = await execSync(code, { cwd: __dirname })
      msg.ok(result)
    }
    catch (e) {
      msg.send(`\n\n${e}`)
    }
  },
  rights: 3,
}
