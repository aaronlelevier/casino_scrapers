import Ember from 'ember';
const { run } = Ember;
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import { belongs_to, belongs_to_extract, belongs_to_extract_contacts } from 'bsrs-components/repository/belongs-to';
import copySettingsToFirstLevel from 'bsrs-ember/utilities/copy-settings-to-first-level';
import OptConf from 'bsrs-ember/mixins/optconfigure/person';


var extract_role_location_level = function(model, store) {
  let role = store.find('role', model.role);
  if (role.get('id')) {
    let location_level = role.get('location_level');
    let location_level_pk = location_level.get('id');
    if(location_level_pk) {
      let role_pk = model.role;
      let location_level = store.find('location-level', location_level_pk);
      let existing_roles = location_level.get('roles') || [];
      if (existing_roles.indexOf(role_pk) === -1) {
        store.push('location-level', {id: location_level.get('id'), roles: existing_roles.concat(role_pk)});
      }
      location_level.save();
      store.push('role', {id: role.get('id'), location_level_fk: location_level_pk});
    }
    return location_level_pk;
  }
};

var extract_role = function(model, store) {
  let role_pk = model.role;
  let role = store.find('role', model.role);
  let location_level_fk = extract_role_location_level(model, store);
  let existing_people = role.get('people') || [];
  if (role.get('content') && existing_people.indexOf(model.id) === -1) {
    store.push('role', {id: role.get('id'), people: existing_people.concat(model.id)});
  }
  delete model.role;
  return [role_pk, location_level_fk];
};

var extract_person_location = function(model, store, location_level_fk, location_deserializer) {
    let server_locations_sum = [];
    let prevented_duplicate_m2m = [];
    let all_person_locations = store.find('person-location');
    let locations = model.locations || [];
    locations.forEach((location_json) => {
      let person_locations = all_person_locations.filter((m2m) => {
        return m2m.get('location_pk') === location_json.id && m2m.get('person_pk') === model.id;
      });
      if(person_locations.length === 0) {
        const pk = Ember.uuid();
        server_locations_sum.push(pk);
        // Use deserializer to extract llevel. change_role depends on having llevel setup
        location_deserializer.deserialize(location_json, location_json.id);
        run(() => {
          store.push('person-location', {id: pk, person_pk: model.id, location_pk: location_json.id});
        });
      }else{
        prevented_duplicate_m2m.push(person_locations[0].get('id'));
      }
    });
    server_locations_sum.push(...prevented_duplicate_m2m);
    let m2m_to_remove = all_person_locations.filter(function(m2m) {
      return !server_locations_sum.includes(m2m.get('id')) && m2m.get('person_pk') === model.id;
    });
    m2m_to_remove.forEach(function(m2m) {
      run(() => {
        store.push('person-location', {id: m2m.get('id'), removed: true});
      });
    });
    delete model.locations;
    model.person_locations_fks = server_locations_sum;
};

var extract_locale = (model, store) => {
  const locale_id = model.locale || store.find('person', model.id).get('locale_fk');
  const locale = store.find('locale', locale_id);
  let existing_people = locale.get('people') || [];
  existing_people = existing_people.indexOf(model.id) > -1 ? existing_people : existing_people.concat(model.id);
  store.push('locale', {id: locale.get('id'), people: existing_people});
  model.locale_fk = locale.get('id');
  delete model.locale;
};

var PersonDeserializer = Ember.Object.extend(OptConf, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('status', 'person', 'person');
  },
  LocationDeserializer: injectDeserializer('location'),
  deserialize(response, options) {
    let location_deserializer = this.get('LocationDeserializer');
    if (typeof options === 'undefined') {
      this._deserializeList(response);
    } else {
      return this._deserializeSingle(response, options, location_deserializer);
    }
  },
  _deserializeSingle(model, id, location_deserializer) {
    let store = this.get('simpleStore');
    const existing = store.find('person', id);
    let location_level_fk;
    let person = existing;
    if (!existing.get('id') || existing.get('isNotDirtyOrRelatedNotDirty')) {
      model.email_fks = belongs_to_extract_contacts(model, store, 'email', 'emails');
      model.phone_number_fks = belongs_to_extract_contacts(model, store, 'phonenumber', 'phone_numbers');
      model.address_fks = belongs_to_extract_contacts(model, store, 'address', 'addresses');
      [model.role_fk, location_level_fk] = extract_role(model, store);
      extract_person_location(model, store, location_level_fk, location_deserializer);
      extract_locale(model, store);
      model.detail = true;
      model = copySettingsToFirstLevel(model);
      run(() => {
        person = store.push('person', model);
        belongs_to_extract(model.status_fk, store, person, 'status', 'person', 'people');
        person.save();
      });
    }
    return person;
  },
  _deserializeList(response) {
    const store = this.get('simpleStore');
    response.results.forEach((model) => {
      [model.role_fk] = extract_role(model, store);
      const status_json = model.status;
      delete model.status;
      const person = store.push('person-list', model);
      this.setup_status(status_json, person);
      // belongs_to_extract(status_json, store, person, 'status', 'person', 'people');
    });
  }
});

export default PersonDeserializer;
