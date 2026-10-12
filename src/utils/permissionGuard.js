const { PermissionsBitField } = require("discord.js");
const config = require("../config");

function isAdmin(interaction, customAdminRoleIds) {
  const member = interaction?.member;
  if (!member) return false;

  const permissions = interaction.memberPermissions || member.permissions;
  if (
    permissions?.has?.(PermissionsBitField.Flags.Administrator) ||
    permissions?.has?.(PermissionsBitField.Flags.ManageGuild) ||
    permissions?.has?.("Administrator") ||
    permissions?.has?.("ManageGuild")
  ) {
    return true;
  }

  const adminRoles = customAdminRoleIds || config.adminRoleIds || [];
  if (adminRoles.length === 0) {
    return false;
  }

  const roles = member.roles;
  if (roles?.cache) {
    return adminRoles.some((roleId) => roles.cache.has(roleId));
  }

  if (Array.isArray(roles)) {
    return adminRoles.some((roleId) => roles.includes(roleId));
  }

  return false;
}

module.exports = {
  isAdmin,
};
