import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';

const SPAN_COUNT = 3;

moduleForComponent('grid/helpers/grid-header-column', 'integration: grid-header-column', {
    integration: true
});

test('label will use the column headerLabel property', function(assert) {
    this.set('column', {
        headerLabel: 'foobar',
        isSortable: true,
        isFilterable: true
    });
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    assert.equal($component.find('span:eq(0)').text(), 'foobar');
});

test('sortClass, sortByClass and filterClass are set to invalid-field when both the field and actionClassName not provided', function(assert) {
    this.set('column', {
        headerLabel: 'foobar',
        isSortable: true,
        isFilterable: true
    });
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    assert.ok($component.find('span:eq(0)').hasClass('t-sort-invalid-field'));
    assert.ok($component.find('span:eq(1)').hasClass('t-filter-invalid-field'));
    assert.ok($component.find('span:eq(2)').hasClass('t-sort-invalid-field-dir'));
});

test('sortClass, sortByClass and filterClass are set from the actionClassName if provided', function(assert) {
    this.set('column', {
        headerLabel: 'foobar',
        actionClassName: 'other-thing',
        isSortable: true,
        isFilterable: true
    });
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    assert.ok($component.find('span:eq(0)').hasClass('t-sort-other-thing'));
    assert.ok($component.find('span:eq(1)').hasClass('t-filter-other-thing'));
    assert.ok($component.find('span:eq(1)').hasClass('fa'));
    assert.ok($component.find('span:eq(1)').hasClass('fa-filter'));
    assert.ok($component.find('span:eq(2)').hasClass('t-sort-other-thing-dir'));
    assert.ok($component.find('span:eq(2)').hasClass('fa'));
    assert.ok($component.find('span:eq(2)').hasClass('fa-sort'));
});

test('sortClass, sortByClass and filterClass are set from the actionClassName when both field and actionClassName are provided', function(assert) {
    this.set('column', {
        field: 'hat',
        headerLabel: 'foobar',
        actionClassName: 'other-thing',
        isSortable: true,
        isFilterable: true
    });
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    assert.ok($component.find('span:eq(0)').hasClass('t-sort-other-thing'));
    assert.ok($component.find('span:eq(1)').hasClass('t-filter-other-thing'));
    assert.ok($component.find('span:eq(2)').hasClass('t-sort-other-thing-dir'));
});

test('sortClass, sortByClass and filterClass are set from the field when actionClassName not provided', function(assert) {
    this.set('column', {
        field: 'hat',
        headerLabel: 'foobar',
        isSortable: true,
        isFilterable: true
    });
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    assert.ok($component.find('span:eq(0)').hasClass('t-sort-hat'));
    assert.ok($component.find('span:eq(1)').hasClass('t-filter-hat'));
    assert.ok($component.find('span:eq(2)').hasClass('t-sort-hat-dir'));
});

test('sortClass, sortByClass and filterClass replace any dot with a dash', function(assert) {
    this.set('column', {
        field: 'hat.thing.leaf',
        headerLabel: 'foobar',
        isSortable: true,
        isFilterable: true
    });
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    assert.ok($component.find('span:eq(0)').hasClass('t-sort-hat-thing-leaf'));
    assert.ok($component.find('span:eq(1)').hasClass('t-filter-hat-thing-leaf'));
    assert.ok($component.find('span:eq(2)').hasClass('t-sort-hat-thing-leaf-dir'));
});

test('sortClass, sortByClass and filterClass replace any single underscore with a dash', function(assert) {
    this.set('column', {
        field: 'priority.translated_name',
        headerLabel: 'foobar',
        isSortable: true,
        isFilterable: true
    });
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    assert.ok($component.find('span:eq(0)').hasClass('t-sort-priority-translated-name'));
    assert.ok($component.find('span:eq(1)').hasClass('t-filter-priority-translated-name'));
    assert.ok($component.find('span:eq(2)').hasClass('t-sort-priority-translated-name-dir'));
});

test('when isSortable false the column does not have the sortable class or icons', function(assert) {
    this.set('column', {
        field: 'hat',
        headerLabel: 'foobar',
        isSortable: false,
        isFilterable: true
    });
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    assert.ok(!$component.find('span:eq(0)').hasClass('t-sort-hat'));
    assert.ok(!$component.find('span:eq(2)').hasClass('t-sort-hat-dir'));
    assert.ok(!$component.find('span:eq(2)').hasClass('fa'));
    assert.ok(!$component.find('span:eq(2)').hasClass('fa-sort'));
});

test('when isSortable is not set the column does not have the sortable class or icons (false by default)', function(assert) {
    this.set('column', {
        field: 'hat',
        headerLabel: 'foobar',
        isFilterable: true
    });
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    assert.ok(!$component.find('span:eq(0)').hasClass('t-sort-hat'));
    assert.ok(!$component.find('span:eq(2)').hasClass('t-sort-hat-dir'));
    assert.ok(!$component.find('span:eq(2)').hasClass('fa'));
    assert.ok(!$component.find('span:eq(2)').hasClass('fa-sort'));
});

