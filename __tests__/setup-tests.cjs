const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({
    instance: {
      ip: '127.0.0.1',
      port: 27017,
      dbName: 'aiChatSupport',
    },
  });

  // Note: @/db/mongo is mocked in tests; skip cache mutation here.

  // Drop existing mongoose connection state so a fresh one starts with mongod.
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
  }

  const uri = mongod.getUri();
  await mongoose.connect(uri, { dbName: 'aiChatSupport' });

  // Provide JWT secret for passport token generation during tests.
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

  // Seed prompt module
  require.cache[require.resolve('@/ai/PromptProvider')].exports = {
    initPrompt: [{ role: 'system', content: 'You are helpful.' }],
  };
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
});
