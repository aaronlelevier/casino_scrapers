import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
const { Component, computed, inject } = Ember;

export default Component.extend({

  translationsFetcher: inject.service(),
  personCurrent: inject.service(),

  tagName: 'select',
  classNames: [ 'language-select form-control t-locale-select' ],
  i18n: inject.service(),
  current: computed.readOnly('model.locale'),

  // It would be nice to do this with `{{action "setLocale" on="change"}}`
  // in the template, but the template doesn't include the component's own
  // tag yet. See https://github.com/emberjs/rfcs/pull/60
  change: function() {
    var model = this.get('model');
    var val = this.$().val();
    model.set('locale', val);
    var service = this.get('personCurrent');
  }
});
