import request from 'supertest';
import { createIntegrationApp, seedUser } from './helpers/test-app';

describe('Integration: auth login', () => {
  it('logs in an existing user and returns a JWT', async () => {
    const { app, userRepository } = await createIntegrationApp();

    try {
      await seedUser(userRepository);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'password123' })
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe('user@example.com');
    } finally {
      await app.close();
    }
  });
});
