import GridViewComponent from 'bsrs-ember/components/grid-view-2/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view-2',
    searchable: ['fullname', 'username', 'title', 'role.name'],
    nonsearchable: ['employee_id']
});
