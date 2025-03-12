const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
    },
    description: {
        type: String,
    },
    completed: {
        type: Boolean,
        default: false
    },
    deadline: {
        type: mongoose.Schema.Types.Date,
        required: [true, 'Deadline is required']
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    reminderTime: {
        type: mongoose.Schema.Types.Date,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
}
)

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;