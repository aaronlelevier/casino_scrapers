import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import findByName from 'bsrs-ember/utilities/find-by-name';

var PREFIX = config.APP.NAMESPACE;
var LOCATION_URL = PREFIX + '/admin/locations/';

var LocationRepo = Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: Ember.computed(function() { return 'location'; }),
  typeGrid: Ember.computed(function() { return 'location-list'; }),
  garbage_collection: Ember.computed(function() { return ['location-list', 'location-status-list']; }),
  url: Ember.computed(function() { return LOCATION_URL; }),
  uuid: injectUUID('uuid'),
  LocationDeserializer: inject('location'),
  deserializer: Ember.computed.alias('LocationDeserializer'),
  update(model) {
    return PromiseMixin.xhr(LOCATION_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
      model.save();
      model.saveRelated();
    });
  },
  findLocationChildren(search_criteria, extra_params) {
    const { llevel, pk } = extra_params;
    let url = `${LOCATION_URL}get-level-children/${llevel}/${pk}/`;
    if (search_criteria) {
      url += `location__icontains=${search_criteria}/`;
    }
    return PromiseMixin.xhr(url, 'GET').then((response) => {
      return response;
    });
  },
  findLocationParents(search_criteria, extra_params) {
    const { llevel, pk } = extra_params;
    let url = `${LOCATION_URL}get-level-parents/${llevel}/${pk}/`;
    if (search_criteria) {
      url += `location__icontains=${search_criteria}/`;
    }
    return PromiseMixin.xhr(url, 'GET').then((response) => {
      return response;
    });
  },
  /* @method findTicket - searches locations by name */
  findTicket(search) {
    let url = LOCATION_URL;
    search = search ? search.trim() : search;
    if (search) {
      url += `location__icontains=${search}/`;
    }
    return PromiseMixin.xhr(url, 'GET').then((response) => {
      return response;
    });
  },
  findPersonsLocations(search_criteria, filter) {
    let url = LOCATION_URL;
    if (filter && search_criteria) {
      url += `location__icontains=${search_criteria}/?location_level=${filter['location_level']}/`;
    } else if (search_criteria) {
      // Role may not have a llevel
      url += `location__icontains=${search_criteria}/`;
    }
    return PromiseMixin.xhr(url, 'GET').then((response) => {
      return response;
    });
  },
  findLocationSelect(search_criteria, filter) {
    let url = LOCATION_URL;
    if (search_criteria) {
      // DT New
      url += `location__icontains=${search_criteria}/`;
    }
    return PromiseMixin.xhr(url, 'GET').then((response) => {
      return response;
    });
  },
  find(filter) {
    //TODO: what is this doing here?  SHould be using grid repo???
    PromiseMixin.xhr(this.format_url(filter), 'GET').then((response) => {
      this.get('LocationDeserializer').deserialize(response);
    });
    return this.get('simpleStore').find('location');
  },
  format_url(filter) {
    let url = LOCATION_URL;
    if(typeof filter !== 'undefined') {
      let name = Object.keys(filter)[0];
      let value = filter[Object.keys(filter)[0]];
      url = url + '?' + name + '=' + value;
    }
    return url;
  }
});

export default LocationRepo;
