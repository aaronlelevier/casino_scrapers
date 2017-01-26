import { test, module } from 'qunit';
import filterset_regex from 'bsrs-ember/utilities/filterset-regex';

module('filterset regex unit tests');

test('will remove any page query params from url', function(assert) {
  const url = '/tickets/index?find=request%3Anum&page=2&sort=priority.name';
  const result = filterset_regex(url);
  const expected = '?find=request%3Anum&sort=priority.name';
  assert.equal(result, expected);
});

test('will remove both page and page size from url', function(assert) {
  const url = '/tickets/index?find=request%3Anum&page=2&page_size=10&sort=priority.name';
  const result = filterset_regex(url);
  const expected = '?find=request%3Anum&sort=priority.name';
  assert.equal(result, expected);
});

test('will remove both page and page size from url even when they are split up', function(assert) {
  const url = '/tickets/index?find=request%3Anum&page_size=10&sort=priority.name&page=2';
  const result = filterset_regex(url);
  const expected = '?find=request%3Anum&sort=priority.name';
  assert.equal(result, expected);
});

test('will remove page even when it is the first param in the listing', function(assert) {
  const url = '/tickets/index?page=2&page_size=10&sort=priority.name';
  const result = filterset_regex(url);
  const expected = '?sort=priority.name';
  assert.equal(result, expected);
});

test('will remove page_size even when it is the first param in the listing', function(assert) {
  const url = '/tickets/index?page_size=10&sort=priority.name&page=2';
  const result = filterset_regex(url);
  const expected = '?sort=priority.name';
  assert.equal(result, expected);
});
