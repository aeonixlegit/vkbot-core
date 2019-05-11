module.exports = {
  regexp: /^тест$/,
  func: function (msg, { botN }) {
    msg.ok('Тестовое сообщение.')
  },
  help: 'test',
  desc: 'проверка',
}
