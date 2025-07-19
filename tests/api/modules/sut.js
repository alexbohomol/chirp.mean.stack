import request from 'supertest';

class Sut {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    auth() {
        return request(`${this.baseUrl}/auth`);
    }

    api() {
        return request(`${this.baseUrl}/api`);
    }
}

export default Sut;
