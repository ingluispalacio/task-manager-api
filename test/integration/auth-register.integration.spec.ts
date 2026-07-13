import request from 'supertest';
import { createIntegrationApp } from './helpers/test-app';

describe('Integration: auth registration', () => {
  it('registers a new user successfully', async () => {
    const { app } = await createIntegrationApp();

    try {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'user@example.com', password: 'password123' })
        .expect(201);

      expect(response.body.user.email).toBe('user@example.com');
      expect(response.body.accessToken).toBe('');
    } finally {
      await app.close();
    }
  });
});
