const { ChannelType, PermissionFlagsBits } = require("discord.js");
const config = require("../config");

const openTickets = new Map(); // userId -> channelId

function formatTicketChannelName(username) {
  const sanitized = (username || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `ticket-${sanitized || "support"}`;
}

function hasOpenTicket(userId) {
  return openTickets.has(userId);
}

function setOpenTicket(userId, channelId) {
  openTickets.set(userId, channelId);
}

function getTicketChannelId(userId) {
  return openTickets.get(userId);
}

function removeOpenTicket(userId) {
  openTickets.delete(userId);
}

function findUserByChannelId(channelId) {
  for (const [userId, cId] of openTickets.entries()) {
    if (cId === channelId) return userId;
  }
  return null;
}

async function createTicketChannel(guild, member) {
  const channelName = formatTicketChannelName(member.user.username);

  const permissionOverwrites = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: member.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
  ];

  // Berikan izin ke Admin roles
  if (config.adminRoleIds && config.adminRoleIds.length > 0) {
    for (const roleId of config.adminRoleIds) {
      const role = guild.roles.cache.get(roleId);
      if (role) {
        permissionOverwrites.push({
          id: role.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.ReadMessageHistory,
          ],
        });
      }
    }
  }

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    permissionOverwrites,
    reason: `Support Ticket untuk ${member.user.tag}`,
  });

  setOpenTicket(member.id, channel.id);
  return channel;
}

module.exports = {
  formatTicketChannelName,
  hasOpenTicket,
  setOpenTicket,
  getTicketChannelId,
  removeOpenTicket,
  findUserByChannelId,
  createTicketChannel,
  openTickets,
};
