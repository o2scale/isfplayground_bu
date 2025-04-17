const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const userV1Routes = require("./routes/v1/user")
const balagruhaV1 = require("./routes/v1/balagruha")
const authRoutes = require('./routes/auth');
const machineRoutes = require('./routes/v1/machines');
const roleRoutes = require('./routes/roleRoutes');
const taskRoutes = require('./routes/taskRoutes');
const sportsRoute = require("./routes/v1/sports")
const musicRoute = require("./routes/v1/music")
const purchaseAndRepair = require("./routes/v1/purchaseAndRepair")
const trainingSession = require("./routes/v1/trainingSession")
const moodTracker = require("./routes/studentMoodTrackerRoutes")
const { swaggerUi, swaggerDocs } = require('./swagger');
const { exec } = require('child_process'); // For executing shell commands
const fs = require('fs'); // For file system operations
const path = require('path');
const faceapi = require('face-api.js');

// if (!process.env.JWT_SECRET) {
//     console.error('JWT_SECRET is not defined in environment variables');
//     process.exit(1);
// }


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use("/api/v1/users", userV1Routes)
app.use("/api/v1/balagruha", balagruhaV1)
app.use('/api/auth', authRoutes);
app.use('/api/v1/machines', machineRoutes)
app.use('/api/roles', roleRoutes);
app.use('/api/tasks', taskRoutes);
app.use("/api/v1/sports", sportsRoute)
app.use("/api/v1/music", musicRoute)
app.use("/api/v1/purchase-repair", purchaseAndRepair)
app.use("/api/v1/training-session", trainingSession)
app.use("/api/v1/mood-tracker", moodTracker)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const dbConnection = process.env.NODE_ENV === 'local'
    ? process.env.MONGO_URI_LOCAL
    : process.env.MONGO_URI;

mongoose
    .connect(dbConnection, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`✅ MongoDB connected to ${process.env.NODE_ENV === 'local' ? 'local database' : 'remote database'}`);
        // loadMongoDump();
        // load the database with the dump into the local db if the node_env is local and dbConnection string have the localhost db connection 
        if (process.env.NODE_ENV === 'local' && dbConnection.includes('localhost')) {
            // loadMongoDump();
        }
        // Uncomment the line below to load the MongoDB dump when the server starts
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

const loadMongoDump = () => {
    const dumpPath = path.join(__dirname, 'db', 'dump');
    const mongoUri = process.env.MONGO_URI;

    if (!fs.existsSync(dumpPath)) {
        console.error('❌ Dump folder not found at:', dumpPath);
        return;
    }

    console.log('ℹ️ Loading MongoDB dump from:', dumpPath);

    const command = `mongorestore --uri="${mongoUri}" --drop ${dumpPath}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Error loading MongoDB dump:', error.message);
            return;
        }
        if (stderr) {
            console.error('⚠️ MongoDB restore stderr:', stderr);
        }
        console.log('✅ MongoDB dump loaded successfully:', stdout);
    });
};

app.get('/', (req, res) => {
    res.send('Welcome to the API! Use /api/users for user routes or /api-docs for API documentation.');
});

app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});


// Load face-api models
async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./weights');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./weights');
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./weights');
}
loadModels();