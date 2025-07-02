const { REST, Routes } = require('discord.js');
require('dotenv').config();

// database.jsから読み込み
const databaseCommand = require('./database.js');

const commands = [];

// コマンドを登録準備
if (databaseCommand && databaseCommand.data) {
  commands.push(databaseCommand.data.toJSON());
  console.log('database.js コマンドを登録準備完了');
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('スラッシュコマンドを登録中...');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID, 
        process.env.DISCORD_GUILD_ID
      ),
      { body: commands }
    );

    console.log('スラッシュコマンドの登録完了！');
  } catch (error) {
    console.error('登録エラー:', error);
  }
})();