import Ember from 'ember';
import Application from '../../app';
import Router from 'bsrs-ember/router';
import config from 'bsrs-ember/config/environment'; 

export default function startApp(attrs) {
  var application;

  var attributes = Ember.merge({}, config.APP);
  attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

  Ember.run(() => {
    application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
  });

  return application;
}
