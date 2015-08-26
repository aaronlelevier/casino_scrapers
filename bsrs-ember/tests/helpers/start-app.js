import Ember from 'ember';
import Application from '../../app';
import config from 'bsrs-ember/config/environment';
import windowProxy from 'bsrs-ember/utilities/window-proxy';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import t from './t';

export default function startApp(attrs) {
    var application;

    var attributes = Ember.merge({}, config.APP);
    attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

    // Mock translations
    var request = { url: '/api/translations/?locale=en' , method: 'GET' };
    var response = translations.generate();
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
