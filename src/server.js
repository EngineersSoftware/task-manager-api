const app = require('./app');
const { port } = require('./config/env');
const connectDB = require('./config/db');

const start = async () => {
    await connectDB();
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

start();