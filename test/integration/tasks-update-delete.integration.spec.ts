import request from 'supertest';
import { Task } from '../../src/modules/tasks/domain/task.model';
import { createIntegrationApp, seedUser } from './helpers/test-app';

describe('Integration: task update and deletion', () => {
  it('updates and deletes a task owned by the authenticated user', async () => {
    const { app, userRepository, taskRepository } = await createIntegrationApp();

    try {
      await seedUser(userRepository);
      const task = await taskRepository.create(
        new Task('task-1', 'user-1', 'Old title', null, false, null, new Date(), new Date()),
      );

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'password123' })
        .expect(201);

      const updateResponse = await request(app.getHttpServer())
        .put(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .send({ title: 'Updated title', completed: true })
        .expect(200);

      expect(updateResponse.body.title).toBe('Updated title');
      expect(updateResponse.body.completed).toBe(true);

      await request(app.getHttpServer())
        .delete(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${loginResponse.body.accessToken}`)
        .expect(200);
    } finally {
      await app.close();
    }
  });
});
