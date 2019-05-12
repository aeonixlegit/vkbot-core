const { VK } = require('vk-io')
const vk = new VK()
const fs = require('fs')
const colors = require('colors')
const config = require('./config.js')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('database/db.json')
const db = low(adapter)

db.defaults({ users: [] }).write()

db.getUser = async (ID) => {
  let user = db.get('users').find({ id: ID }).value()
  if (!user) {
    db.get('users').push({
      id: ID,
      userID: db.get('users').value().length + 1,
      nick: (await vk.api.users.get({ user_ids: ID }))[0].first_name,
      rights: 0,
    }).write()
    user = db.get('users').find({ id: ID }).value()
  }
  return user
}

const cmds = fs
  .readdirSync(`${__dirname}/cmds/`)
  .filter((name) => /\.js$/i.test(name))
  .map((name) => require(`${__dirname}/cmds/${name}`))

if (!config.botNameString || config.botNameString === null) {
  console.log('Укажите имя для бота в настройках.'.red)
  process.exit(false)
} else if (!config.owner || isNaN(config.owner)) {
  console.log('Укажите ID владельца бота в настройках.'.red)
  process.exit(false)
}

let botN = config.botNameString

console.log('> Бот запущен.'.green)

vk.setOptions({
  'token': config.token,
})

vk.updates.start().catch(console.error)

vk.updates.on(['new_message', 'edit_message'], async (context) => {
  if (context.senderId < 1 || !config.botName.test(context.text)) return

  console.log(context.subTypes[0] + ` ${context.senderId} => ${context.text}`.green)

  context.setActivity()

  await context.loadMessagePayload()

  context.text = context.text.replace(config.botName, '')
  context.user = await db.getUser(context.senderId)

  let cmd = cmds.find(cmd => cmd.regexp ? cmd.regexp.test(context.text) : (new RegExp(`^\\s*(${cmd.tag.join('|')})`, 'i')).test(context.text))
  if (!cmd) return context.send('&#128213; | Команда не найдена')

  // Функции "отправлялки" сообщений
  context.answer = (text = '', params = {}) => {
    const result = context.isChat ? `${config.rightIcons[context.user.rights]} ${context.user.nick},\n${text}` : `${text}`
    return context.send(result, params)
  }
  context.ok = (text = '', params = {}) => {
    return context.answer('&#128215; | ' + text, params)
  }
  context.error = (text = '', params = {}) => {
    return context.answer('&#128213; | ' + text, params)
  }

  if (context.user.rights < cmd.rights) {
    return context.error('У Вас нет прав для использования данной команды.')
  } else {
    try {
      await cmd.func(context, { botN, cmds, vk, VK, cmd, db })
    }
    catch (e) {
      console.error(`Ошибка:\n${e}`.red.bold)
      context.error(`Произошла ошибка при выполнении команды '${context.text}'.`)

      let error = JSON.stringify(e)
      context.error(`Произошла ошибка при выполнении команды '${context.text}' @id${context.senderId} (пользователем).\nОшибка: ${error}`, {
        user_id: config.owner,
      })
    }
  }
})

process.on('uncaughtException', e => {
  console.error(e)
})

process.on('unhandledRejection', e => {
  console.error(e)
})
