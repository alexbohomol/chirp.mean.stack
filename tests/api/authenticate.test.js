const request = require('supertest');

describe('Auth endpoints', () => {

    test('GET /auth/success returns success', async () => {

        const res = await request('http://localhost:3000').get('/auth/success');

        expect(res.statusCode).toBe(200);
        expect(res.body.state).toBe('success');
    });

    test('GET /auth/failure returns failure', async () => {

        const res = await request('http://localhost:3000').get('/auth/failure');

        expect(res.statusCode).toBe(200);
        expect(res.body.state).toBe('failure');
        expect(res.body.user).toBe(null);
        expect(res.body.message).toBe('Invalid username or password');
    });

    test('POST /auth/signup can register a new user', async () => {

        const userName = `user-${crypto.randomUUID()}`;

        const res = await request('http://localhost:3000').post('/auth/signup')
            .send({ username: userName, password: 'pass123' });

        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/auth/success');
    });

    test('POST /auth/login can login registered user', async () => {

        const userName = `user-${crypto.randomUUID()}`;

        // signup first
        await request('http://localhost:3000').post('/auth/signup')
            .send({ username: userName, password: 'pass123' });

        // then login
        const res = await request('http://localhost:3000').post('/auth/login')
            .send({ username: userName, password: 'pass123' });//.redirects(1);

        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/auth/success');
        expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
        expect(res.text).toBe('Moved Temporarily. Redirecting to /auth/success');
    });

    test('POST /auth/login retrurns failure on bad password', async () => {

        const userName = `user-${crypto.randomUUID()}`;

        // signup first
        await request('http://localhost:3000').post('/auth/signup')
            .send({ username: userName, password: 'pass123' });

        // then login
        const res = await request('http://localhost:3000').post('/auth/login')
            .send({ username: userName, password: 'wrongpass' });

        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('<h1></h1>\n<h2></h2>\n<pre></pre>\n');
    });

    test('GET /auth/signout returns redirect to /', async () => {

        const res = await request('http://localhost:3000').get('/auth/signout');

        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/');
        expect(res.headers['content-type']).toBe('text/plain; charset=utf-8');
        expect(res.text).toBe('Moved Temporarily. Redirecting to /');
    });
});
