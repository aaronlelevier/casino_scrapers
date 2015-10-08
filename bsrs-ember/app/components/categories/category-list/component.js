import Ember from 'ember';
import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    searchable: ['name', 'description', 'label'],
    nonsearchable: ['cost_amount', 'cost_code']
});
