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
    this.filterIds = this.get('model').get('pf').mapBy('id');
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
      this.toggleProperty('addFilterDisabled');
    },
    /* @method fetchFilters
    * fetches pfilters that are filtered down if already used as a filter && if auto assigned pfilter already used
    */
    fetchFilters() {
      this.get('repository').getFilters().then((response) => {
        this.set('options', response);
      });
    }
  }
});
