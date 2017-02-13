import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
  layoutName: 'components/grid-view',
  columns: [{
    field: 'verbose_name',
    headerLabel: 'admin.category.label.name',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true
  }, {
    field: 'description',
    headerLabel: 'admin.category.label.description',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true
  }, {
    field: 'label',
    headerLabel: 'admin.category.label.label',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true
  }, {
    field: 'cost_amount',
    headerLabel: 'admin.category.label.cost_amount',
    headerIsTranslatable: true
  }, {
    field: 'cost_code',
    headerLabel: 'admin.category.label.cost_code',
    headerIsTranslatable: true
  }]
});
