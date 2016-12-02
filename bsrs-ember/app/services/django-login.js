import Ember from 'ember';
import windowProxy from 'bsrs-ember/utilities/window-proxy';
import getCookie from '../utilities/get-cookie';

export default Ember.Service.extend({
  loadForm() {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.get('/api-auth/logout/', function () {
        Ember.$.get('/login/').done(function (response) {
          resolve(response);
        }).fail(function () {
          reject(new Error('Failed to load login form'));
          windowProxy.changeLocation('/login/');
        });
      });
    });
  },
  postLogin(credentials) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const success = this.loginSuccess(resolve, reject);
      const failure = this.loginFailure(reject);
      const csrftoken = getCookie('csrftoken');
      Ember.$.ajax('/api-auth/login/', {
        type: 'POST',
        headers: {
          'Accept': 'text/html,*/*',
          'X-CSRFToken': csrftoken
        },
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: Ember.$.param(credentials)
      }).done(success).fail(failure);
    });
  },
  loginSuccess(resolve, reject) {
    return (response, textStatus, xhr) => {
      // the HTML body indicates login success, is the response a form or the ember app?
      let success = response.match(/bsrs-ember\/config\/environment/) !== null;
      if (success) { // response is the ember index.html
        resolve(null);
      } else { // response is the login form, bad credentials
        reject(response);
      }
    };
  },
  loginFailure(reject) {
    return (xhr, textStatus, errorThrown) => {
      if (xhr.status === 403) {
        reject(new Error('Login Failed'));
      } else {
        reject(new Error(errorThrown));
        windowProxy.changeLocation('/login/');
      }
    };
  }
});
