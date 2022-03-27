const mongoose = require('mongoose');


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}
).catch(err => {
    console.log('Error:', err.message);
});

mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected');
});
mongoose.connection.on('error', err => {
    console.log(err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose is disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});