module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: [
        "src/**/*.{ts,js,jsx}"
    ],
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "/dist/",
    ],
};
