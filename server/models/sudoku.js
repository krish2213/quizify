const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sudokuSchema = new Schema({
    date: {
        type: String,
        unique: true,
        required: true
    },
    puzzle: {
        type: [[Number]],
        required: true,
    },
    solution: {
        type: [[Number]],
        required: true,
    }
});

module.exports = mongoose.model("Sudoku", sudokuSchema);