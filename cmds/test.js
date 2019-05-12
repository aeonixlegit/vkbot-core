module.exports = {
  regexp: /^тест$/,
  func: function (msg) {
    msg.ok('Тестовое сообщение.')
  },
  help: 'test',
  desc: 'проверка',
}
