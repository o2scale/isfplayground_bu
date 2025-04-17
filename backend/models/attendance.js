const { default: mongoose } = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        balagruhaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Balagruha' },
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        date: { type: Date, default: Date.now },
        dateString: { type: String },
        status: { type: String, enum: ['present', 'absent'], required: true, default: 'absent' },
        notes: { type: String },
    },
    { timestamps: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;