const request = require('supertest');
const { DockerComposeEnvironment } = require("testcontainers");
const path = require("path");

describe('Posts endpoints', () => {

    let environment;
    let cookies;

    /* https://node.testcontainers.org/features/compose/ */
    beforeAll(async () => {

        environment = await DockerComposeUp();
        cookies = await SignupAndLogin();
    }, 30000);

    afterAll(async () => {

        if (environment) {
            await environment.down();
        }
    }, 30000);

    async function DockerComposeUp() {

        const composeFilePath = path.resolve(__dirname, "../../");
        const composeFile = "docker-compose.yml";

        return await new DockerComposeEnvironment(composeFilePath, composeFile).up();
    }

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
        return request('http://localhost:3000/auth');
    }

    function SutApi() {
        return request('http://localhost:3000/api');
    }

    function assertError(res) {
        expect(res.statusCode).toBe(500);
        expect(res.text).toBe('<h1></h1>\n<h2></h2>\n<pre></pre>\n');
    }

    function assertApiError(response, badObjectId) {
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe(`{\"message\":\"Cast to ObjectId failed for value \\\"${badObjectId}\\\" at path \\\"_id\\\" for model \\\"Post\\\"\",\"name\":\"CastError\",\"stringValue\":\"\\\"${badObjectId}\\\"\",\"kind\":\"ObjectId\",\"value\":\"${badObjectId}\",\"path\":\"_id\"}`);
    }

    function assertRedirect(response, location) {
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe(location);
        expect(response.headers['content-type']).toBe('text/plain; charset=utf-8');
        expect(response.text).toBe(`Moved Temporarily. Redirecting to ${location}`);
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

            assertRedirect(res, '/#login');
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

            assertApiError(res, 'invalidID');
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

            assertRedirect(res, '/#login');
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

            assertError(res);
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

            assertRedirect(res, '/#login');
        });

        test('returns error for non-existent post ID', async () => {

            const res = await SutApi()
                .delete('/posts/invalidID')
                .set('Cookie', cookies);

            assertApiError(res, 'invalidID');
        });
    });
});
