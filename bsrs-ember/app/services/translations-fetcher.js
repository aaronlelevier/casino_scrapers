// app/services/translations-fetcher.js
import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import config from 'bsrs-ember/config/environment';
const { Service, inject } = Ember;

const PREFIX = config.APP.NAMESPACE;
const PATH = PREFIX + '/translations/?locale=';

export default Service.extend({
  i18n: inject.service(),
  personCurrent: inject.service(),
  fetch() {
    let currentLocale = config.i18n.currentLocale;
    let path = `${PATH}${currentLocale}`;

    const timezone = this.get('personCurrent').get('timezone');
    if (timezone) {
      path += `&timezone=${timezone}`;
    }

    return PromiseMixin.xhr(path).then(this._addTranslations.bind(this));
  },
  _addTranslations(json) {
    const i18n = this.get('i18n');
    Object.keys(json).forEach(function(locale) {
      i18n.addTranslations(locale, json[locale]);
    });
  }
});
