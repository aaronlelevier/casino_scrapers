import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';

export default Ember.Component.extend({
  repository: injectRepo('assignment'),
  uuid: injectUUID('uuid'),
  addFilterDisabled: false,
  init() {
    this._super(...arguments);
    // Array that proxies all of the pfilters.  Thus changing the pfilter (add_pf && rmeove_pf) wont tear down component and cause err
    const pfilters = this.get('model').get('pf');
    this.filterIds = pfilters.mapBy('id');
    if (pfilters.get('length') === 1 && pfilters.objectAt(0).get('field') === 'auto_assign') {
      // if pfliter.key === auto_assign, make sure btn is disabled
      this.set('addFilterDisabled', true);
    }
  },
  _filterResponse(response) {
    const model = this.get('model');
    const filters = model.get('pf');
    const filter_ids = filters.mapBy('id');
    return response.results.filter(avail_filter => {
      // if has lookups populated
      if (avail_filter.lookups && avail_filter.lookups.hasOwnProperty('id')) {
        // loop through filters and check to see if already selected this dynamic filters
        return filters.filter(pfilter => { return pfilter.lookups.id !== avail_filter.lookups.id; });
      } else {
        return Ember.$.inArray(avail_filter.id, filter_ids) === -1;
      }
    }).filter(avail_filter => {
      const field = avail_filter.field;
      return field !== 'auto_assign' && model.get('pf').get('length') > 0;
    });
  },
  actions: {
    /* @method append
    * adds a dummy pfilter model w/ 'new' tag. Not dirty while has new tag
    */
    append(){
      const model = this.get('model');
      const id = this.get('uuid').v4();
      this.set('filterIds', this.filterIds.concat(id));
      this.toggleProperty('addFilterDisabled');
    },
    /* @method delete
    * @param {object} pf - if not present, means delete filter w/ no selected pfilter
    */
    delete(pf) {
      if (pf) {
        this.get('model').remove_pf(pf.get('id'));
        const indx = this.filterIds.indexOf(pf.get('id'));
        this.set('filterIds', this.filterIds.slice(0, indx).concat(this.filterIds.slice(indx+1, this.filterIds.length)));
      } else {
        this.filterIds.pop();
        this.set('filterIds', this.filterIds);
        this.toggleProperty('addFilterDisabled');
      }
    },
    /* @method setAssigmentFilter
    * @param {object} old_pf is the random uuid set in append method
    * @param {object} pf is the selected pfilter
    */
    setAssignmentFilter(old_pfilter, pfilter) {
      const model = this.get('model');
      model.add_pf(pfilter);
      // if (pfilter.key === 'admin.placeholder.auto_assign') {
      //   // if pfliter.key === auto_assign, make sure btn is disabled
      //   this.set('addFilterDisabled', true);
      // }
      this.toggleProperty('addFilterDisabled');
    },
    /* @method fetchFilters
    * fetches pfilters that are filtered down if already used as a filter && if auto assigned pfilter already used
    * The only filtering of filters on the django side is `auto_assign`
    */
    fetchFilters() {
      this.get('repository').getFilters().then((response) => {
        // filter options before setting - if already have one, don't show auto assign.  Also loop through existing filters and remove as well
        const filtered_response = this._filterResponse(response);
        this.set('options', filtered_response);
      });
    }
  }
});
