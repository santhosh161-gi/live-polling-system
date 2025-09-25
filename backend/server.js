require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { nanoid } = require("nanoid");
const { Server } = require("socket.io");

const sequelize = require("./config/db");
const { Poll, Option } = require("./models/Poll");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Sync database
sequelize.sync();

// ---------------- REST API ----------------

// Get all polls
app.get("/api/polls", async (req, res) => {
  const polls = await Poll.findAll({ include: Option, order: [["createdAt", "DESC"]] });
  res.json(polls);
});

// Get active poll
app.get("/api/polls/active", async (req, res) => {
  const poll = await Poll.findOne({ where: { active: true }, include: Option });
  res.json(poll || null);
});

// ---------------- Socket.IO ----------------
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  // Send active poll on connect
  (async () => {
    const active = await Poll.findOne({ where: { active: true }, include: Option });
    if (active) socket.emit("pollStarted", active);
  })();

  // Teacher creates a poll
  socket.on("createPoll", async ({ question, options }) => {
    // End previous polls
    await Poll.update({ active: false }, { where: { active: true } });

    const poll = await Poll.create({ question });
    const optionObjs = options.map((opt) => ({ text: opt, PollId: poll.id }));
    await Option.bulkCreate(optionObjs);

    const fullPoll = await Poll.findByPk(poll.id, { include: Option });
    io.emit("pollStarted", fullPoll);
  });

  // Student submits answer
  socket.on("submitAnswer", async ({ pollId, optionId, studentId }) => {
    const option = await Option.findOne({ where: { id: optionId, PollId: pollId } });
    if (!option) {
      socket.emit("errorSubmitting", { message: "Option not found" });
      return;
    }

    // Simple in-memory vote tracking per student (for demo)
    if (!socket.votes) socket.votes = {};
    if (socket.votes[pollId]) {
      socket.emit("alreadyAnswered", { pollId });
      return;
    }
    socket.votes[pollId] = true;

    option.votes += 1;
    await option.save();

    const updatedPoll = await Poll.findByPk(pollId, { include: Option });
    io.emit("pollUpdated", updatedPoll);
  });

  // Teacher ends poll
  socket.on("endPoll", async ({ pollId }) => {
    await Poll.update({ active: false }, { where: { id: pollId } });
    io.emit("pollEnded", { pollId });
  });

  socket.on("disconnect", () => console.log("⚡ Socket disconnected:", socket.id));
});

// ---------------- Start server ----------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
