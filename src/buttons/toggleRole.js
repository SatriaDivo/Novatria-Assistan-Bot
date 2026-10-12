const config = require("../config");

async function handleToggleRole(interaction) {
  const member = interaction.member;
  if (!member) {
    return interaction.reply({
      content: "❌ Data member tidak ditemukan.",
      ephemeral: true,
    });
  }

  let roleId = null;
  let roleName = "";

  if (interaction.customId === "btn_role_bansos") {
    roleId = config.roles.bansosHunter;
    roleName = "Bansos Hunter";
  } else if (interaction.customId === "btn_role_gamers") {
    roleId = config.roles.gamers;
    roleName = "Gamers / Mabar";
  }

  if (!roleId) {
    return interaction.reply({
      content: `❌ Role **${roleName}** belum dikonfigurasi di server (ROLE ID kosong). Hubungi admin!`,
      ephemeral: true,
    });
  }

  const role = interaction.guild.roles.cache.get(roleId);
  if (!role) {
    return interaction.reply({
      content: `❌ Role **${roleName}** dengan ID tersebut tidak ditemukan di server ini.`,
      ephemeral: true,
    });
  }

  try {
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);
      return interaction.reply({
        content: `🗑️ Role **${role.name}** berhasil dilepas dari akunmu.`,
        ephemeral: true,
      });
    } else {
      await member.roles.add(roleId);
      return interaction.reply({
        content: `✅ Role **${role.name}** berhasil ditambahkan ke akunmu!`,
        ephemeral: true,
      });
    }
  } catch (error) {
    return interaction.reply({
      content: `❌ Gagal mengubah role: ${error.message}. Pastikan posisi role bot lebih tinggi dari role tersebut.`,
      ephemeral: true,
    });
  }
}

module.exports = handleToggleRole;
