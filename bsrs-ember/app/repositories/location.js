import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import { LOCATIONS_URL } from 'bsrs-ember/utilities/urls';

var LocationRepo = Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: 'location',
  typeGrid: 'location-list',
  garbage_collection: ['location-list', 'location-status-list'],
  url: LOCATIONS_URL,
  uuid: injectUUID('uuid'),
  LocationDeserializer: inject('location'),
  deserializer: Ember.computed.alias('LocationDeserializer'),
  findLocationChildren(search_criteria, extra_params) {
    const { llevel, pk } = extra_params;
    let url = `${LOCATIONS_URL}get-level-children/${llevel}/${pk}/`;
    if (search_criteria) {
      url += `location__icontains=${search_criteria}/`;
    }
    return PromiseMixin.xhr(url, 'GET').then((response) => {
      return response.results;
    });
  },
  findLocationParents(search_criteria, extra_params) {
    const { llevel, pk } = extra_params;
    let url = `${LOCATIONS_URL}get-level-parents/${llevel}/${pk}/`;
    if (search_criteria) {
      url += `location__icontains=${search_criteria}/`;
    }
    return PromiseMixin.xhr(url, 'GET').then((response) => {
      return response.results;
    });
  },
  /* @method findTicket - searches locations by name */
  findTicket(search) {
    let url = LOCATIONS_URL;
    search = search ? search.trim() : search;
    if (search) {
      url += `location__icontains=${search}/`;
    }
    return PromiseMixin.xhr(url, 'GET').then((response) => {
      return response.results;
    });
  },
  findPersonsLocations(search_criteria, filter) {
    let url = LOCATIONS_URL;
    if (filter && search_criteria) {
      url += `location__icontains=${search_criteria}/?location_level=${filter['location_level']}`;
    } else if (search_criteria) {
      // Role may not have a llevel
      url += `location__icontains=${search_criteria}/`;
    }
    return PromiseMixin.xhr(url, 'GET').then((response) => {
      return response.results;
    });
  },
  findLocationSelect(search_criteria, filter) {
    let url = LOCATIONS_URL;
    if (search_criteria) {
      // DT New
      url += `location__icontains=${search_criteria}/`;
    }
    return PromiseMixin.xhr(url, 'GET').then((response) => {
      return response.results;
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
    let url = LOCATIONS_URL;
    if(typeof filter !== 'undefined') {
      let name = Object.keys(filter)[0];
      let value = filter[Object.keys(filter)[0]];
      url = url + '?' + name + '=' + value;
    }
    return url;
  }
});

export default LocationRepo;
