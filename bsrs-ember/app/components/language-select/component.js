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

    // var currentPerson = service.get('model');
    // var currentPersonId = currentPerson.get('id');
    // var editedPersonId = model.get('id');
    //
    // if(currentPersonId === editedPersonId){
    //   if(val === ''){
    //     config.i18n.currentLocale = config.i18n.defaultLocale;
    //   }else{
    //     config.i18n.currentLocale = this.$().val();
    //   }
    //   return this.get('translationsFetcher').fetch().then(function(){
    //     _this.get('i18n').set('locale', config.i18n.currentLocale);
    //   });
    // }

  }
});
