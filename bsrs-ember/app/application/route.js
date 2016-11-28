import Ember from 'ember';
const { run, set } = Ember;
import config from 'bsrs-ember/config/environment';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import parseError from 'bsrs-ember/utilities/error-response';
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
  handleApplicationNotice(xhr, model) {
    if (xhr.status >= 400) {
      const error = parseError(xhr.status, xhr.responseText);
      this.controllerFor('application').handleNotfication(error);
      set(model, 'ajaxError', error);
    }
  },
  actions: {
    /* DESKTOP */
    closeTabMaster(tab, {action='closeTab', deleteCB=null, confirmed=false}={}) {
      /* Find model based on stored id in tab */
      const tab_id = tab.get('model_id') ? tab.get('model_id') : tab.get('id');
      const model = this.get('simpleStore').find(tab.get('module'), tab_id);
      const tabService = this.get('tabList');
      if (tabService.showModal(tab, action, confirmed)) {
        // strings set on controller to control logic in the template
        this.controllerFor('application').set('action', action);
        this.controllerFor('application').set('module', tab.get('module'));
        this.controllerFor('application').toggleProperty('showModal');
        this.trx.attemptedTabModel = tab;
        this.trx.attemptedTransitionModel = model;
        this.trx.attemptedAction = 'closeTabMaster';
        this.trx.closeTabAction = action;
        this.trx.deleteCB = deleteCB;
        this.trx.tabService = tabService;

      } else {
        // callback to do stuff like batch delete attachments
        tabService.callCB(tab, model);

        /* Redirect if clicked x on tab but stay on route if on other route...If new route, close tab, transition if at same module, and remove the model if in unsaved state (and not dirty) */
        const currentPath = this.router.generate(this.controllerFor('application').currentPath);
        const temp = currentPath.split('/').pop();
        const currentLocation = tab.get('currentLocation');
        if (temp === String(tab_id) || (tab.get('newModel') && currentLocation === this.controllerFor('application').currentPath)) {
          tabService.redirectRoute(tab, action, confirmed, this.transitionTo.bind(this));
        }

        /* close tab
         * if rollback, then saveModel is undefined and newModel is true
         * if save, don't removeRecord
         * need run scheduleOne afterRender b/c save button needs to ask model if dirty and don't want to remove record while still on page
        */
        const newModel = tab.get('newModel');
        const savedModel = tab.get('saveModel');
        tabService.closeTab(tab, action);
        if (newModel && !savedModel) {
          run.scheduleOnce('afterRender', this, function() {
            model.removeRecord();
          });
        }
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
          this.send('closeTabMaster', tab, {action:'save'});
        } else if (update && updateActivities) {
          //TICKET sends update in args
          return activityRepository.find('ticket', 'tickets', pk, model);
        }
      }).catch((xhr) => {
        this.handleApplicationNotice(xhr, model);
      });
    },

    /* MOBILE */
    closeMobileDetail(redirectRoute) {
      this.transitionTo(redirectRoute);
    },
    /**
     * @method actions.notify
     * used for errors/notifications coming from child routes/components
     */
    notify(error) {
      this.controllerFor('application').handleNotfication(error);
    }
  }
});

export default ApplicationRoute;
