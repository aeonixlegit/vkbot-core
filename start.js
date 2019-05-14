
const { VK } = require('vk-io')
require('colors')
const fs = require('fs')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const commands = fs
  .readdirSync(`${__dirname}/cmds/`)
  .filter((name) => /\.js$/i.test(name))
  .map((name) => require(`${__dirname}/cmds/${name}`))

const vk = new VK()
const adapter = new FileSync('database/db.json')
const db = low(adapter)

let {
  token,
  bot_name,
  owner_id,
  roles,
} = require('./config.json')

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

let bot_names

async function init () {
  await checkConfig().catch(console.error)
  await vk.updates.start().catch(console.error)
  console.log('> Бот на ядре \'vkbot-core\' был запущен.'.green)

  vk.updates.on(['new_message', 'edit_message'], async (context) => {
    if (context.senderId < 1 || !bot_names.test(context.text)) return
    console.log(context.subTypes[0] + ` ${context.senderId} => ${context.text}`.green)
    context.setActivity()
    await context.loadMessagePayload()

    context.text = context.text.replace(bot_names, '')
    context.user = await db.getUser(context.senderId)

    let cmd = commands.find(cmd => cmd.regexp ? cmd.regexp.test(context.text) : (new RegExp(`^\\s*(${cmd.tag.join('|')})`, 'i')).test(context.text))
    if (!cmd) return context.send('&#128213; | Команда не найдена')

    context.answer = (text = '', params = {}) => {
      const result = context.isChat ? `${roles[context.user.rights]} ${context.user.nick},\n${text}` : `${text}`
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
        await cmd.function(context, { bot_name, commands, vk, VK, cmd, db })
      }
      catch (e) {
        console.error(`Ошибка:\n${e}`.red.bold)
        context.error(`Произошла ошибка при выполнении команды '${context.text}'.`)

        let error = JSON.stringify(e)
        context.error(`Произошла ошибка при выполнении команды '${context.text}' @id${context.senderId} (пользователем).\nОшибка: ${error}`, {
          user_id: owner_id,
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
}

async function checkConfig () {
  if (bot_name) {
    bot_names = new RegExp(`^(${Array.isArray(bot_name) ? bot_name.join('|') : bot_name})[,\\s]*`, 'i')
    bot_name = Array.isArray(bot_name) ? bot_name[0] : bot_name
  } else {
    console.error('Вы не указали имена, на которые бот будет откликаться.'.red)
    process.exit(false)
  }

  if (token) {
    vk.setOptions({
      'token': token,
    })
  } else {
    console.error('Вы не указали токен группы / пользователя.'.red)
    process.exit(false)
  }

  if (owner_id) {
    let result = await vk.snippets.resolveResource(owner_id)
    if (result.type !== 'user') return console.error('Указанный в настройках ID владельца не принаджелит пользователю.')
    owner_id = result.id
  } else {
    console.error('Вы не указали ID владельца бота.'.red)
    process.exit(false)
  }

  if (!roles) {
    console.error('Вы не указали роли, будет произведена установка ролей по умолчанию.'.red)
    roles = [ 'Пользователь', 'Модератор', 'Администратор', 'Разработчик' ]
  }

  return true
}

init().catch(console.error)
