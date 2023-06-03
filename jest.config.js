module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/test"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "/opt/nodejs/products":
      "<rootDir>/src/products/layers/mock/nodejs/products",
  },
};
