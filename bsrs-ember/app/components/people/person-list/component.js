import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    columns: [
        {field: 'status.translated_name', headerLabel: 'person.label.status', headerIsTranslatable: true, isSortable: true, isFilterable: true, isSearchable: true, templateName: 'tickets/ticket-status-tag', classNames: ['person-status'] },
        {field: 'fullname', headerLabel: 'Name', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'username', headerLabel: 'Username', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'title', headerLabel: 'Title', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'role.name', headerLabel: 'Role', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'employee_id', headerLabel: 'Employee No.'},
    ]
});
