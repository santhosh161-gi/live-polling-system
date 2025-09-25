const express = require("express");
const { Poll, Option } = require("../models/Poll");
const router = express.Router();

router.post("/create", async (req, res) => {
  const { question, options } = req.body;
  const poll = await Poll.create({ question });
  await Promise.all(options.map(opt => Option.create({ text: opt, PollId: poll.id })));
  res.json(poll);
});

router.get("/", async (_, res) => {
  const polls = await Poll.findAll({ include: Option });
  res.json(polls);
});

module.exports = router;
