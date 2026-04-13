const MongoURI = process.env.MONGO_URI || process.env.MongoURI || 'mongodb://127.0.0.1:27017/muneeb_bus_app';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_change_me';

module.exports = {
    MongoURI,
    JWT_SECRET,
}