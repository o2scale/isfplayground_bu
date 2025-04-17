const studentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
        balagruhaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Balagruha' },
        parentalStatus: { type: String, enum: ['Has Both', 'Has One', 'Has None', 'Has Guardian'] },
        guardianContact: { type: String },
        performanceReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
        attendanceRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' }],
        medicalRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' }],
    },
    { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;