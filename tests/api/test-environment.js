'use strict';

const { DockerComposeEnvironment } = require("testcontainers");
const path = require("path");

/* https://node.testcontainers.org/features/compose/ */
async function DockerComposeUp(args = {}) {

    const composeFilePath = path.resolve(__dirname, "../../");
    const composeFile = "docker-compose.yml";

    return await new DockerComposeEnvironment(composeFilePath, composeFile)
        .withEnvironment(args)
        .withBuild(false)
        .up();
}

module.exports = {
    DockerComposeUp
};
