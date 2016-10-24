import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import moment from 'moment';
const { Route, inject } = Ember;

var ApplicationRoute = Route.extend({
  RoleDeserializer: injectDeserializer('role'),
  PersonDeserializer: injectDeserializer('person'),
  personCurrent: inject.service(),
  translationsFetcher: inject.service(),
  i18n: inject.service(),
  moment: inject.service(),
  tabList: inject.service(),
  beforeModel() {
    let store = this.get('simpleStore');
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
      /* Used for dropdown select.  role_type is str field */
      store.push('role-type', {id: index+1, name: model});
    });
    const filterset_list = Ember.$('[data-preload-saved-filterset]').data('configuration');
    filterset_list.forEach(filterset => {
      store.push('filterset', filterset);
    });
    const locale_list = Ember.$('[data-preload-locales]').data('configuration');
    locale_list.forEach((model) => {
      store.push('locale', model);
    });
    const person_current = Ember.$.extend(true, [], Ember.$('[data-preload-person-current]').data('configuration'));
    let current_locale = store.find('locale', person_current.locale);
    config.i18n.currentLocale = current_locale.get('locale');

    // Set timezone and store in person-current
    let zone = moment.tz.guess();
    if(!zone){
      zone = 'America/Los_Angeles';
    }
    this.get('moment').changeTimeZone(zone);
    //TODO: Add preferred timezone to the bootstrap data for timezone override
    if(!person_current.timezone){
      person_current.timezone = zone;
      this.get('personCurrent').set('timezone', zone);
    }

    //Sets current user
    store.push('person-current', person_current);
    var person_deserializer = this.get('PersonDeserializer');
    // push in 'logged in' Person
    person_deserializer.deserialize(person_current, person_current.id);

    return this.get('translationsFetcher').fetch();

  },
  setupController(controller) {
    controller.set('tabs', this.get('simpleStore').find('tab'));
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
    error(error) {
      if(error){
        /* intermediateTransitionTo does not modify the url or window history so when page is refreshed, they are redirected to route user intended */
        return this.intermediateTransitionTo('error');
      }
    },
    /* DESKTOP */
    closeTabMaster(tab, {action='closeTab', deleteCB=null, confirmed=false}={}) {
      /* Find model based on stored id in tab */
      const tab_id = tab.get('model_id') ? tab.get('model_id') : tab.get('id');
      const model = this.get('simpleStore').find(tab.get('module'), tab_id);
      const tabService = this.get('tabList');
      if (tabService.showModal(tab, action, confirmed)) {
        this.controller.set('action', action);
        this.controller.set('module', tab.get('module'));
        this.controller.toggleProperty('showModal');
        this.trx.attemptedTabModel = tab;
        this.trx.attemptedTransitionModel = model;
        this.trx.attemptedAction = 'closeTabMaster';
        this.trx.closeTabAction = action;
        this.trx.deleteCB = deleteCB;
        this.trx.tabService = tabService;

      } else {
        /* rollback if contact info */
        if(model.get('id')) { model.rollback(); }

        tabService.callCB(tab);

        /* Redirect if clicked x on tab but stay on route if on other route...If new route, close tab, transition if at same module, and remove the model if in unsaved state (and not dirty) */
        const currentPath = this.router.generate(this.controller.currentPath);
        const temp = currentPath.split('/').pop();
        const currentLocation = tab.get('currentLocation');
        if (temp === String(tab_id) || (tab.get('newModel') && currentLocation === this.controller.currentPath)) {
          tabService.redirectRoute(tab, action, confirmed, this.transitionTo.bind(this));
        }

        /* close tab
        if rollback, then saveModel is undefined and newModel is true
        if save, don't removeRecord
        */
        if (tab.get('newModel') && !tab.get('saveModel')) {
          model.removeRecord();
        }
        tabService.closeTab(tab, action);
      }
    },
    delete(model, repository){
      const id = model.get('id');
      const deleteCB = function() {
        return repository.delete(id);
      };
      const service = this.get('tabList');
      const tab = service.findTab(id);
      this.send('closeTabMaster', tab, {action:'delete', deleteCB:deleteCB});
    },
    deleteAttachment(tab, callback){
      this.send('closeTabMaster', tab, {action:'deleteAttachment', deleteCB:callback});
    },
    save(model, repository, tab, activityRepository, update, updateActivities=false) {//update arg determines if transition or not and close out tab
      if(update && model.get('isNotDirtyOrRelatedNotDirty')){
        return;
      }
      const pk = model.get('id');
      // some components used for single and new, so need to handle both situations
      const persisted = model.get('new');
      const action = persisted === true ? 'insert' : 'update';
      return repository[action](model).then(() => {
        // if new model then set saveModel for use in application route so doesn't remove record for new models
        tab.set('saveModel', persisted);
        if(!update){
          //All other routes
           this.send('closeTabMaster', tab, {action:'closeTab'});
        } else if (update && updateActivities) {
          //TICKET sends update in args
          return activityRepository.find('ticket', 'tickets', pk, model);
        }
      }, (xhr) => {
        if(xhr.status === 400) {
          var response = JSON.parse(xhr.responseText), errors = [];
          Object.keys(response).forEach(function(key) {
            errors.push({name: key, value: response[key].toString()});
          });
          this.set('ajaxError', errors);
        }
      });
    },
    /* MOBILE */
    closeMobileDetail(redirectRoute) {
      this.transitionTo(redirectRoute);
    },
  }
});

export default ApplicationRoute;
