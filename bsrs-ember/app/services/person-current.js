import Ember from 'ember';
import { SESSION_URL } from 'bsrs-ember/utilities/urls';
import { eachPermission } from 'bsrs-ember/utilities/permissions';
import { RESOURCES_WITH_PERMISSION, PERMISSION_PREFIXES } from 'bsrs-ember/utilities/constants';
import config from 'bsrs-ember/config/environment';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';

const {
  Mixin, Service, RSVP, computed, inject, get, set, run
} = Ember;

/*
  Sets up computed properties to generate a mixin with various computed
  properties which depend on the `permissions` (array) property.
*/
function setupPermissions() {
  let props = {};
  RESOURCES_WITH_PERMISSION.forEach((resource) => {
    PERMISSION_PREFIXES.forEach((verb) => {
      let prop = `can_${verb}_${resource}`.camelize();
      props[prop] = computed('permissions', function() {
        let permissions = get(this, 'permissions');
        return permissions.includes(`${verb}_${resource}`);
      });
    });
    let propName = `is_read_only_${resource}`.camelize();
    props[propName] = computed('permissions', function() {
      let permissions = get(this, 'permissions');
      let canRead = permissions.includes(`view_${resource}`);
      let canNotEdit = !permissions.includes(`change_${resource}`);
      return canRead && canNotEdit;
    });
  });
  return props;
}
/*
  The permissions mixin generates the various combinations of resources (nouns)
  and actions (verbs) to form computed propertices for each "right".

  The user may have the right to change a ticket if the property for
  `canChangeTicket` is true.

  In addition to the rights read only permissions are generated. A Ticket model
  may computed its own `isReadOnly` property from the `isReadOnlyTicket` propery
  which is generated based on the presece of the `view` action and an excluded
  `change` action on any given resource.

  @class PermissionsMixin
  @static
*/
let PermissionsMixin = Mixin.create(setupPermissions());

/*
  This serivce for the current person provides the users rights, or permissions.
  A mixin configures the various computed properties which depend on the
  permissions (array), e.g. `['view_ticket','change_ticket','add_ticket']`.

  A fetch method is provided to request the current person data from the API.
 
  @class PersonCurrentService
  @requires PermissionsMixin
*/
export default Service.extend(PermissionsMixin, {
  simpleStore: inject.service(),
  PersonDeserializer: injectDeserializer('person'),

  /*
    @property model
    @type Ember.Object
    @requires SimpleStoreService
  */
  model: computed(function(){
    let store = this.get('simpleStore');
    return store.findOne('person-current');
  }).volatile(),

  /*
    @property timezone
    @type String
  */
  timezone: null,

  /*
    The list of permissions, e.g. `['view_ticket','change_ticket','add_ticket']`

    @property permissions
    @type Array
  */
  permissions: computed('model.permissions.[]', function() {
    return get(this, 'model').get('permissions');
  }),

  /*
    @method fetch
    @returns Promise
    @requires SESSION_URL  
  */
  fetch() {
    return new RSVP.Promise((resolve, reject) => {
      Ember.$.get(SESSION_URL)
      .then( (data) => resolve(data) )
      .catch( (error) => reject(error) );
    });
  },

  /* LONG POLLING */
  time: config.POLL_INTERVAL,
  running: null,
  /**
   * set running property and call schedule function
   * @method start
   */
  start(context, func) {
    set(this, 'running', this.schedule(context, func));
  },
  /**
   * set cancel running property.  Only for tests
   * @method stop
   */
  stop() {
    run.cancel(this.get('running'));
  },
  /**
   * recursive loop to set running property and then call itself
   * must apply function after setting running to avoid recursive loop
   * @method schedule
   * @param context
   * @param func - async function
   */
  schedule(context, func) {
    return run.later(this, () => {
      // keep setting the running property to the new function
      set(this, 'running', this.schedule(context, func));
      func.apply(context).then(this.setupPersonCurrent.bind(this));
    }, config.APP.POLL_INTERVAL);
  },
  setupPersonCurrent(person) {
    const store = this.get('simpleStore');
    const current_locale = store.find('locale', person.locale);
    config.i18n.currentLocale = current_locale.get('locale');
    if (!person.timezone) {
      person.timezone = this.get('timezone'); 
    }
    // Set current user
    store.push('person-current', {id: person.id, permissions: person.permissions});
    // Push 'logged in' Person to store
    this.get('PersonDeserializer').deserialize(person, person.id);
  },
});
