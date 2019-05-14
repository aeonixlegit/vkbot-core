module.exports = {
  regexp: /^тест$/,
  function: function (msg) {
    msg.ok('Тестовое сообщение.')
  },
  help: 'test',
  desc: 'проверка',
}
