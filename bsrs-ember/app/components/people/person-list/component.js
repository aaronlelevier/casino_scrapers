import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
  layoutName: 'components/grid-view',
  columns: [{
    field: 'fullname',
    classNames: ['person-fullname'],
    headerLabel: 'admin.person.label.fullname',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true,
    templateName: 'photo-avatar',
  }, {
    field: 'username',
    classNames: ['person-username'],
    headerLabel: 'admin.person.label.username',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true
  }, {
    field: 'title',
    classNames: ['person-title'],
    headerLabel: 'admin.person.label.title',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true
  }, {
    field: 'role.name',
    classNames: ['person-role'],
    headerLabel: 'admin.person.label.role-name',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true,
    filterComponent: 'grid/filters/checkbox-list',
    filterModelName: 'role',
    multiple: true,
  }, {
    field: 'status.name',
    headerLabel: 'admin.person.label.status',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true,
    templateName: 'tickets/ticket-status-tag',
    classNames: ['person-status'],
    filterComponent: 'grid/filters/checkbox-list',
    filterModelName: 'status',
    multiple: true,
  }]
});
