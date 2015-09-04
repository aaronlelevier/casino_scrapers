import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import loopAttrs from 'bsrs-ember/utilities/loop-attrs';

var PersonCurrent = Model.extend({
  store: inject('main'),
  translationsFetcher: Ember.inject.service(),
  i18n: Ember.inject.service(),
  person: Ember.computed(function(){
    return this.get('store').find('person', this.get('id'));
  }),
  updateSiteLocale: Ember.observer('person.locale', function(){
    Ember.run.once(this, 'processLocaleUpdate');
  }),
  processLocaleUpdate(){
    var loc = this.get('person.locale') || config.i18n.defaultLocale;
    config.i18n.currentLocale = loc;
    return this.get('translationsFetcher').fetch().then(function(){
      this.get('i18n').set('locale', config.i18n.currentLocale);
    }.bind(this));
  }
});
export default PersonCurrent;
