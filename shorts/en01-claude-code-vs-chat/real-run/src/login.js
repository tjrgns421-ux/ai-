function login(user, input) {
  if (user.password === input) {
    return "ok";
  }
  return "denied";
}

module.exports = { login };
