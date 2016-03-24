function registerCB(response, cb) {
  response.results.forEach((model) => {
    setTimeout(cb(model), 0);
  });
}

export default registerCB;
