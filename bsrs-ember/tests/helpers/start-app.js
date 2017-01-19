import Ember from 'ember';
const { run } = Ember;
import Application from '../../app';
import config from 'bsrs-ember/config/environment';
import windowProxy from 'bsrs-ember/utilities/window-proxy';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import random from 'bsrs-ember/models/random';
import './ember-i18n/test-helpers';
import substring_up_to_num from './substring_up_to_num';
import substringBreadcrumb from './substring-breadcrumb';
import { pginator as pagination, pginator2 as pagination2 } from './pagination';
import { errorSetup, errorTearDown } from './error-setup';
import urlContains from './url-contains';
import setWidth from './set-width';
import uuidReset from './uuid-reset';
import registerPowerSelectHelpers from '../../tests/helpers/ember-power-select';
import { SESSION_URL } from 'bsrs-ember/utilities/urls';
import PERSON_CURRENT from 'bsrs-ember/vendor/defaults/person-current';

registerPowerSelectHelpers();

function ajax(app, url, verb, data, headers, status, response) {
  Ember.run(function() {
    Ember.$.fauxjax.removeExisting(url, verb);
    var request = { url: url , method: verb };
    if (data) {
      request.data = data;
      if(verb !== 'DELETE') {
        request.contentType = 'application/json';
      }
    }
    if(data && data instanceof FormData) {
      request.data = data;
      request.processData = false;
      request.contentType = false;
    }
    Ember.$.fauxjax.new({
      request: request,
      response: {
        status: status,
        content: response
      }
    });
  });
  return app.testHelpers.wait();
}

function alterPageSize(app, selector, size) {
  Ember.run(function() {
    Ember.$(selector).find('option[value="' + size + '"]').prop('selected',true).trigger('change');
  });
  return app.testHelpers.wait();
}

function patchIncrement(app, counter) {
  Ember.run(function() {
    random.uuid = function() {
      counter++;
      return counter;
    };
  });
}

function patchRandom(app, counter) {
  Ember.run(function() {
    random.uuid = function() {
      counter++;
      if (counter === 1) {
        return UUID.value;
      }else{
        return Ember.uuid();
      }
    };
  });
}

function patchRandomAsync(app, counter) {
  Ember.run(function() {
    random.uuid = function() {
      counter++;
      if (counter === 1) {
        return 'abc123';
      }else{
        return 'def456';
      }
    };
  });
  return app.testHelpers.wait();
}

function filterGrid(app, column, text) {
  var eventbus = app.__container__.lookup('service:eventbus');
  Ember.run(function() {
    eventbus.publish('bsrs-ember@component:input-dynamic-filter:', this, 'onValueUpdated', column, text);
  });
  return app.testHelpers.wait();
}

function visitSync(app, url) {
  var router = app.__container__.lookup('router:main');
  var shouldHandleURL = false;

  app.boot().then(function () {
    router.location.setURL(url);

    if (shouldHandleURL) {
      Ember.run(app.__deprecatedInstance__, 'handleURL', url);
    }
  });

  if (app._readinessDeferrals > 0) {
    router['initialURL'] = url;
    Ember.run(app, 'advanceReadiness');
    delete router['initialURL'];
  } else {
    shouldHandleURL = true;
  }

  return app.testHelpers.wait();
}

function clearAll(app, store, type) {
  Ember.run(function() {
    store.clear(type);
  });
}

function saveFilterSet(app, name, controller) {
  Ember.run(function() {
    var component = app.__container__.lookup('component:grid/helpers/saving-filter');
    var targetObject = app.__container__.lookup('controller:' + controller);
    component.set('targetObject', targetObject);
    // component.set('attrs', {save_filterset: 'save_filterset'});
    component.set('filtersetName', name);
    component.send('invokeSaveFilterSet');
  });
}

function uploadFile(app, name, action, file, model, type='action') {
  Ember.run(function() {
    var files;
    var component = app.__container__.lookup(`component:${name}`);
    component.set('model', model);
    if (file instanceof Array) {
      files = file;
    }else{
      files = [file];
    }
    var event = {target: {files: files}};
    if (type === 'action') {
      // component may handle upload process in an action
      component.send(action, event);
    } else {
      // component may handle upload process in a method
      component[action](event);
    }
  });
  return app.testHelpers.wait();
}

Ember.Test.registerAsyncHelper('uploadFile', uploadFile);
Ember.Test.registerAsyncHelper('ajax', ajax);
Ember.Test.registerAsyncHelper('clearAll', clearAll);
Ember.Test.registerAsyncHelper('saveFilterSet', saveFilterSet);
Ember.Test.registerAsyncHelper('alterPageSize', alterPageSize);
Ember.Test.registerAsyncHelper('filterGrid', filterGrid);
Ember.Test.registerHelper('visitSync', visitSync);
Ember.Test.registerHelper('patchIncrement', patchIncrement);
Ember.Test.registerHelper('patchRandom', patchRandom);
Ember.Test.registerAsyncHelper('patchRandomAsync', patchRandomAsync);

export default function startApp(attrs={}) {
  let application;

  let attributes = Ember.merge({}, config.APP);
  attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

  // Mock person current session
  Ember.$.fauxjax.new({
    request: { url: SESSION_URL, method: 'GET' },
    response: {
      status: attrs.error || 200,
      content: PERSON_CURRENT.defaults()
    }
  });
  // Mock english translations
  var request = { url: '/api/translations/?locale=en&timezone=America/Los_Angeles' , method: 'GET' };
  var response = translations.generate('en');
  Ember.$.fauxjax.new({
    request: request,
    response: {
      status: 200,
      content: response
    }
  });

  Ember.run(() => {
    application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
  });

  let flexi = application.__container__.lookup('service:device/layout');
  const breakpoints = flexi.get('breakpoints');
  let bp = {};
  breakpoints.forEach((point) => {
    bp[point.name] = point.begin + 5;
  });
  run(() => {
    flexi.set('width', bp['desktop']);
  });

  windowProxy.locationUrl = null;
  windowProxy.changeLocation = function(url) {
    var message = 'windowProxy.locationUrl is not null. Actual: ' + windowProxy.locationUrl;
    Ember.assert(message ,windowProxy.locationUrl === null);
    windowProxy.locationUrl = url;
  };
  return application;
}
