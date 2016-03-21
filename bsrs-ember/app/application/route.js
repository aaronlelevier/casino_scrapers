import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import injectStore from 'bsrs-ember/utilities/store';
import injectRepo from 'bsrs-ember/utilities/inject';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
const { Route, inject } = Ember;

var ApplicationRoute = Ember.Route.extend({
  repository: injectRepo('person'),
  RoleDeserializer: injectDeserializer('role'),
  LocationDeserializer: injectDeserializer('location'),
  PersonDeserializer: injectDeserializer('person'),
  store: injectStore('main'),
  translationsFetcher: inject.service(),
  i18n: inject.service(),
  moment: inject.service(),
  tabList: inject.service(),
  beforeModel() {
    let store = this.get('store');
    const email_types = Ember.$('[data-preload-email_types]').data('configuration');
    email_types.forEach((model) => {
      store.push('email-type', model);
    });
    const phone_number_types = Ember.$('[data-preload-phonenumber_types]').data('configuration');
    phone_number_types.forEach((model) => {
      store.push('phone-number-type', model);
    });
    const address_types = Ember.$('[data-preload-address_types]').data('configuration');
    address_types.forEach((model) => {
      store.push('address-type', model);
    });
    const countries = Ember.$('[data-preload-countries]').data('configuration');
    countries.forEach((model) => {
      store.push('country', model);
    });
    const state_list = Ember.$('[data-preload-states_us]').data('configuration');
    state_list.forEach((model) => {
      store.push('state', model);
    });
    const status_list = Ember.$('[data-preload-person-statuses]').data('configuration');
    status_list.forEach((model) => {
      store.push('status', model);
    });
    const loc_status_list = Ember.$('[data-preload-location-statuses]').data('configuration');
    loc_status_list.forEach((model) => {
      store.push('location-status', model);
    });
    const ticket_status_list = Ember.$('[data-preload-ticket-statuses]').data('configuration');
    ticket_status_list.forEach((model) => {
      store.push('ticket-status', model);
    });
    const ticket_priority_list = Ember.$('[data-preload-ticket-priorities]').data('configuration');
    ticket_priority_list.forEach((model) => {
      store.push('ticket-priority', model);
    });
    const currency_list = Ember.$('[data-preload-currencies]').data('configuration');
    for (let key in currency_list) {
      store.push('currency', currency_list[key]);
    }
    const setting_list = Ember.$('[data-preload-settings]').data('configuration');
    setting_list.forEach((model) =>  {
      store.push('setting', model);
    });
    const location_level_list = Ember.$.extend(true, [], Ember.$('[data-preload-location-levels]').data('configuration'));
    location_level_list.forEach((model) => {
      model.children_fks = model.children || [];
      model.parent_fks = model.parents || [];
      delete model.children;
      delete model.parents;
      store.push('location-level', model);
    });
    const role_list = Ember.$.extend(true, [], Ember.$('[data-preload-roles]').data('configuration'));
    const role_deserializer = this.get('RoleDeserializer');
    role_list.forEach((model) => {
      role_deserializer.deserialize(model, model.id);
      if (model.location_level_fk) {
        let loc_level = store.find('location-level', model.location_level_fk);
        let existing_roles = loc_level.get('roles') || [];
        loc_level.set('roles', existing_roles.concat([model.id]));
        loc_level.save();
        delete model.location_level;
      }
      store.push('role', model);
    });
    const role_types_list = Ember.$('[data-preload-role-types]').data('configuration');
    role_types_list.forEach((model, index) => {
      store.push('role-type', {id: index+1, name: model});
    });
    const filterset_list = Ember.$('[data-preload-saved-filterset]').data('configuration');
    filterset_list.forEach(filterset => {
      store.push('filterset', filterset);
    });
    const model_default_order_definitions = Ember.$('[data-preload-default-model-ordering]').data('configuration');
    Object.keys(model_default_order_definitions).forEach(function(key) {
      let order = model_default_order_definitions[key];
      store.push('model-ordering', {id: key, order: order});
    });
    const locale_list = Ember.$('[data-preload-locales]').data('configuration');
    locale_list.forEach((model, index) => {
      store.push('locale', model);
    });
    const person_current = Ember.$.extend(true, [], Ember.$('[data-preload-person-current]').data('configuration'));
    let current_locale = store.find('locale', person_current.locale);
    config.i18n.currentLocale = current_locale.get('locale');
    //Sets current user
    store.push('person-current', person_current);
    var person_deserializer = this.get('PersonDeserializer');
    // push in 'logged in' Person
    person_current.locale = current_locale;
    person_deserializer.deserialize(person_current, person_current.id);
    // Set the current user's time zone
    // TODO: use moment.tz.guess() when it becomes available - https://github.com/moment/moment-timezone/pull/220
    // TODO: allow timezone to be overridden at the system/role/user level
    let zone = '';
    if(!window.Intl){
      zone = 'America/Los_Angeles';
    }else{
      zone = window.Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    this.get('moment').changeTimeZone(zone);

    return this.get('translationsFetcher').fetch();

  },
  setupController(controller, hash) {
    controller.set('tabs', this.get('store').find('tab'));
  },
  afterModel(){
    this.set('i18n.locale', config.i18n.currentLocale);
    Ember.$('.loading-image').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
      Ember.$('.application-loading').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
        Ember.$('.loading-image').remove();
        Ember.$('.application-loading').remove();
      });
      Ember.$('.application-loading').addClass('fadeOut');
    });
    Ember.$('.loading-image').addClass('bounceOut');
  },
  actions: {
    error(error, transition) {
      if(error){
        return this.transitionTo('error');
      }
    },
    cancel_modal() {
      Ember.$('.t-modal').modal('hide');
    },
    closeTabMaster(tab, closeTabAction=null){
      const tab_id = tab.get('model_id') ? tab.get('model_id') : tab.get('id');//model_id is the uuid and id might be a 'dtd123' if single tab
      let model = this.get('store').find(tab.get('doc_type'), tab_id);
      if (model && model.get('isDirtyOrRelatedDirty')) {
        Ember.$('.t-modal').modal('show');
        this.trx.attemptedTabModel = tab;
        this.trx.attemptedTransitionModel = model;
        this.trx.attemptedAction = 'closeTabMaster';
      } else {
        if(model.get('content')){
          model.rollback();//note: cleans up invalid contact info
        }
        Ember.$('.t-modal').modal('hide');
        let temp = this.router.generate(this.controller.currentPath);
        temp = temp.split('/').pop();

        if(tab.get('transitionCallback')) {
          if(model.get('singleTabId') && !tab.get('newModel')) {
            return tab.get('transitionCallback')();//return because singleTabs return from callback
          } else{
            tab.get('transitionCallback')();
          } 
        }
        const closeTabId = model.get('singleTabId') ? model.get('singleTabId') : model.get('id');
        if(temp === tab_id || tab.get('newModel')){
          /* jshint ignore:start */
          closeTabAction && tab.get('closeTabRedirect') ? this.transitionTo(tab.get('closeTabRedirect')) : this.transitionTo(tab.get('redirect'));
          /* jshint ignore:end */
          if (tab.get('newModel') && !tab.get('saveModel')) {
            this.get('tabList').closeTab(closeTabId);
            //TODO: check as to why this is needed
            model.removeRecord();
          }
        }else if(this.controller.currentPath !== tab.get('redirect')){
          this.transitionTo(this.controller.currentPath);
        }else if(typeof tab.get('redirect') !== undefined){
          this.transitionTo(tab.get('redirect'));
        }
        //close tab should not care what the id is...just the model
        this.get('tabList').closeTab(closeTabId);
      }
    },
    delete(tab, callback, id){
      const store = this.get('store');
      callback().then(() => {
        this.send('closeTabMaster', tab);
      }).then(() => {
      });
    }
  }
});

export default ApplicationRoute;
