import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    searchable: ['fullname', 'username', 'title'],
    nonsearchable: ['role', 'employee_id']
});
