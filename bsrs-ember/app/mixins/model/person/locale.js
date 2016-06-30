import Ember from 'ember';
import { change_belongs_to_fk } from 'bsrs-components/attr/belongs-to';

const { run } = Ember;

var LocaleMixin = Ember.Mixin.create({
  change_locale_container: change_belongs_to_fk('locale'),
  change_locale(locale_id) {
    this.change_locale_container(locale_id);
    this.changeLocale();
  },
});

export default LocaleMixin;

