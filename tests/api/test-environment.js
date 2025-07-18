import { DockerComposeEnvironment } from "testcontainers";
import { resolve } from "path";

/* https://node.testcontainers.org/features/compose/ */
async function DockerComposeUp(args = {}) {

    const composeFilePath = resolve(__dirname, "../../");
    const composeFile = "docker-compose.yml";

    return await new DockerComposeEnvironment(composeFilePath, composeFile)
        .withEnvironment(args)
        .withBuild(false)
        .up();
}

module.exports = {
    DockerComposeUp
};
