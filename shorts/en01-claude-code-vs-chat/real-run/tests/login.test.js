const test = require("node:test");
const assert = require("node:assert");
const { login } = require("../src/login");

test("right password logs in", () => {
  assert.strictEqual(login({ password: "hunter2" }, "hunter2"), "ok");
});

test("wrong password is denied", () => {
  assert.strictEqual(login({ password: "hunter2" }, "guess"), "denied");
});
