const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Poll = sequelize.define("Poll", {
  question: { type: DataTypes.STRING, allowNull: false },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Option = sequelize.define("Option", {
  text: { type: DataTypes.STRING, allowNull: false },
  votes: { type: DataTypes.INTEGER, defaultValue: 0 }
});

// Relations
Poll.hasMany(Option, { onDelete: "CASCADE" });
Option.belongsTo(Poll);

module.exports = { Poll, Option };
