var BSRS_LOCATION_LEVEL_DEFAULTS_OBJECT = (function() {
  var factory = function() {
  };
  factory.prototype.defaults = function() {
    return {
      idOne: '85c18266-dfca-4499-9cff-7c5c6970af7e',//company
      idTwo: 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f',//department
      idThree: 'c42bd2fc-d959-4896-9b89-aa2b2136ab9a',//region
      idDistrict: '73dcbd73-8fad-4152-b92c-3408c2029a65',
      idStore: '8854f6c5-58c7-4849-971f-e8df9e15e559',
      idLossRegion: 'f7199d15-b78b-4db9-b28f-cc95b4662804',
      idLossDistrict: '558d3cb9-f076-4303-a818-84799806d698',
      idFacility: 'ef2b1f9c-f277-433f-8431-bda21d2d9a74',
      idRegion: 'ef2b1f9c-f277-433f-8431-bda21d2d9a75',
      nameCompany: 'Company',
      nameFacilityManagement: 'Facility Management',
      nameLossPreventionRegion: 'Loss Prevention Region',
      nameDistrict: 'District',
      lossPreventionDistrict: 'Loss Prevention District',
      nameDepartment: 'Department',
      nameGridOne: 'Company-tsiname11',
      nameGrid: 'Company-tsiname16',
      nameStore: 'Store',
      nameStoreUn: 'Store',
      nameRegion: 'Region',
      nameAnother: 'Another Name',
      unusedId: 'cadba3ba-a533-44e0-ab1f-57cc1b052138',
      districtChildren: ['8854f6c5-58c7-4849-971f-e8df9e15e559', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f'],
      companyChildren: ['c42bd2fc-d959-4896-9b89-aa2b2136ab9a','73dcbd73-8fad-4152-b92c-3408c2029a65','8854f6c5-58c7-4849-971f-e8df9e15e559',
        'ef2b1f9c-f277-433f-8431-bda21d2d9a74','f7199d15-b78b-4db9-b28f-cc95b4662804','558d3cb9-f076-4303-a818-84799806d698', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f'],
        newTemplateChildren: ['85c18266-dfca-4499-9cff-7c5c6970af7e', 'c42bd2fc-d959-4896-9b89-aa2b2136ab9a','73dcbd73-8fad-4152-b92c-3408c2029a65','8854f6c5-58c7-4849-971f-e8df9e15e559',
          'ef2b1f9c-f277-433f-8431-bda21d2d9a74','f7199d15-b78b-4db9-b28f-cc95b4662804','558d3cb9-f076-4303-a818-84799806d698', 'b42bd1fc-d959-4896-9b89-aa2b2136ab7f']
    };
  };
  return factory;
})();

if (typeof window === 'undefined') {
  module.exports = new BSRS_LOCATION_LEVEL_DEFAULTS_OBJECT().defaults();
} else {
  define('bsrs-ember/vendor/defaults/location-level', ['exports'], function (exports) {
    'use strict';
    return new BSRS_LOCATION_LEVEL_DEFAULTS_OBJECT().defaults();
  });
}
