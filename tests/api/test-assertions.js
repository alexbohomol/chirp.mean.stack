'use strict';

function AssertError(res) {
    expect(res.statusCode).toBe(500);
    expect(res.text).toBe('<h1></h1>\n<h2></h2>\n<pre></pre>\n');
}

function AssertApiError(response, badObjectId) {
    expect(response.statusCode).toBe(500);
    expect(response.text).toBe(`{\"message\":\"Cast to ObjectId failed for value \\\"${badObjectId}\\\" at path \\\"_id\\\" for model \\\"Post\\\"\",\"name\":\"CastError\",\"stringValue\":\"\\\"${badObjectId}\\\"\",\"kind\":\"ObjectId\",\"value\":\"${badObjectId}\",\"path\":\"_id\"}`);
}

function AssertRedirect(response, location) {
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(location);
    expect(response.headers['content-type']).toBe('text/plain; charset=utf-8');
    expect(response.text).toBe(`Moved Temporarily. Redirecting to ${location}`);
}

module.exports = {
    AssertError,
    AssertApiError,
    AssertRedirect
};
