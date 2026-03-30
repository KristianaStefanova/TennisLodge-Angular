require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

function getDbURL() {
  if (process.env.MONGO_URI) return process.env.MONGO_URI;
  if (process.env.MONGO_USER && process.env.MONGO_PASSWORD && process.env.MONGO_CLUSTER) {
    const user = encodeURIComponent(process.env.MONGO_USER);
    const password = encodeURIComponent(process.env.MONGO_PASSWORD);
    const cluster = process.env.MONGO_CLUSTER;
    const db = process.env.MONGO_DB || 'forum';
    return `mongodb+srv://${user}:${password}@${cluster}.mongodb.net/${db}?authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;
  }
  return env === 'development' ? 'mongodb://localhost:27017/forum' : undefined;
}

const config = {
    development: {
        port: process.env.PORT || 3000,
        dbURL: getDbURL(),
        origin: ['http://localhost:5555', 'http://localhost:4200']
    },
    production: {
        port: process.env.PORT || 3000,
        dbURL: getDbURL(),
        origin: []
    }
};

module.exports = config[env];
