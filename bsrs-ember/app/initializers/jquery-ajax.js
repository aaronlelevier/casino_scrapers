import getCookie from '../utilities/get-cookie';
import Ember from 'ember';

export function initialize(/* application */) {
  // See http://api.jquery.com/jQuery.ajaxPrefilter/
  Ember.$.ajaxPrefilter(function(options) {
    // Check for http(s) indicates a request on another domain
    // only send csrf token on our domain
    if (!(/^http:.*/.test(options.url) || /^https:.*/.test(options.url))) {
      options.beforeSend = function (xhr) {
        let csrftoken = getCookie('csrftoken');
        xhr.setRequestHeader('X-CSRFToken', csrftoken);
      };
    }
  });
}

export default {
  name: 'jquery-ajax',
  initialize
};
