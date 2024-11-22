// __tests__/api.test.js
const request = require('supertest');
const app = require('./game-center-backend/server'); // Path to your server file

describe('POST /api/customers', () => {
    it('should create a new customer and return customer_id', async () => {
        const response = await request(app)
            .post('http://localhost:3002/api/customers')
            .send({ email: 'test@example.com', phone: '1234567890', name: 'Test User' });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('customer_id');
    });

    it('should return 400 if email and phone are missing', async () => {
        const response = await request(app).post('http://localhost:3002/api/customers').send({});
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error', 'Email or phone number required.');
    });
});
