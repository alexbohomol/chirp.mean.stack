import Sut from './modules/sut.js';
import { DockerComposeUp } from './modules/environment.js';
import { AssertError, AssertRedirect } from './modules/assertions.js';

describe('Auth endpoints', () => {

    const MONGO_PORT = 57001;
    const APP_PORT = 3001;

    let environment;
    let sut;

    beforeAll(async () => {

        environment = await DockerComposeUp({ MONGO_PORT, APP_PORT });
        sut = new Sut(`http://localhost:${APP_PORT}`);
    }, 30000);

    afterAll(async () => {

        if (environment) {
            await environment.down();
        }
    }, 30000);

    test('GET /auth/success returns success', async () => {

        const res = await sut.auth().get('/success');

        expect(res.statusCode).toBe(200);
        expect(res.body.state).toBe('success');
    });

    test('GET /auth/failure returns failure', async () => {

        const res = await sut.auth().get('/failure');

        expect(res.statusCode).toBe(200);
        expect(res.body.state).toBe('failure');
        expect(res.body.user).toBeNull();
        expect(res.body.message).toBe('Invalid username or password');
    });

    describe('POST /auth/signup', () => {
        test('can register a new user', async () => {

            const signupRequest = {
                username: `user-${crypto.randomUUID()}`,
                password: 'pass123'
            };

            const res = await sut.auth().post('/signup').send(signupRequest);

            AssertRedirect(res, '/auth/success');
        });

        test('returns failure when user already exists', async () => {

            const signupRequest = {
                username: `user-${crypto.randomUUID()}`,
                password: 'pass123'
            };

            // signup first
            await sut.auth().post('/signup').send(signupRequest);

            // try signing up again with the same username
            const res = await sut.auth().post('/signup').send(signupRequest);

            AssertError(res);
            // expect(res.text).toContain('User already exists with username ...');
        });
    });

    describe('POST /auth/login', () => {
        test('can login registered user', async () => {

            const signupRequest = {
                username: `user-${crypto.randomUUID()}`,
                password: 'pass123'
            };

            // signup first
            await sut.auth().post('/signup').send(signupRequest);

            // then login
            const res = await sut.auth().post('/login').send({
                username: signupRequest.username,
                password: signupRequest.password
            });

            AssertRedirect(res, '/auth/success');
        });

        test('redirects after successful login', async () => {

            const signupRequest = {
                username: `user-${crypto.randomUUID()}`,
                password: 'pass123'
            };

            // signup first
            await sut.auth().post('/signup').send(signupRequest);

            // then login
            const res = await sut.auth().post('/login').send({
                username: signupRequest.username,
                password: signupRequest.password
            }).redirects(1);//.end((err, res) => { console.log(res); });

            expect(res.statusCode).toBe(200);
            expect(res.body.state).toBe('success');
            expect(res.body.user).toBeNull(); //TODO: only in test here - why???
        });

        test('returns failure when user not found', async () => {

            const res = await sut.auth().post('/login').send({
                username: 'nonexistentuser',
                password: 'pass123'
            });

            AssertError(res);
            // expect(res.text).toContain('User Not Found with username ...');
        });

        test('returns failure on invalid password', async () => {

            const signupRequest = {
                username: `user-${crypto.randomUUID()}`,
                password: 'pass123'
            };

            // signup first
            await sut.auth().post('/signup').send(signupRequest);

            // then login with wrong password
            const res = await sut.auth().post('/login').send({
                username: signupRequest.username,
                password: 'wrongpass'
            });

            AssertError(res);
            // expect(res.text).toContain('Invalid password for ...');
        });
    });

    test('GET /auth/signout redirects to /', async () => {

        const res = await sut.auth().get('/signout');

        AssertRedirect(res, '/');
    });
});
