import request from 'supertest';
import { DockerComposeUp } from './modules/environment.js';
import { AssertError, AssertRedirect } from './modules/assertions.js';

describe('Auth endpoints', () => {

    const MONGO_PORT = 57001;
    const APP_PORT = 3001;

    let environment;

    beforeAll(async () => {

        environment = await DockerComposeUp({ MONGO_PORT, APP_PORT });
    }, 30000);

    afterAll(async () => {

        if (environment) {
            await environment.down();
        }
    }, 30000);

    function SutApi() {
        return request(`http://localhost:${APP_PORT}`);
    }

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

        AssertRedirect(res, '/auth/success');
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

        AssertError(res);
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

        AssertRedirect(res, '/auth/success');
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

        AssertError(res);
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

        AssertError(res);
        // expect(res.text).toContain('Invalid password for ...');
    });

    test('GET /auth/signout redirects to /', async () => {

        const res = await SutApi().get('/auth/signout');

        AssertRedirect(res, '/');
    });
});
