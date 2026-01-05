const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('❌ Error: DISCORD_TOKEN not found in environment variables');
  process.exit(1);
}

const client = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages] 
});

// Helper function to detect platform from URL
function getPlatform(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return '🎬 YouTube';
  if (url.includes('tiktok.com')) return '🎵 TikTok';
  if (url.includes('instagram.com')) return '📷 Instagram';
  if (url.includes('twitter.com') || url.includes('x.com')) return '𝕏 Twitter/X';
  if (url.includes('facebook.com')) return '📘 Facebook';
  if (url.includes('twitch.tv')) return '🎮 Twitch';
  if (url.includes('reddit.com')) return '🤖 Reddit';
  return '🌐 Unknown Platform';
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Create downloads folder if it doesn't exist
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

client.once('ready', () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  registerSlashCommands();
});

async function registerSlashCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('download')
      .setDescription('Download video dari YouTube, TikTok, Instagram, Twitter, dll')
      .addStringOption(option =>
        option.setName('url')
          .setDescription('URL video yang mau didownload')
          .setRequired(true)
      )
      .addStringOption(option =>
        option.setName('format')
          .setDescription('Format output')
          .setRequired(true)
          .addChoices(
            { name: 'MP4 (Video)', value: 'mp4' },
            { name: 'MP3 (Audio)', value: 'mp3' }
          )
      )
      .toJSON(),
    new SlashCommandBuilder()
      .setName('upscale')
      .setDescription('Upscale foto dengan AI (2x-4x resolution)')
      .addAttachmentOption(option =>
        option.setName('image')
          .setDescription('Upload image yang mau di-upscale')
          .setRequired(true)
      )
      .addStringOption(option =>
        option.setName('scale')
          .setDescription('Berapa kali upscale')
          .setRequired(false)
          .addChoices(
            { name: '2x (Kecil)', value: '2' },
            { name: '3x (Medium)', value: '3' },
            { name: '4x (Besar)', value: '4' }
          )
      )
      .toJSON()
  ];

  try {
    await client.application.commands.set(commands);
    console.log('✅ Slash commands registered');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Helper function to detect platform from URL
function getPlatform(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return '🎬 YouTube';
  if (url.includes('tiktok.com')) return '🎵 TikTok';
  if (url.includes('instagram.com')) return '📷 Instagram';
  if (url.includes('twitter.com') || url.includes('x.com')) return '𝕏 Twitter/X';
  if (url.includes('facebook.com')) return '📘 Facebook';
  if (url.includes('twitch.tv')) return '🎮 Twitch';
  if (url.includes('reddit.com')) return '🤖 Reddit';
  return '🌐 Unknown Platform';
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'download') {
    const url = options.getString('url');
    const format = options.getString('format');

    await interaction.deferReply();

    try {
      const downloadEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📥 Downloading...')
        .setDescription(`Format: **${format.toUpperCase()}**\nMohon tunggu, sedang diproses...`)
        .setFooter({ text: 'Jangan tutup Discord, proses tidak akan berhenti' });

      await interaction.editReply({ embeds: [downloadEmbed] });

      const fileName = `video_${Date.now()}`;
      const outputPath = path.join(downloadsDir, fileName);

      // Get metadata first
      let metadataCommand = `yt-dlp --dump-json "${url}"`;
      
      exec(metadataCommand, async (metaError, metaStdout, metaStderr) => {
        let videoTitle = 'Unknown Title';
        let videoDuration = 'Unknown';

        try {
          const metadata = JSON.parse(metaStdout);
          videoTitle = metadata.title || 'Unknown Title';
          if (metadata.duration) {
            const minutes = Math.floor(metadata.duration / 60);
            const seconds = Math.floor(metadata.duration % 60);
            videoDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          }
        } catch (e) {
          // Continue even if metadata fails
        }

        // Build yt-dlp command for actual download
        let command;
        if (format === 'mp3') {
          command = `yt-dlp -x --audio-format mp3 --audio-quality 192 -o "${outputPath}.mp3" "${url}"`;
        } else {
          // For video - try best quality mp4, fallback to best available
          command = `yt-dlp -f "best[ext=mp4]/best" -o "${outputPath}.mp4" "${url}"`;
        }

        exec(command, { timeout: 60000 }, async (error, stdout, stderr) => {
          if (error) {
            let errorMsg = 'Download gagal';
            if (stderr) errorMsg = stderr.substring(0, 150);
            else if (error.message) errorMsg = error.message.substring(0, 150);
            
            const errorEmbed = new EmbedBuilder()
              .setColor('#ff0000')
              .setTitle('❌ Download Gagal')
              .setDescription(`Error: ${errorMsg}\n\n**Kemungkinan penyebab:**\n• URL tidak valid\n• Medsos membatasi akses\n• Konten sudah dihapus`)
              .setFooter({ text: 'Coba dengan URL lain atau platform lain' });

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
          }

          // Find the downloaded file
          let finalPath;
          if (format === 'mp3') {
            finalPath = `${outputPath}.mp3`;
          } else {
            finalPath = `${outputPath}.mp4`;
          }

          if (!fs.existsSync(finalPath)) {
            const errorEmbed = new EmbedBuilder()
              .setColor('#ff0000')
              .setTitle('❌ Error')
              .setDescription('File tidak ditemukan setelah download');

            await interaction.editReply({ embeds: [errorEmbed] });
            return;
          }

          const fileSize = fs.statSync(finalPath).size;

          // Check file size (Discord limit: 25MB for normal users)
          if (fileSize > 25 * 1024 * 1024) {
            fs.unlinkSync(finalPath);
            const sizeEmbed = new EmbedBuilder()
              .setColor('#ff0000')
              .setTitle('❌ File Terlalu Besar')
              .setDescription(`File ${formatFileSize(fileSize)} melebihi limit Discord (25MB)`)
              .addFields({ name: 'Saran', value: 'Coba download dalam format MP3 atau dengan video berkualitas lebih rendah' });

            await interaction.editReply({ embeds: [sizeEmbed] });
            return;
          }

          try {
            const platform = getPlatform(url);
            const fileSizeFormatted = formatFileSize(fileSize);

            const successEmbed = new EmbedBuilder()
              .setColor('#00ff00')
              .setTitle('✅ Download Berhasil!')
              .setDescription(videoTitle)
              .addFields(
                { name: '📱 Platform', value: platform, inline: true },
                { name: '📁 Format', value: format.toUpperCase(), inline: true },
                { name: '💾 Ukuran', value: fileSizeFormatted, inline: true },
                { name: '⏱️ Durasi', value: videoDuration, inline: true }
              )
              .setFooter({ text: 'File sudah siap didownload!' });

            await interaction.editReply({ 
              embeds: [successEmbed],
              files: [finalPath]
            });

            // Delete file after sending (wait untuk ensure download complete)
            setTimeout(() => {
              try {
                if (fs.existsSync(finalPath)) {
                  fs.unlinkSync(finalPath);
                }
              } catch (err) {
                console.error('File cleanup:', err.message);
              }
            }, 8000);
          } catch (sendError) {
            const sendEmbed = new EmbedBuilder()
              .setColor('#ff0000')
              .setTitle('❌ Error')
              .setDescription('Gagal mengirim file ke Discord')
              .addFields({ name: 'Detail', value: sendError.message.substring(0, 100) });

            await interaction.editReply({ embeds: [sendEmbed] });
            
            if (fs.existsSync(finalPath)) {
              fs.unlinkSync(finalPath);
            }
          }
        });
      });

    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription(error.message);

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }

  // Upscale command
  if (commandName === 'upscale') {
    const image = options.getAttachment('image');
    const scale = options.getString('scale') || '2';

    await interaction.deferReply();

    try {
      // Validate image file
      const validExt = ['.jpg', '.jpeg', '.png', '.webp'];
      const ext = path.extname(image.name).toLowerCase();
      
      if (!validExt.includes(ext)) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Format Tidak Didukung')
          .setDescription('Hanya JPG, PNG, WEBP yang didukung');
        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }

      const processingEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('⏳ Processing...')
        .setDescription(`Upscaling ${scale}x... mohon tunggu (bisa lama)`)
        .setFooter({ text: 'Real-ESRGAN sedang bekerja...' });

      await interaction.editReply({ embeds: [processingEmbed] });

      // Download image
      const inputPath = path.join(downloadsDir, `input_${Date.now()}${ext}`);
      const outputPath = path.join(downloadsDir, `upscaled_${Date.now()}.png`);

      const response = await axios.get(image.url, { responseType: 'arraybuffer' });
      fs.writeFileSync(inputPath, response.data);

      // Run Real-ESRGAN upscaling
      const upscaleCmd = `python3 -m realesrgan.inference -n RealESRGAN_x${scale} -i "${inputPath}" -o "${outputPath}" -s ${scale}`;

      exec(upscaleCmd, { timeout: 120000 }, async (error, stdout, stderr) => {
        // Clean up input
        try {
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        } catch (e) {}

        if (error) {
          const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Upscale Gagal')
            .setDescription('Upscaling gagal. File mungkin terlalu besar atau corrupt.');
          await interaction.editReply({ embeds: [errorEmbed] });
          return;
        }

        if (!fs.existsSync(outputPath)) {
          const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Error')
            .setDescription('File output tidak ditemukan');
          await interaction.editReply({ embeds: [errorEmbed] });
          return;
        }

        try {
          const fileSize = fs.statSync(outputPath).size;

          if (fileSize > 25 * 1024 * 1024) {
            fs.unlinkSync(outputPath);
            const sizeEmbed = new EmbedBuilder()
              .setColor('#ff0000')
              .setTitle('❌ File Terlalu Besar')
              .setDescription(`Output ${formatFileSize(fileSize)} melebihi Discord limit (25MB)`);
            await interaction.editReply({ embeds: [sizeEmbed] });
            return;
          }

          const successEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Upscale Berhasil!')
            .addFields(
              { name: '📈 Scale', value: `${scale}x`, inline: true },
              { name: '📁 Format', value: 'PNG', inline: true },
              { name: '💾 Size', value: formatFileSize(fileSize), inline: true }
            )
            .setFooter({ text: 'Upscaled dengan Real-ESRGAN AI' });

          await interaction.editReply({
            embeds: [successEmbed],
            files: [outputPath]
          });

          // Cleanup
          setTimeout(() => {
            try {
              if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            } catch (e) {}
          }, 8000);

        } catch (sendError) {
          const sendEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Error')
            .setDescription('Gagal mengirim file ke Discord');
          await interaction.editReply({ embeds: [sendEmbed] });
        }
      });

    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription(error.message.substring(0, 100));

      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
});

client.login(token);
