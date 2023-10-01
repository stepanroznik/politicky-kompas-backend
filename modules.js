// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const nodeModulePaths = [
    (0, path.join)(process.cwd(), 'node_modules'),
    ...module.paths,
];

console.log(nodeModulePaths);
