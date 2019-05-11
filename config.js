const token = '' // access_token группы или пользователя.
const owner = 0 // user id владельца бота, ему будут отправляться все сообщения об ошибках.
const rightIcons = ['Пользователь', 'Модератор', 'Администратор', 'Создатель'] // названия либо иконки для ролей.

let botNameString = '' // имя / название бота для обращения со стороны пользователей.

const botName = new RegExp(`^(${Array.isArray(botNameString) ? botNameString.join('|') : botNameString})[,\\s]*`, 'i')
botNameString = Array.isArray(botNameString) ? botNameString[0] : botNameString

module.exports = {
  token,
  owner,
  botName,
  botNameString,
  rightIcons,
}
