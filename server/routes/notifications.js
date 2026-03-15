const express = require("express");
const router = express.Router();
const webPush = require("web-push");
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");

webPush.setVapidDetails(`mailto:${process.env.EMAIL}`, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

router.get("/vapidPublicKey", (req, res) => {
  return res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

router.post("/subscribe", isLoggedIn, async (req, res) => {
  const subscription = req.body;
  try {
    const user = await User.findById(req.user._id);
    const existingSub = user.pushSubscriptions.find((sub) => JSON.stringify(sub) === JSON.stringify(subscription));
    if (!existingSub) {
      user.pushSubscriptions.push(subscription);
      user.isNotificationEnabled = true;
      await user.save();
    }
    return res.status(201).json({ success: true, message: "Subscribed successfully" });
  }
  catch (error) {
    console.error("Error saving subscription:", error);
    return res.status(500).json({ success: false, message: "Subscription failed" });
  }
});

router.post("/challenge", isLoggedIn, async (req, res) => {
  const { sender, receiver, url } = req.body;
  if (!sender || !receiver) {
    return res.status(400).json({ success: false, message: "Sender and receiver are required" });
  }
  try {
    const payload = JSON.stringify({ title: `${sender} has challenged you!`, body: "Accept the challenge to play 1v1", url: url || "/" });
    const user = await User.findOne({ username: receiver });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    let madeChanges = false;
    const validSubs = [];
    for (const subscription of user.pushSubscriptions) {
      try {
        await webPush.sendNotification(subscription, payload, { urgency: 'high', TTL: 86400, topic: 'challenge' });
        validSubs.push(subscription);
      }
      catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          madeChanges = true;
        } else {
          validSubs.push(subscription);
        }
      }
    }
    if (madeChanges) {
      user.pushSubscriptions = validSubs;
      user.isNotificationEnabled = validSubs.length > 0;
      await user.save();
    }
    return res.status(200).json({ success: true, message: "Notification sent successfully" });
  }
  catch (error) {
    console.error("Error sending custom notification:", error);
    return res.status(500).json({ success: false, message: "Failed to send custom notification" });
  }
});

router.post("/user", async (req, res) => {
  const { title, body, url, username, NOTIFY_SECRET } = req.body;
  if (!username || !title || !body) {
    return res.status(400).json({ success: false, message: "Username and title and body are required" });
  }
  if (NOTIFY_SECRET !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const payload = JSON.stringify({ title: title, body: body, url: url || "/" });
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.pushSubscriptions.length) {
      return res.status(400).json({ success: false, message: "User doesn't have notification enabled" });
    }
    let madeChanges = false;
    const validSubs = [];
    for (const subscription of user.pushSubscriptions) {
      try {
        await webPush.sendNotification(subscription, payload, { urgency: 'high', TTL: 86400, topic: 'direct_notify' });
        validSubs.push(subscription);
      }
      catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          madeChanges = true;
        } else {
          validSubs.push(subscription);
        }
      }
    }
    if (madeChanges) {
      user.pushSubscriptions = validSubs;
      user.isNotificationEnabled = validSubs.length > 0;
      await user.save();
    }
    return res.status(200).json({ success: true, message: `Notification sent successfully to ${username}` });
  }
  catch (error) {
    console.error("Error sending custom notification:", error);
    return res.status(500).json({ success: false, message: "Failed to send custom notification" });
  }
});

router.post("/all", async (req, res) => {
  const { title, body, url, NOTIFY_SECRET } = req.body;
  if (!title || !body) {
    return res.status(400).json({ success: false, message: "Title and body are required" });
  }
  if (NOTIFY_SECRET !== process.env.NOTIFY_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  try {
    const payload = JSON.stringify({ title: title, body: body, url: url || "/" });
    const users = await User.find({ isNotificationEnabled: true });
    let totalSent = 0;
    for (const user of users) {
      let madeChanges = false;
      const validSubs = [];
      for (const subscription of user.pushSubscriptions) {
        try {
          await webPush.sendNotification(subscription, payload, { urgency: 'high', TTL: 86400, topic: 'broadcast' });
          totalSent++;
          validSubs.push(subscription);
        }
        catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            madeChanges = true;
          } else {
            validSubs.push(subscription);
          }
        }
      }
      if (madeChanges) {
        user.pushSubscriptions = validSubs;
        user.isNotificationEnabled = validSubs.length > 0;
        await user.save();
      }
    }
    return res.status(200).json({ success: true, message: `Notification sent to ${totalSent} devices` });
  }
  catch (error) {
    console.error("Error sending custom notification:", error);
    return res.status(500).json({ success: false, message: "Failed to send custom notification" });
  }
});

module.exports = router;