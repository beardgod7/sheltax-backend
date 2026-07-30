const { Notification } = require("../Listing/model");
const { getPagination, paginatedData } = require("../../utils/pagination");

function userIdFrom(req) {
  return req.user?.sub || req.user?.id || req.user?.userId;
}

async function list(req, res) {
  try {
    const userId = userIdFrom(req);
    const pagination = getPagination(req.query);
    const [{ count, rows }, unreadCount] = await Promise.all([
      Notification.findAndCountAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit: pagination.limit,
        offset: pagination.offset,
      }),
      Notification.count({ where: { userId, isRead: false } }),
    ]);
    return res.json({
      success: true,
      unreadCount,
      message: "Notifications retrieved successfully",
      data: paginatedData("notifications", rows, count, pagination),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch notifications", error: error.message });
  }
}

async function markRead(req, res) {
  try {
    const [count] = await Notification.update(
      { isRead: true },
      { where: { id: req.params.id, userId: userIdFrom(req) } }
    );
    if (!count) return res.status(404).json({ success: false, message: "Notification not found" });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update notification", error: error.message });
  }
}

async function markAllRead(req, res) {
  try {
    await Notification.update({ isRead: true }, { where: { userId: userIdFrom(req), isRead: false } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update notifications", error: error.message });
  }
}

module.exports = { list, markRead, markAllRead };
