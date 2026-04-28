const { PermissionsBitField } = require("discord.js");
const config = require("../config");
const { replyError } = require("./replyEmbed");

function memberHasAdminRole(member) {
  if (config.adminRoleIds.length === 0) {
    return false;
  }

  const roles = member?.roles;

  if (roles?.cache) {
    return config.adminRoleIds.some((roleId) => roles.cache.has(roleId));
  }

  if (Array.isArray(roles)) {
    return config.adminRoleIds.some((roleId) => roles.includes(roleId));
  }

  return false;
}

function hasSensitiveCommandPermission(interaction) {
  const permissions = interaction.memberPermissions || interaction.member?.permissions;

  return (
    permissions?.has(PermissionsBitField.Flags.Administrator) ||
    permissions?.has(PermissionsBitField.Flags.ManageGuild) ||
    memberHasAdminRole(interaction.member)
  );
}

async function assertSensitiveCommandPermission(interaction) {
  if (hasSensitiveCommandPermission(interaction)) {
    return true;
  }

  await replyError(
    interaction,
    "Tidak punya izin",
    "Command ini hanya bisa digunakan oleh Administrator, user dengan permission Manage Server, atau role yang terdaftar di `ADMIN_ROLE_IDS`."
  );

  return false;
}

module.exports = {
  assertSensitiveCommandPermission,
  hasSensitiveCommandPermission,
};
