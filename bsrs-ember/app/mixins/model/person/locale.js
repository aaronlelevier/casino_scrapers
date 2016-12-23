import Ember from 'ember';
import { change_belongs_to } from 'bsrs-components/attr/belongs-to';
import config from 'bsrs-ember/config/environment';

var LocaleMixin = Ember.Mixin.create({
  change_locale_container: change_belongs_to('locale'),
  change_locale(locale_id) {
    this.change_locale_container(locale_id);
    this.changeLocale();
  },
  changeLocale(){
    const personCurrentId = this.get('personCurrent').get('model.id');
    if (personCurrentId === this.get('id')) {
      config.i18n.currentLocale = this.get('locale').get('locale');
      return this.get('translationsFetcher').fetch().then(() => {
        this.get('i18n').set('locale', config.i18n.currentLocale); 
      }.bind(this));
    }
  },
});

export default LocaleMixin;

