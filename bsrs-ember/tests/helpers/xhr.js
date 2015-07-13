import Ember from 'ember';

var xhr = (url, verb, data, headers, status, response) => {
  //TODO: wipe out headers at some point
  var request = { url: url , method: verb };
  if (data) { request.data = data; }
  Ember.$.fauxjax.new({
    request: request,
    response: {
      status: status,
      content: response
    }
  });
};

var clearxhr = () => {
  Ember.$.fauxjax.clear();
};

export {xhr, clearxhr};
