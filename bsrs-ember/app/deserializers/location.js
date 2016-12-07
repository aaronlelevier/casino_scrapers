import Ember from 'ember';
import { belongs_to, belongs_to_extract } from 'bsrs-components/repository/belongs-to';
import { many_to_many } from 'bsrs-components/repository/many-to-many';
import ContactDeserializerMixin from 'bsrs-ember/mixins/deserializer/contact';
import OptConf from 'bsrs-ember/mixins/optconfigure/location';

const { run } = Ember;

var extract_location_level = (model, store) => {
  let location_level_pk = model.location_level;
  let existing_location_level = store.find('location-level', location_level_pk);
  let locations = existing_location_level.get('locations') || [];
  store.push('location-level', {id: location_level_pk, locations: locations.concat(model.id).uniq()});
  //get old location level from location already in store if only a different location level than current
  let existing_location = store.find('location', model.id);
  let old_location_level_fk = existing_location.get('location_level_fk');
  if (old_location_level_fk && old_location_level_fk !== existing_location_level.get('id')) {
    let old_location_level = store.find('location-level', old_location_level_fk);
    let locations = old_location_level.get('locations');
    if (locations.indexOf(model.id) > -1) { locations.removeObject(model.id); }
    run(() => {
      store.push('location-level', {id: old_location_level_fk, locations: locations});
    });
    old_location_level.save();
  }
  delete model.location_level;
  return location_level_pk;
};

var extract_parents = function(model, store) {
  const parents = model.parents || [];
  let prevented_duplicate_m2m = [];
  const server_sum = [];
  const all_location_parents = store.find('location-parents');
  parents.forEach((parent) => {
    const location_parents = all_location_parents.filter((m2m) => {
      return m2m.get('parents_pk') === parent.id && m2m.get('location_pk') === model.id;
    });
    if(location_parents.length === 0) {
      const pk = Ember.uuid();
      server_sum.push(pk);
      const parent_llevel_pk = extract_location_level(parent, store);
      Ember.set(parent, 'location_level_fk', parent_llevel_pk);
      run(() => {
        parent.status_fk = parent.status;
        parent.detail = true;
        delete parent.status;
        const parent_loc = store.push('location', parent);
        store.push('location-parents', {id: pk, location_pk: model.id, parents_pk: parent.id});
        belongs_to_extract(parent.status_fk, store, parent_loc, 'status', 'location', 'locations');
      });
    }else{
      prevented_duplicate_m2m.push(location_parents[0].get('id'));
    }
  });
  server_sum.push(...prevented_duplicate_m2m);
  let m2m_to_remove = all_location_parents.filter((m2m) => {
    return !server_sum.includes(m2m.get('id')) && m2m.get('location_pk') === model.id;
  });
  m2m_to_remove.forEach((m2m) => {
    run(() => {
      store.push('location-parents', {id: m2m.get('id'), removed: true});
    });
  });
  delete model.parents;
  return server_sum;
};

var extract_children = function(model, store) {
  const children = model.children || [];
  let prevented_duplicate_m2m = [];
  const server_sum = [];
  const all_location_children = store.find('location-children');
  children.forEach((child) => {
    const location_children = all_location_children.filter((m2m) => {
      return m2m.get('children_pk') === child.id && m2m.get('location_pk') === model.id;
    });
    if(location_children.length === 0) {
      const pk = Ember.uuid();
      server_sum.push(pk);
      const child_llevel_pk = extract_location_level(child, store);
      Ember.set(child, 'location_level_fk', child_llevel_pk);
      run(() => {
        //TODO: test this
        child.status_fk = child.status;
        child.detail = true;
        delete child.status;
        const child_loc = store.push('location', child);
        store.push('location-children', {id: pk, location_pk: model.id, children_pk: child.id});
        belongs_to_extract(child.status_fk, store, child_loc, 'status', 'location', 'locations');
      });
    }else{
      prevented_duplicate_m2m.push(location_children[0].get('id'));
    }
  });
  server_sum.push(...prevented_duplicate_m2m);
  let m2m_to_remove = all_location_children.filter((m2m) => {
    return !server_sum.includes(m2m.get('id')) && m2m.get('location_pk') === model.id;
  });
  m2m_to_remove.forEach((m2m) => {
    run(() => {
      store.push('location-children', {id: m2m.get('id'), removed: true});
    });
  });
  delete model.children;
  return server_sum;
};

var LocationDeserializer = Ember.Object.extend(OptConf, ContactDeserializerMixin, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('status', 'location');
    belongs_to.bind(this)('country');
    belongs_to.bind(this)('state');
    belongs_to.bind(this)('phone_number_type');
    belongs_to.bind(this)('email_type');
    belongs_to.bind(this)('address_type');
    many_to_many.bind(this)('phonenumbers', 'location');
    many_to_many.bind(this)('emails', 'location');
    many_to_many.bind(this)('addresses', 'location');
  },
  deserialize(response, id) {
    if (id) {
      return this._deserializeSingle(response);
    } else {
      return this._deserializeList(response);
    }
  },
  _deserializeSingle(response) {
    const store = this.get('simpleStore');
    const phonenumber_json = response.phone_numbers;
    const email_json = response.emails;
    const address_json = response.addresses;
    this.extract_emails(response);
    this.extract_phonenumbers(response);
    this.extract_addresses(response);
    response.location_level_fk = extract_location_level(response, store);
    response.location_children_fks = extract_children(response, store);
    response.location_parents_fks = extract_parents(response, store);
    response.detail = true;
    // TODO: Does it come back w/ a status?
    delete response.status;
    let location = store.push('location', response);
    this.setup_phonenumbers(phonenumber_json, location);
    this.setup_emails(email_json, location);
    this.setup_addresses(address_json, location);

    location.save();
    belongs_to_extract(response.status_fk, store, location, 'status', 'location', 'locations');
    return location;
  },
  _deserializeList(response) {
    const store = this.get('simpleStore');
    const results = [];
    response.results.forEach((model) => {
      model.location_level_fk = extract_location_level(model, store);
      const status_json = model.status;
      delete model.status;
      const location = store.push('location-list', model);
      this.setup_status(status_json, location);
      results.push(location);
    });
    return results;
  }
});

export default LocationDeserializer;
