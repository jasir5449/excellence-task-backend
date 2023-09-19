function env(key, default_value) {
  const value = process.env[key];
  return value === undefined ? default_value : value;
}
export {env}