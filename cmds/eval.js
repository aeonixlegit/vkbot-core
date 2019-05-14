const kindOf = require('kind-of')

module.exports = {
  regexp: /^(а?жс+)/i,
  function: async (msg) => {
    const form = msg.text.split(' ').slice(1).join(' ')
    let code = msg.text.split(' ').slice(2).join(' ')

    if (/^[аa]/i.test(form)) code = `(async () => { ${code} })()`

    try {
      // eslint-disable-next-line no-eval
      let evaled = await eval(code) // eval() может нанести вред боту, поэтому выполнение команд ограничено до создателя.

      if (/(jss+|жсс+)$/i.test(form)) evaled = JSON.stringify(evaled, null, '&#12288;')

      const type = kindOf(evaled)
      if (type === 'array') evaled = `[ ${evaled} ]`

      msg.answer([
        `Выполнено!`,
        `Тип: ${type}`,
        `Ответ: ${evaled}`,
      ].join('\n'))
    }
    catch (e) {
      msg.send(`Ошибка!\n\n${e}`)
    }
  },
  rights: 3,
  help: 'жс [код]',
  desc: 'выполнить код',
}
