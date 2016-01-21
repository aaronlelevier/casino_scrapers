import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    columns: [
        {field: 'key', headerLabel: 'Key', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'key', headerLabel: 'Key', isTranslatable: true}
    ]
});
