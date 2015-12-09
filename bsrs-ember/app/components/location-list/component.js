import Ember from 'ember';
import GridViewComponent from 'bsrs-ember/components/grid-view-2/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view-2',
    searchable: ['name', 'number', 'status.name'],
    translatable: ['status.name'],
    nonsearchable: ['location_level']
});
