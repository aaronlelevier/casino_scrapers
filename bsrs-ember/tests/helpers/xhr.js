import Ember from 'ember';

var xhr = (url, verb, data, headers, status, response) => {
    //TODO: wipe out headers at some point
    var request = { url: url , method: verb };
    if (data) { 
        request.data = data;
        request.contentType = 'application/json';
    }
    if(data && data instanceof FormData) {
        request.data = data;
        request.processData = false;
        request.contentType = false;
    }
    return Ember.$.fauxjax.new({
        request: request,
        response: {
            status: status,
            content: response
        }
    });
};

var clearxhr = (id) => {
    if (typeof id !== 'undefined') {
        Ember.$.fauxjax.remove(id);
    } else {
        Ember.$.fauxjax.clear();
    }
};

export {xhr, clearxhr};
