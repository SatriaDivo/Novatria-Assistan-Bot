function createBansosService(db) {
  const insertItemStmt = db.prepare(`
    INSERT INTO bansos_items (type, label, content, status)
    VALUES (?, ?, ?, 'available')
  `);

  const getStockSummaryStmt = db.prepare(`
    SELECT 
      type,
      SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available,
      SUM(CASE WHEN status = 'claimed' THEN 1 ELSE 0 END) AS claimed
    FROM bansos_items
    GROUP BY type
  `);

  const hasUserClaimedStmt = db.prepare(`
    SELECT 1 FROM bansos_claims WHERE user_id = ? AND type = ? LIMIT 1
  `);

  const getAvailableItemStmt = db.prepare(`
    SELECT id, type, label, content
    FROM bansos_items
    WHERE type = ? AND status = 'available'
    ORDER BY id ASC
    LIMIT 1
  `);

  const updateItemStatusStmt = db.prepare(`
    UPDATE bansos_items
    SET status = 'claimed', claimed_by = ?, claimed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const recordClaimStmt = db.prepare(`
    INSERT INTO bansos_claims (user_id, type, item_id)
    VALUES (?, ?, ?)
  `);

  function addAccount(label, content) {
    return insertItemStmt.run("account", label, content);
  }

  function addApi(label, content) {
    return insertItemStmt.run("api", label, content);
  }

  function getStockSummary() {
    const rows = getStockSummaryStmt.all();
    const summary = {
      accounts: { available: 0, claimed: 0 },
      apis: { available: 0, claimed: 0 },
    };

    for (const row of rows) {
      if (row.type === "account") {
        summary.accounts.available = row.available || 0;
        summary.accounts.claimed = row.claimed || 0;
      } else if (row.type === "api") {
        summary.apis.available = row.available || 0;
        summary.apis.claimed = row.claimed || 0;
      }
    }

    return summary;
  }

  function hasUserClaimed(userId, type) {
    return Boolean(hasUserClaimedStmt.get(userId, type));
  }

  // Klaim item secara atomic transaction untuk mencegah race condition
  const claimTransaction = db.transaction((userId, type) => {
    if (hasUserClaimed(userId, type)) {
      throw new Error(`Anda sudah pernah mengklaim ${type === "account" ? "akun" : "API"} gratis!`);
    }

    const item = getAvailableItemStmt.get(type);
    if (!item) {
      throw new Error(`Stok ${type === "account" ? "akun" : "API"} habis! Tunggu drop berikutnya.`);
    }

    updateItemStatusStmt.run(userId, item.id);
    recordClaimStmt.run(userId, type, item.id);

    return item;
  });

  function claimItem(userId, type) {
    return claimTransaction(userId, type);
  }

  function getClaimHistory({ userId, limit = 10 } = {}) {
    let query = `
      SELECT 
        c.id, c.user_id, c.type, c.claimed_at,
        i.label, i.content
      FROM bansos_claims c
      JOIN bansos_items i ON c.item_id = i.id
    `;
    const params = [];

    if (userId) {
      query += ` WHERE c.user_id = ? `;
      params.push(userId);
    }

    query += ` ORDER BY c.id DESC LIMIT ? `;
    params.push(limit);

    return db.prepare(query).all(...params);
  }

  return {
    addAccount,
    addApi,
    getStockSummary,
    hasUserClaimed,
    claimItem,
    getClaimHistory,
  };
}

module.exports = createBansosService;
