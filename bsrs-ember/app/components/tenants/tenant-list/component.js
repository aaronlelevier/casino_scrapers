import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
  layoutName: 'components/grid-view',
  columns: [
    {
      field: 'company_name',
      headerLabel: 'tenant.label.company_name',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true
    },
    {
      field: 'currency.name',
      headerLabel: 'tenant.label.currency',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true
    },
    {
      field: 'country.name',
      headerLabel: 'tenant.label.country',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true,
      classNames: ['tenant-currency'],
      filterComponent: 'grid/filters/currency-select-grid',
      powerSelect: true
    }
  ]
});