test('when isFilterable false the column does not have the sortable class or icons', function(assert) {
    this.set('column', {
        field: 'hat',
        headerLabel: 'foobar',
        isSortable: true,
        isFilterable: false
    });
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    assert.ok(!$component.find('span:eq(1)').hasClass('t-filter-hat'));
    assert.ok(!$component.find('span:eq(1)').hasClass('fa'));
    assert.ok(!$component.find('span:eq(1)').hasClass('fa-filter'));
});

test('when isFilterable is not set the column does not have the sortable class or icons (false by default)', function(assert) {
    this.set('column', {
        field: 'hat',
        headerLabel: 'foobar',
        isSortable: true
    });
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    assert.ok(!$component.find('span:eq(1)').hasClass('t-filter-hat'));
    assert.ok(!$component.find('span:eq(1)').hasClass('fa'));
    assert.ok(!$component.find('span:eq(1)').hasClass('fa-filter'));
});

test('filterClass is on when the field matches the queryParams for find', function(assert) {
    this.set('column', {
        field: 'hat',
        headerLabel: 'foobar',
        isSortable: true,
        isFilterable: true
    });
    this.set('find', 'hat:abc');
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    assert.ok($component.find('span:eq(1)').hasClass('t-filter-hat'));
    assert.ok($component.find('span:eq(1)').hasClass('fa'));
    assert.ok($component.find('span:eq(1)').hasClass('fa-filter'));
    assert.ok($component.find('span:eq(1)').hasClass('on'));
});

test('filterClass is not on when the field matches the queryParams for find but value is empty', function(assert) {
    this.set('column', {
        field: 'hat',
        headerLabel: 'foobar',
        isSortable: true,
        isFilterable: true
    });
    this.set('find', 'hat:');
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    assert.ok($component.find('span:eq(1)').hasClass('t-filter-hat'));
    assert.ok($component.find('span:eq(1)').hasClass('fa'));
    assert.ok($component.find('span:eq(1)').hasClass('fa-filter'));
    assert.ok(!$component.find('span:eq(1)').hasClass('on'));
});

test('any classNames present are applied to the component', function(assert) {
    this.set('column', {
        field: 'hat',
        headerLabel: 'foobar',
        isSortable: true,
        isFilterable: true,
        classNames: ['one', 'two', 'three']
    });
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.ok($component.hasClass('one'));
    assert.ok($component.hasClass('two'));
    assert.ok($component.hasClass('three'));
});

test('clicking sort will fire action with the correct field when column isSortable', function(assert) {
    assert.expect(3);
    this.set('column', {
        field: 'hat',
        headerLabel: 'foobar',
        isSortable: true,
        isFilterable: true
    });
    this.set('sortBy', (field) => assert.equal(field, 'hat'));
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find sortBy=(action sortBy)}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    $component.find('span:eq(2)').trigger('click');
});

test('clicking sort will not fire action when column not isSortable', function(assert) {
    let sortClicked = false;
    let done = assert.async();
    this.set('column', {
        field: 'hat',
        headerLabel: 'foobar',
        isSortable: false,
        isFilterable: true
    });
    this.set('sortBy', () => { sortClicked = true; });
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find sortBy=(action sortBy)}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    $component.find('span:eq(2)').trigger('click');
    setTimeout(function() {
        assert.equal(sortClicked, false);
        done();
    }, 1);
});

test('clicking filter will fire action with the correct field when column isFilterable', function(assert) {
    assert.expect(3);
    this.set('column', {
        field: 'hat',
        headerLabel: 'foobar',
        isSortable: true,
        isFilterable: true
    });
    this.set('toggleFilterModal', (field) => assert.equal(field, 'hat'));
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find toggleFilterModal=(action toggleFilterModal)}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    $component.find('span:eq(1)').trigger('click');
});

test('clicking filter will not fire action when column not isFilterable', function(assert) {
    let filterClicked = false;
    let done = assert.async();
    this.set('column', {
        field: 'hat',
        headerLabel: 'foobar',
        isSortable: true,
        isFilterable: false
    });
    this.set('toggleFilterModal', () => { filterClicked = true; });
    this.render(hbs`{{grid/helpers/grid-header-column column=column sort=sort find=find toggleFilterModal=(action toggleFilterModal)}}`);
    let $component = this.$('th');
    assert.equal($component.length, 1);
    assert.equal($component.find('span').length, SPAN_COUNT);
    $component.find('span:eq(1)').trigger('click');
    setTimeout(function() {
        assert.equal(filterClicked, false);
        done();
    }, 1);
});
