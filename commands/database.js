const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const supabase = require('../utils/supabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('db')
    .setDescription('Supabaseデータベースの操作')
    .addSubcommand(subcommand =>
      subcommand
        .setName('test')
        .setDescription('データベース接続テスト')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('select')
        .setDescription('テーブルからデータを取得')
        .addStringOption(option =>
          option.setName('table')
            .setDescription('テーブル名')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName('limit')
            .setDescription('取得する行数（デフォルト: 5）')
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === 'test') {
        await interaction.reply('✅ Supabase接続テスト成功！');
        
      } else if (subcommand === 'select') {
        // 先に応答してタイムアウトを防ぐ
        await interaction.deferReply();
        
        const tableName = interaction.options.getString('table');
        const limit = interaction.options.getInteger('limit') || 5;

        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(limit);

          if (error) {
            await interaction.editReply(`❌ エラー: ${error.message}`);
            return;
          }

          if (data.length === 0) {
            await interaction.editReply(`📭 テーブル "${tableName}" にデータがありません。`);
            return;
          }

          const formattedData = data.map((row, index) => {
            const fields = Object.entries(row)
              .map(([key, value]) => `**${key}**: ${value}`)
              .join('\n');
            return `**${index + 1}.** \n${fields}`;
          }).join('\n\n');

          const embed = new EmbedBuilder()
            .setTitle(`📋 ${tableName} のデータ（最新${data.length}件）`)
            .setDescription(formattedData.slice(0, 4000))
            .setColor(0x0099ff);

          await interaction.editReply({ embeds: [embed] });
          
        } catch (dbError) {
          console.error('データベースエラー:', dbError);
          await interaction.editReply('❌ データベース接続中にエラーが発生しました。');
        }
      }

    } catch (err) {
      console.error('コマンドエラー:', err);
      const errorMessage = '❌ コマンド実行中にエラーが発生しました。';
      
      if (interaction.deferred) {
        await interaction.editReply(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    }
  },
};