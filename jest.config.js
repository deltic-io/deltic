const tsconfig = require("./tsconfig.json");
const fromPairs = pairs => pairs.reduce((res, [key, value]) => ({ ...res, [key]: value }), {})

function createModuleNameMapper(tsconfig) {
    return fromPairs(
        Object.entries(tsconfig.compilerOptions.paths).map(([k, [v]]) => [
            `^${k.replace(/\*/, "(.*)")}`,
            `<rootDir>/${v.replace(/\*/, "$1")}`,
        ]),
    )
};

let moduleNameMapper = createModuleNameMapper(tsconfig);

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: [
        "packages/**/*.{ts,js,jsx}"
    ],
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "/dist/",
    ],
    moduleNameMapper,
};
