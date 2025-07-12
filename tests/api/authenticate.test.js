const request = require('supertest');
const { DockerComposeEnvironment } = require("testcontainers");
const path = require("path");

describe('Auth endpoints', () => {

    let environment;

    /* https://node.testcontainers.org/features/compose/ */
    beforeAll(async () => {

        const composeFilePath = path.resolve(__dirname, "../../");
        const composeFile = "docker-compose.yml";
        environment = await new DockerComposeEnvironment(composeFilePath, composeFile)
            .withEnvironment({
                MONGO_PORT: 55001,
                APP_PORT: 3001
            })
            .withBuild(false)
            .up();
    }, 30000);

    afterAll(async () => {

        if (environment) {
            await environment.down();
        }
    }, 30000);

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

    test('POST /auth/signup returns failure when user already exists', async () => {

        const signupRequest = {
            username: `user-${crypto.randomUUID()}`,
            password: 'pass123'
        };

        // signup first
        await SutApi().post('/auth/signup').send(signupRequest);

        // try signing up again with the same username
        const res = await SutApi().post('/auth/signup').send(signupRequest);

        assertError(res);
        // expect(res.text).toContain('User already exists with username ...');
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

    test('POST /auth/login returns failure when user not found', async () => {

        const res = await SutApi().post('/auth/login').send({
            username: 'nonexistentuser',
            password: 'pass123'
        });

        assertError(res);
        // expect(res.text).toContain('User Not Found with username ...');
    });

    test('POST /auth/login returns failure on invalid password', async () => {

        const signupRequest = {
            username: `user-${crypto.randomUUID()}`,
            password: 'pass123'
        };

        // signup first
        await SutApi().post('/auth/signup').send(signupRequest);

        // then login with wrong password
        const res = await SutApi().post('/auth/login').send({
            username: signupRequest.username,
            password: 'wrongpass'
        });

        assertError(res);
        // expect(res.text).toContain('Invalid password for ...');
    });

    test('GET /auth/signout redirects to /', async () => {

        const res = await SutApi().get('/auth/signout');

        assertRedirect(res, '/');
    });

    function SutApi() {
        return request('http://localhost:3001');
    }

    function assertError(res) {
        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('<h1></h1>\n<h2></h2>\n<pre></pre>\n');
    }

    function assertRedirect(response, location) {
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe(location);
        expect(response.headers['content-type']).toBe('text/plain; charset=utf-8');
        expect(response.text).toBe(`Moved Temporarily. Redirecting to ${location}`);
    }
});
