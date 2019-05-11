module.exports = {
  tag: ['инфо', 'инфа'],
  func: async (context, { vk }) => {
    let ID = false
    if (context.hasReplyMessage) {
      ID = context.replyMessage.senderId
    } else if (context.hasForwards) {
      ID = context.forwards[0].senderId
    } else {
      let result = await vk.snippets.resolveResource(context.text.split(' ').slice(1).join(' '))
      if (result.type !== 'user') return context.error('Указанный ID принадлежит группе, используйте ID пользователя.')
      ID = result.id
    }

    if (!ID) return context.error('Укажите корректный ID для просмотра информации')

    const user = await vk.api.users.get({
      user_ids: ID,
      fields: 'status',
    })

    const name = user[0].first_name
    const lastName = user[0].last_name
    const status = user[0].status
    const id = user[0].id

    context.answer([
      `Имя: ${name}`,
      `Фамилия: ${lastName}`,
      `Статус: ${status || 'Не указан'}`,
      `Айди: ${id}`,
    ].join('\n'))
  },
  rights: 0,
  help: 'инфа [айди]',
  desc: 'узнать информация о пользователе',
}
