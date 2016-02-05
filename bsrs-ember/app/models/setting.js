import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';

var run = Ember.run;

var SettingModel = Model.extend({
    store: inject('main'),
    name: attr(''),
    settings: attr(''),
});

export default SettingModel;
