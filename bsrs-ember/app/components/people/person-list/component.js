import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
  layoutName: 'components/grid-view',
  columns: [{
    field: 'status.translated_name',
    headerLabel: 'admin.person.label.status',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true,
    templateName: 'tickets/ticket-status-tag',
    classNames: ['person-status']
  }, {
    field: 'fullname',
    headerLabel: 'admin.person.label.fullname',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true
  }, {
    field: 'username',
    headerLabel: 'admin.person.label.username',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true
  }, {
    field: 'title',
    headerLabel: 'admin.person.label.title',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true
  }, {
    field: 'role.name',
    headerLabel: 'admin.person.label.role-name',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true
  }, ]
});