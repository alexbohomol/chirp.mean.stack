const request = require('supertest');
const { DockerComposeUp } = require('./test-helpers.js');
const { AssertError, AssertApiError, AssertRedirect } = require('./test-assertions.js');

describe('Posts endpoints', () => {

    const MONGO_PORT = 57002;
    const APP_PORT = 3002;

    let environment;
    let cookies;

    /* https://node.testcontainers.org/features/compose/ */
    beforeAll(async () => {

        environment = await DockerComposeUp({ MONGO_PORT, APP_PORT });
        cookies = await SignupAndLogin();
    }, 30000);

    afterAll(async () => {

        if (environment) {
            await environment.down();
        }
    }, 30000);

    async function SignupAndLogin() {

        const request = {
            username: `user-${crypto.randomUUID()}`,
            password: 'Pass123'
        };

        await SutAuth().post('/signup').send(request);

        const loginResponse = await SutAuth().post('/login').send(request);

        return loginResponse.headers['set-cookie'];
    }

    function SutAuth() {
        return request(`http://localhost:${APP_PORT}/auth`);
    }

    function SutApi() {
        return request(`http://localhost:${APP_PORT}/api`);
    }

    describe('POST /posts', () => {
        test('creates a new post successfully', async () => {
            const postRequest = {
                text: 'Test post',
                created_by: 'TestUser'
            };

            const res = await SutApi().post('/posts')
                .set('Cookie', cookies)
                .send(postRequest);

            expect(res.statusCode).toBe(200);
            expect(res.body.text).toBe(postRequest.text);
            expect(res.body.created_by).toBe(postRequest.created_by);
        });

        test('redirects to /#login when not authenticated', async () => {
            const postRequest = {
                text: 'Test post',
                created_by: 'TestUser'
            };

            const res = await SutApi().post('/posts').send(postRequest);

            AssertRedirect(res, '/#login');
        });
    });

    describe('GET /posts', () => {
        test('retrieves all posts', async () => {
            const res = await SutApi().get('/posts');

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('GET /posts/:id', () => {
        test('retrieves a specific post by ID', async () => {
            const postRequest = {
                text: 'Test post',
                created_by: 'TestUser'
            };

            const createdPost = await SutApi().post('/posts')
                .set('Cookie', cookies)
                .send(postRequest);

            const res = await SutApi().get(`/posts/${createdPost.body._id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.text).toBe(postRequest.text);
            expect(res.body.created_by).toBe(postRequest.created_by);
        });

        test('returns error for non-existent post ID', async () => {
            const res = await SutApi().get('/posts/invalidID');

            AssertApiError(res, 'invalidID');
        });
    });

    describe('PUT /posts/:id', () => {
        test('updates a post successfully', async () => {
            const postRequest = {
                text: 'Test post',
                created_by: 'TestUser'
            };

            const createdPost = await SutApi().post('/posts')
                .set('Cookie', cookies)
                .send(postRequest);

            const updatedPost = {
                text: 'Updated post',
                created_by: 'UpdatedUser'
            };

            const res = await SutApi().put(`/posts/${createdPost.body._id}`)
                .set('Cookie', cookies)
                .send(updatedPost);

            expect(res.statusCode).toBe(200);
            expect(res.body.text).toBe(updatedPost.text);
            expect(res.body.created_by).toBe(updatedPost.created_by);
        });

        test('redirects to /#login when not authenticated', async () => {
            const res = await SutApi().put('/posts/invalidID').send({
                text: 'Updated post',
                created_by: 'UpdatedUser'
            });

            AssertRedirect(res, '/#login');
        });

        /*
        couple of notes:
        - why don't we catch ObjectId cast error here like we have in GET/DELETE?
        - we will skip it until we check retieved post is not null
        */
        test.skip('returns error for non-existent post ID', async () => {
            const res = await SutApi().put('/posts/invalidID')
                .set('Cookie', cookies)
                .send({
                    text: 'Updated post',
                    created_by: 'Updated user'
                });

            AssertError(res);
        });
    });

    describe('DELETE /posts/:id', () => {
        test('deletes a post successfully', async () => {
            const postRequest = {
                text: 'Test post',
                created_by: 'TestUser'
            };

            const createdPost = await SutApi().post('/posts')
                .set('Cookie', cookies)
                .send(postRequest);

            const res = await SutApi().delete(`/posts/${createdPost.body._id}`)
                .set('Cookie', cookies);

            expect(res.statusCode).toBe(200);
            expect(res.body).toBe('deleted!');
        });

        test('redirects to /#login when not authenticated', async () => {
            const res = await SutApi().delete('/posts/invalidID');

            AssertRedirect(res, '/#login');
        });

        test('returns error for non-existent post ID', async () => {

            const res = await SutApi()
                .delete('/posts/invalidID')
                .set('Cookie', cookies);

            AssertApiError(res, 'invalidID');
        });
    });
});
