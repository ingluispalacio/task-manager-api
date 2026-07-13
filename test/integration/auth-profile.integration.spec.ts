import request from 'supertest';
import { createIntegrationApp, seedUser } from './helpers/test-app';

describe('Integration: authenticated profile', () => {
  it('returns the authenticated user profile', async () => {
    const { app, userRepository } = await createIntegrationApp();

    try {
      await seedUser(userRepository);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'password123' })
        .expect(201);

      const profileResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

      expect(profileResponse.body.email).toBe('user@example.com');
    } finally {
      await app.close();
    }
  });
});
