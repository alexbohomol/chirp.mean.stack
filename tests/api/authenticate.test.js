const request = require('supertest');

describe('Auth endpoints', () => {

    test('GET /auth/success returns success', async () => {

        const res = await SutApi().get('/auth/success');

        expect(res.statusCode).toBe(200);
        expect(res.body.state).toBe('success');
    });

    test('GET /auth/failure returns failure', async () => {

        const res = await SutApi().get('/auth/failure');

        expect(res.statusCode).toBe(200);
        expect(res.body.state).toBe('failure');
        expect(res.body.user).toBeNull();
        expect(res.body.message).toBe('Invalid username or password');
    });

    test('POST /auth/signup can register a new user', async () => {

        const signupRequest = {
            username: `user-${crypto.randomUUID()}`,
            password: 'pass123'
        };

        const res = await SutApi().post('/auth/signup').send(signupRequest);

        assertRedirect(res, '/auth/success');
    });

    test('POST /auth/login can login registered user', async () => {

        const signupRequest = {
            username: `user-${crypto.randomUUID()}`,
            password: 'pass123'
        };

        // signup first
        await SutApi().post('/auth/signup').send(signupRequest);

        // then login
        const res = await SutApi().post('/auth/login').send({
            username: signupRequest.username,
            password: signupRequest.password
        });

        assertRedirect(res, '/auth/success');
    });

    test('POST /auth/login redirects after successful login', async () => {

        const signupRequest = {
            username: `user-${crypto.randomUUID()}`,
            password: 'pass123'
        };

        // signup first
        await SutApi().post('/auth/signup').send(signupRequest);

        // then login
        const res = await SutApi().post('/auth/login').send({
            username: signupRequest.username,
            password: signupRequest.password
        }).redirects(1);//.end((err, res) => { console.log(res); });

        expect(res.statusCode).toBe(200);
        expect(res.body.state).toBe('success');
        expect(res.body.user).toBeNull(); //TODO: only in test here - why???
    });

    test('POST /auth/login returns failure on bad password', async () => {

        const signupRequest = {
            username: `user-${crypto.randomUUID()}`,
            password: 'pass123'
        };

        // signup first
        await SutApi().post('/auth/signup').send(signupRequest);

        // then login
        const res = await SutApi().post('/auth/login').send({
            username: signupRequest.username,
            password: 'wrongpass'
        });

        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('<h1></h1>\n<h2></h2>\n<pre></pre>\n');
    });

    test('GET /auth/signout returns redirect to /', async () => {

        const res = await SutApi().get('/auth/signout');

        assertRedirect(res, '/');
    });

    function SutApi() {
        return request('http://localhost:3000');
    }

    function assertRedirect(response, location) {
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe(location);
        expect(response.headers['content-type']).toBe('text/plain; charset=utf-8');
        expect(response.text).toBe(`Moved Temporarily. Redirecting to ${location}`);
    }
});
