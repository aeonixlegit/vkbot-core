const { Keyboard } = require('vk-io')

module.exports = {
  tag: ['клавиатура'],
  function: function (msg) {
    var args = msg.text.split(' ').slice(1).join(' ')
    if (!args || args !== '- кнопка') {
      var kb = Keyboard.keyboard([
        Keyboard.textButton({
          label: 'клавиатура - кнопка',
        }),
      ]).oneTime(true)

      msg.send('Тест клавиатуры', {
        keyboard: kb,
      })
    }
    if (args === '- кнопка') {
      msg.ok('Клавиатура работает.')
    }
  },
  rights: 0,
  help: 'клавиатура',
  desc: 'демонстрация клавиатуры',
}
