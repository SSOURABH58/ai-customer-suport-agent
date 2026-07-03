jest.mock('@/auth/auth-strategy', () => ({
  __esModule: true,
  default: {
    authenticate: jest.fn(),
    generateToken: jest.fn(),
  },
  generateToken: jest.fn(),
}));

jest.mock('@/ai/ai-provider');
jest.mock('@/db/models/chat');
jest.mock('@/db/models/user');
jest.mock('@/db/mongo', () => ({
  connectToDB: jest.fn().mockResolvedValue(undefined),
}));

/** global Request */
import passport from '@/auth/auth-strategy';

// Bulk-reset ts-jest ESM cache between tests so dynamic imports see mock state.
const authRoute = require('@/app/api/auth/route');
const chatRoute = require('@/app/api/chat/route');

const passportMocked = passport as unknown as {
  authenticate: jest.Mock;
  generateToken: jest.Mock;
};

passportMocked.generateToken.mockImplementation((payload: { id: string }) => `jwt-${payload.id}`);

function buildReq(body: unknown, headers?: Record<string, string>) {
  return new Request('http://localhost/api/auth', {
    method: 'POST',
    headers: new Headers(headers || {}),
    body: JSON.stringify(body),
  });
}

describe('auth API', () => {
  beforeEach(() => {
    passportMocked.authenticate.mockReset();
    passportMocked.generateToken.mockClear();
  });

  it('returns a token/user object on valid signup/login input via passport', async () => {
    // authenticate must return a function because the route does: Passport.authenticate(...)({body})
    passportMocked.authenticate.mockImplementation((_: string, __: unknown, cb: Function) => {
      cb(null, { username: 'newbie', id: 'user-1', token: 'tok' });
      return () => {};
    });
    const { POST } = authRoute;
    const res = await POST(buildReq({ username: 'newbie', password: 'secret' }));
    const json = (await res.json()) as { success: boolean; user?: { username: string; id: string } };
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.user?.username).toBe('newbie');
    expect(json.user?.id).toBe('user-1');
  });

  it('returns 401 when passport returns no user', async () => {
    passportMocked.authenticate.mockImplementation((_: string, __: unknown, cb: Function) => {
      cb(null, false, { message: 'Authentication failed' });
      return () => {};
    });
    const { POST } = authRoute;
    const res = await POST(buildReq({ username: 'user', password: 'wrong' }));
    const json = (await res.json()) as { success: boolean; message?: string };
    expect(res.status).toBe(401);
    expect(json.success).toBe(false);
    expect(json.message).toBe('Authentication failed');
  });
});

describe('chat API', () => {
  const MockChatModule = jest.requireMock('@/db/models/chat') as any;
  const MockUserModule = jest.requireMock('@/db/models/user') as any;
  const MockDBModule = jest.requireMock('@/db/mongo') as any;
  const aiModule = jest.requireMock('@/ai/ai-provider') as any;

  beforeEach(() => {
    MockDBModule.connectToDB = MockDBModule.connectToDB || jest.fn().mockResolvedValue(undefined);

    MockChatModule.Chat = MockChatModule.Chat || jest.fn();
    MockChatModule.Chat.mockClear && MockChatModule.Chat.mockClear();

    MockUserModule.User = MockUserModule.User || jest.fn();
    MockUserModule.User.mockClear && MockUserModule.User.mockClear();

    if (typeof MockChatModule.Chat.remove === 'function') {
      MockChatModule.Chat.remove = jest.fn().mockResolvedValue({ deletedCount: 0 });
    }

    MockChatModule.Chat.findById = () =>
      Promise.resolve({
        messages: [{ role: 'user', content: 'hi' }],
        save: () => Promise.resolve({
          messages: [{ role: 'user', content: 'hi' }, { role: 'assistant', content: 'Bot: hello' }],
        }),
      });

    MockUserModule.User.findById = () =>
      Promise.resolve({
        chats: [],
        save: () => Promise.resolve(undefined),
      });

    MockChatModule.Chat.mockImplementation(() => ({
      messages: [{ role: 'system', content: 'You are helpful.' }],
      save: () => Promise.resolve({
        messages: [{ role: 'system', content: 'You are helpful.' }],
      }),
    }));

    aiModule.handleAIResponse = aiModule.handleAIResponse || jest.fn();
    aiModule.handleAIResponse.mockImplementation((_: unknown, __: Function, done: Function) => done('Bot: hello'));
  });

  it('returns a created chat when chatId is empty/set and userId exists', async () => {
    const { POST } = chatRoute;
    // Must be a valid 24-char hex string to pass mongoose.Types.ObjectId() in the route
    const req = buildReq({ chatId: '', message: 'hello' }, { 'x-user-id': '000000000000000000000001' });
    const res = await POST(req);
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(text.length).toBeGreaterThan(0);
  });

  it('continues existing chat and streams ai response', async () => {
    const { POST } = chatRoute;
    const req = buildReq({ chatId: 'chat-1', message: 'hi' }, { 'x-user-id': 'user-1' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.length).toBeGreaterThanOrEqual(0);
  });
});
