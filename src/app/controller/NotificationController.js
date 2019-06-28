import Notification from "../schemas/Notification";
import User from "../models/User";

class NotificationController {
  async index(req, res) {
    const isProvider = await User.findOne({ where: { id: req.userId } });
    if (!isProvider) {
      return res.status(401).json({ error: "Provider não permitido" });
    }

    const notifications = await Notification.find({
      user: req.userId,
      read: false
    })
      .sort({ createdAt: "desc" })
      .limit(20);
    return res.json(notifications);
  }
}

export default new NotificationController();
