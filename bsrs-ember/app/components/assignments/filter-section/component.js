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
    const pfilters = this.get('model').get('pf');
    if (pfilters.objectAt(0) && pfilters.objectAt(0).get('field') === 'auto_assign') {
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
    const filter_ids = pfilters.mapBy('source_id');
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
        // defend against tabs here. If the 'auto_assign' filter is in use
        // in another tab, it should not be available
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
      model.add_pf({id: id, lookups: {}});
    },
    /* @method delete
    * @param {object} pf
    */
    delete(pf) {
      this.get('model').remove_pf(pf.get('id'));
    },
    /* @method setAssigmentFilter
    * @param {object} old_pfilter - is either undefined or a model.pf instance
    * @param {object} pfilter - is the selected pfilter
    */
    setAssignmentFilter(old_pfilter, avail_filter) {
      const id = old_pfilter.get('id');
      old_pfilter.get('criteria').forEach(c => {
        old_pfilter.remove_criteria(c.get('id'));
      });
      this.get('simpleStore').push('pfilter', {
        id: id,
        source_id: avail_filter.id,
        key: avail_filter.key,
        field: avail_filter.field,
        lookups: avail_filter.lookups,
      });
      if (avail_filter.field === 'auto_assign') {
        this.set('addFilterDisabled', true);
      } else {
        this.set('addFilterDisabled', false);
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
