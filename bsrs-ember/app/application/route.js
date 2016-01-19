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
        const person_current_role = store.find('role', person_current.role);
        person_current_role.set('people', [person_current.id]);
        //save so not dirty
        person_current_role.save();

        let current_locale = store.find('locale', person_current.locale);
        config.i18n.currentLocale = current_locale.get('locale');

        store.push('person-current', person_current);

        var location_deserializer = this.get('LocationDeserializer');

        var person_location_pks = [];
        person_current.all_locations_and_children.forEach(function(location) {
            const person_location_pk = Ember.uuid();
            store.push('person-location', {id: person_location_pk, person_pk: person_current.id, location_pk: location.id});
            person_location_pks.push(person_location_pk);
            location_deserializer.deserialize(location, location.id);
        });
        // push in 'logged in' Person
        person_current.locale_fk = current_locale.get('id');
        person_current.person_location_fks = person_location_pks;
        store.push('person', person_current);

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
    },
    actions: {
        cancel_modal() {
            Ember.$('.t-modal').modal('hide');
        },
        closeTabMaster(tab, callback){
            let model = this.get('store').find(tab.get('doc_type'), tab.get('id'));
            if (model && model.get('isDirtyOrRelatedDirty')) {
                Ember.$('.t-modal').modal('show');
                this.trx.attemptedTabModel = tab;
                this.trx.attemptedTransitionModel = model;
                this.trx.attemptedAction = 'closeTabMaster';
            } else {
                Ember.$('.t-modal').modal('hide');
                let temp = this.router.generate(this.controller.currentPath);
                temp = temp.split('/').pop();

                if(tab.get('transitionCallback')) {
                    tab.get('transitionCallback')();
                }

                if(temp === tab.get('id') || tab.get('newModel')){
                    this.transitionTo(tab.get('redirect'));
                    if (tab.get('newModel') && !tab.get('saveModel')) {
                        this.get('tabList').closeTab(model.get('id'));
                        model.removeRecord();
                    }
                }else if(this.controller.currentPath !== tab.get('redirect')){
                    this.transitionTo(this.controller.currentPath);
                }else if(typeof tab.get('redirect') !== undefined){
                    this.transitionTo(tab.get('redirect'));
                }
                this.get('tabList').closeTab(model.get('id'));
            }
            if(callback) {
                callback();
            }
        }
    }
});

export default ApplicationRoute;
