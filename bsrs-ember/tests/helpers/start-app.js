import Ember from 'ember';
import Application from '../../app';
import config from 'bsrs-ember/config/environment';
import windowProxy from 'bsrs-ember/utilities/window-proxy';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import random from 'bsrs-ember/models/random';
import t from './t';

function alterPageSize(app, selector, size) {
  Ember.run(function() {
    Ember.$(selector).find('option[value="' + size + '"]').prop('selected',true).trigger('change');
  });
  return app.testHelpers.wait();
}

function patchRandom(app, counter) {
  Ember.run(function() {
    random.uuid = function() { 
        counter++;
        if (counter === 1) {
            return 'abc123';
        }else{
            return Ember.uuid();
        }
    };
  });
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
      var component = app.__container__.lookup('component:grid-view');
      var targetObject = app.__container__.lookup('controller:' + controller);
      component.set('targetObject', targetObject);
      component.set('attrs', {save_filterset: 'save_filterset'});
      component.set('filtersetName', name);
      component.send('invokeSaveFilterSet');
  });
}

Ember.Test.registerAsyncHelper('clearAll', clearAll);
Ember.Test.registerAsyncHelper('saveFilterSet', saveFilterSet);
Ember.Test.registerAsyncHelper('alterPageSize', alterPageSize);
Ember.Test.registerAsyncHelper('filterGrid', filterGrid);
Ember.Test.registerHelper('visitSync', visitSync);
Ember.Test.registerHelper('patchRandom', patchRandom);

export default function startApp(attrs) {
    var application;

    var attributes = Ember.merge({}, config.APP);
    attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

    // Mock english translations
    var request = { url: '/api/translations/?locale=en' , method: 'GET' };
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

    windowProxy.locationUrl = null;
    windowProxy.changeLocation = function(url) {
        var message = 'windowProxy.locationUrl is not null. Actual: ' + windowProxy.locationUrl;
        Ember.assert(message ,windowProxy.locationUrl === null);
        windowProxy.locationUrl = url;
    };
    return application;
}
