const { MongoClient } = require('mongodb');

const remoteUri = process.env.MONGO_URI
const localUri = process.env.MONGO_URI_LOCAL

exports.copyDatabase = async () => {
    const remoteClient = new MongoClient(remoteUri);
    const localClient = new MongoClient(localUri);

    try {
        await remoteClient.connect();
        await localClient.connect();

        const remoteDb = remoteClient.db('isfplayground');
        const localDb = localClient.db('isfplayground');

        // Get all collections
        const collections = await remoteDb.listCollections().toArray();

        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`Copying collection: ${collectionName}`);

            const remoteCollection = remoteDb.collection(collectionName);
            const localCollection = localDb.collection(collectionName);

            const docs = await remoteCollection.find({}).toArray();

            if (docs.length > 0) {
                await localCollection.deleteMany({}); // Optional: Clear local collection first
                await localCollection.insertMany(docs);
            }
        }

        console.log('Database copied successfully!');
    } catch (error) {
        console.error('Error copying database:', error);
    } finally {
        await remoteClient.close();
        await localClient.close();
    }
}
