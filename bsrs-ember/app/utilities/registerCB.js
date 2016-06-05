/*
* @method registerCB
* method useful to throw processing into web api, thus allowing intermittent renders to occur (every 16ms)
* TODO: think about removing in future given move away from setting up relationships w/ model.  Plus no perf stats
*/
function registerCB(response, cb) {
  response.results.forEach((model) => {
    setTimeout(cb(model), 0);
  });
}

export default registerCB;
