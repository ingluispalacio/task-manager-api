import request from 'supertest';
import { createIntegrationApp, seedUser } from './helpers/test-app';

describe('Integration: task creation and listing', () => {
  it('creates and lists tasks for the authenticated user', async () => {
    const { app, userRepository } = await createIntegrationApp();

    try {
      await seedUser(userRepository);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'password123' })
        .expect(201);

      const createResponse = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({ title: 'Integration task', description: 'Important flow' })
        .expect(201);

      expect(createResponse.body.title).toBe('Integration task');
      expect(createResponse.body.completed).toBe(false);

      const listResponse = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0].title).toBe('Integration task');
    } finally {
      await app.close();
    }
  });
});
