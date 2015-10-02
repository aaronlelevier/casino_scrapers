import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';

var PersonCurrent = Model.extend({
    store: inject('main'),
    translationsFetcher: Ember.inject.service(),
    i18n: Ember.inject.service(),
    person: Ember.computed(function(){
        return this.get('store').find('person', this.get('id'));
    })
});
export default PersonCurrent;
