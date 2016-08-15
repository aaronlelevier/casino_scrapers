import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';

export default Ember.Component.extend({
  repository: injectRepo('assignment'),
  uuid: injectUUID('uuid'),
  simpleStore: Ember.inject.service(),
  addFilterDisabled: false,
  init() {
    this._super(...arguments);
    // Array that proxies all of the pfilters.  Thus changing the pfilter (add_pf && rmeove_pf) wont tear down component and cause err
    const pfilters = this.get('model').get('pf');
    this.filterIds = pfilters.mapBy('id').length > 0 ? pfilters.mapBy('id') : [1] ;
    if (pfilters.get('length') === 0 || pfilters.objectAt(0).get('field') === 'auto_assign') {
      // if pfliter.key === auto_assign, make sure btn is disabled
      this.set('addFilterDisabled', true);
    }
  },
  /* @method _filterResponse
  *  @param {object} response - list api response
  *  @param {int} index - nth db-fetch-power select
  *  @return {array} - filters plain js objects
  *  filter options before setting - if have at least one pfilter, don't show auto assign.
  */
  _filterResponse(response, index) {
    const model = this.get('model');
    const pfilters = model.get('pf');
    const filter_ids = pfilters.mapBy('id');
    return response.results.filter(avail_filter => {
      if (avail_filter.lookups.hasOwnProperty('id')) {
        // loop through pfilters and check to see if already selected this dynamic pfilters
        return pfilters.reduce((prev, pfilter) => {
          return prev && pfilter.lookups.id !== avail_filter.lookups.id;
        }, true);
      } else {
        // if not dynamic then if not already selected return true
        return !filter_ids.includes(avail_filter.id);
      }
    }).filter(avail_filter => {
      // only show on first db-fetch component
      if (avail_filter.field !== 'auto_assign') {
        return true;
      } else if (index === 0) {
        // // defend against tabs here. If the 'auto_assign' filter is in use
        // // in another tab, it should not be available
        return this.get('simpleStore').find('assignment').reduce((prev, obj) => {
          return prev && !obj.get('pf').isAny('field', 'auto_assign');
        }, true);
      } else {
        return false;
      }
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
      case 1: pf & filterIds > 1 => remove pf and slice filterIds array
      case 2: pf & filterIds === 1 => remove pf, don't slice filterIds array, disable add-btn
      case 3: no pf & filterIds > 1 => pop last filterIds b/c only allow one empty filter placeholder
      case 4: no pf & filterIds === 1 => don't do anything b/c user removed all pf and
        already have empty filter placeholder
    */
    delete(pf) {
      const filterIds = this.get('filterIds');
      if (filterIds.length === 1) {
        if (pf) {
          this.get('model').remove_pf(pf.get('id'));
          this.set('addFilterDisabled', true);
        }
        return;
      }
      if (pf) {
        this.get('model').remove_pf(pf.get('id'));
        const indx = filterIds.indexOf(pf.get('id'));
        if (indx === -1){
          this.set('filterIds', filterIds.slice(0, indx));
        } else {
          this.set('filterIds', filterIds.slice(0, indx).concat(filterIds.slice(indx+1, filterIds.length)));
        }
      } else {
        filterIds.pop();
        this.set('filterIds', filterIds);
        this.toggleProperty('addFilterDisabled');
      }
    },
    /* @method setAssigmentFilter
    * @param {object} old_pfilter - is either undefined or a model.pf instance
    * @param {object} pfilter - is the selected pfilter
    */
    setAssignmentFilter(old_pfilter, pfilter) {
      const model = this.get('model');
      if (old_pfilter) {
        model.remove_pf(old_pfilter.get('id'));
      }
      model.add_pf(pfilter);
      if (pfilter.field === 'auto_assign') {
        this.set('addFilterDisabled', true);
      } else {
        this.toggleProperty('addFilterDisabled');
      }
    },
    /* @method fetchFilters
    * fetches pfilters that are filtered down if already used as a filter && if auto assigned pfilter already used
    * The only filtering of filters on the django side is `auto_assign`
    */
    fetchFilters(index) {
      this.get('repository').getFilters().then((response) => {
        const filtered_response = this._filterResponse(response, index);
        this.set('options', filtered_response);
      });
    }
  }
});
