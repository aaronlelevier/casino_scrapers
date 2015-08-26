import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
const { Component, computed, inject } = Ember;

export default Component.extend({

  translationsFetcher: inject.service(),

  tagName: 'select',
  classNames: [ 'language-select' ],
  i18n: inject.service(),
  current: computed.readOnly('i18n.locale'),

  // It would be nice to do this with `{{action "setLocale" on="change"}}`
  // in the template, but the template doesn't include the component's own
  // tag yet. See https://github.com/emberjs/rfcs/pull/60
  change: function() {
    var _this = this;
    config.i18n.currentLocale = this.$().val();
    return this.get('translationsFetcher').fetch().then(function(){
      _this.get('i18n').set('locale', _this.$().val());
    });
  }
});
