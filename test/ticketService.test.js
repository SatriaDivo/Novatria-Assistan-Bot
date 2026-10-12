const { test } = require("node:test");
const assert = require("node:assert");
const ticketService = require("../src/services/ticketService");

test("ticketService formats channel name cleanly", () => {
  const channelName = ticketService.formatTicketChannelName("Tester_User#1234");
  assert.strictEqual(channelName, "ticket-tester-user-1234");
});

test("ticketService tracks open tickets per user to avoid duplicates", () => {
  ticketService.openTickets.clear();
  assert.strictEqual(ticketService.hasOpenTicket("user_1"), false);

  ticketService.setOpenTicket("user_1", "channel_101");
  assert.strictEqual(ticketService.hasOpenTicket("user_1"), true);
  assert.strictEqual(ticketService.getTicketChannelId("user_1"), "channel_101");

  ticketService.removeOpenTicket("user_1");
  assert.strictEqual(ticketService.hasOpenTicket("user_1"), false);
});
