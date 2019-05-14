module.exports = {
  regexp: /^(помощь|команды|х[еэ]лп)$/i,
  function: async (msg, { botN, cmds }) => {
    let result = [
      `Команды бота ${botN}.`,
      ``,
      `&#128313; Команды для пользователей &#128313;`,
      cmds
        .filter(cmd => cmd.rights === 0)
        .map(cmd => `[&#128312;] ${botN}, ${cmd.help} -- ${cmd.desc}`).join('\n') || '[&#128312;] Нет команд для пользователей.',
      ``,
      `&#128313; Команды для модераторов &#128313;`,
      cmds
        .filter(cmd => cmd.rights === 1)
        .map(cmd => `[&#128312;] ${botN}, ${cmd.help} -- ${cmd.desc}`).join('\n') || '[&#128312;] Нет команд для модераторов.',
      ``,
      `&#128313; Команды для администраторов &#128313;`,
      cmds
        .filter(cmd => cmd.rights === 2)
        .map(cmd => `[&#128312;] ${botN}, ${cmd.help} -- ${cmd.desc}`).join('\n') || '[&#128312;] Нет команд для администраторов.',
      ``,
      `&#128313; Команды для создателя. &#128313;`,
      cmds
        .filter(cmd => cmd.rights === 3)
        .map(cmd => `[&#128312;] ${botN}, ${cmd.help} -- ${cmd.desc}`).join('\n') || '[&#128312;] Нет команд для создателя.',
    ].join('\n')
    msg.ok(result)
  },
  rights: 0,
  help: 'помощь',
  desc: 'список команд',
}
