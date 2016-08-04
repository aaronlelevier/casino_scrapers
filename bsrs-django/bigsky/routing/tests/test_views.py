import json
import uuid

from django.conf import settings

from model_mommy import mommy
from rest_framework.test import APITestCase

from category.models import Category
from location.models import Location, LocationLevel
from location.tests.factory import create_location_levels, create_top_level_location
from person.tests.factory import create_single_person, PASSWORD
from routing.models import Assignment, ProfileFilter, AvailableFilter, AUTO_ASSIGN
from routing.tests.factory import (
    create_assignment, create_available_filters, create_auto_assign_filter,
    create_available_filter_location, create_ticket_location_filter,
    create_ticket_categories_mid_level_filter, create_assignment,)
from routing.tests.mixins import ViewTestSetupMixin
from ticket.models import TicketPriority
from utils.create import _generate_chars
from utils.helpers import create_default


class AssignmentListTests(ViewTestSetupMixin, APITestCase):

    def test_data(self):
        response = self.client.get('/api/admin/assignments/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        data = data['results'][0]
        self.assertEqual(data['id'], str(self.assignment.id))
        self.assertNotIn('tenant', data)
        self.assertEqual(data['order'], 1)
        self.assertEqual(data['description'], self.assignment.description)
        self.assertEqual(data['assignee']['id'], str(self.assignment.assignee.id))
        self.assertEqual(data['assignee']['username'], self.assignment.assignee.username)

    def test_search(self):
        self.assignment_two = create_assignment(_generate_chars())
        self.assignment_three = create_assignment(_generate_chars())
        self.assertEqual(Assignment.objects.count(), 3)
        keyword = self.assignment_two.description

        response = self.client.get('/api/admin/assignments/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)


class AssignmentDetailTests(ViewTestSetupMixin, APITestCase):

    def test_data(self):
        response = self.client.get('/api/admin/assignments/{}/'.format(self.assignment.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.assignment.id))
        self.assertNotIn('tenant', data)
        self.assertEqual(data['order'], 1)
        self.assertEqual(data['description'], self.assignment.description)
        self.assertEqual(data['assignee']['id'], str(self.assignment.assignee.id))
        self.assertEqual(data['assignee']['username'], self.assignment.assignee.username)
        # profile_filter
        self.assertEqual(len(data['filters']), 2)
        af = AvailableFilter.objects.get(id=data['filters'][0]['id'])
        self.assertEqual(data['filters'][0]['id'], str(af.id))
        self.assertEqual(data['filters'][0]['key'], af.key)
        self.assertEqual(data['filters'][0]['context'], af.context)
        self.assertEqual(data['filters'][0]['field'], af.field)
        pf = self.assignment.filters.get(source=af)
        self.assertEqual(data['filters'][0]['lookups'], pf.lookups)
        self.assertEqual(data['filters'][0]['criteria'][0]['id'], pf.criteria[0])

    def test_data__dynamic_source_filter(self):
        # dynamic available filter for "location" linked to ProfileFilter.source
        location_filter = create_ticket_location_filter()
        location_level = create_top_level_location().location_level
        # simulate what an existing location_filter.lookup will hold
        location_filter.lookups = {'location_level': str(location_level.id)}
        location_filter.save()
        self.assignment.filters.add(location_filter)

        response = self.client.get('/api/admin/assignments/{}/'.format(self.assignment.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        for f in data['filters']:
            if f['id'] == str(location_filter.source.id):
                filter_data = f
        self.assertEqual(filter_data['lookups']['location_level']['id'], str(location_level.id))
        self.assertEqual(filter_data['lookups']['location_level']['name'], location_level.name)
        # unchanged
        self.assertEqual(filter_data['id'], str(location_filter.source.id))
        self.assertEqual(filter_data['key'], location_filter.source.key)
        self.assertEqual(filter_data['context'], location_filter.source.context)
        self.assertEqual(filter_data['field'], location_filter.source.field)

    def test_criteria__priority(self):
        priority = create_default(TicketPriority)
        for pf in self.assignment.filters.exclude(source__field='priority'):
            self.assignment.filters.remove(pf)

        response = self.client.get('/api/admin/assignments/{}/'.format(self.assignment.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(len(data['filters'][0]['criteria']), 1)
        self.assertEqual(data['filters'][0]['criteria'][0]['id'], str(priority.id))
        self.assertEqual(data['filters'][0]['criteria'][0]['name'], str(priority.name))

    def test_criteria__location(self):
        self.assignment.filters.clear()
        self.assertEqual(self.assignment.filters.count(), 0)
        location = create_top_level_location()
        location_filter = create_ticket_location_filter()
        self.assignment.filters.add(location_filter)

        response = self.client.get('/api/admin/assignments/{}/'.format(self.assignment.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(len(data['filters'][0]['criteria']), 1)
        self.assertEqual(data['filters'][0]['criteria'][0]['id'], str(location.id))
        self.assertEqual(data['filters'][0]['criteria'][0]['name'], location.name)

    def test_criteria__categories(self):
        self.assignment.filters.clear()
        self.assertEqual(self.assignment.filters.count(), 0)
        category_filter = create_ticket_categories_mid_level_filter()
        category = Category.objects.get(id=category_filter.criteria[0])
        self.assignment.filters.add(category_filter)

        response = self.client.get('/api/admin/assignments/{}/'.format(self.assignment.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(len(data['filters'][0]['criteria']), 1)
        self.assertEqual(data['filters'][0]['criteria'][0]['id'], str(category.id))
        self.assertEqual(data['filters'][0]['criteria'][0]['name'], category.parents_and_self_as_string())


class AssignmentCreateTests(ViewTestSetupMixin, APITestCase):

    def test_create(self):
        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'
        self.data['filters'] = self.priority_payload
        # dynamic location filter
        location = mommy.make(Location)
        criteria_two = [str(location.id)]
        location_filter = create_ticket_location_filter()
        location_af = location_filter.source
        self.data['filters'] = [{
            'id': str(location_af.id),
            'criteria': criteria_two,
            'lookups': {'location_level': str(location.location_level.id)}
        }]

        response = self.client.post('/api/admin/assignments/', self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        assignment = Assignment.objects.get(id=self.data['id'])
        self.assertEqual(data['id'], str(assignment.id))
        self.assertNotIn('tenant', data)
        self.assertEqual(data['order'], 2)
        self.assertEqual(data['description'], assignment.description)
        self.assertEqual(data['assignee'], str(assignment.assignee.id))
        # profile_filter
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(assignment.filters.first().source, location_af)
        self.assertEqual(assignment.filters.first().criteria, criteria_two)
        self.assertEqual(assignment.filters.first().lookups, {'location_level': str(location.location_level.id)})


class AssignmentUpdateTests(ViewTestSetupMixin, APITestCase):

    def setUp(self):
        super(AssignmentUpdateTests, self).setUp()
        self.assignment.filters.remove(self.category_filter)

    def test_setup(self):
        self.assertEqual(self.assignment.filters.count(), 1)
        self.assertEqual(self.assignment.filters.first(), self.priority_filter)

    def test_update(self):
        # Base fields update only, no nested updating
        assignee = create_single_person()
        self.data.update({
            'description': 'foo',
            'assignee': str(assignee.id)
        })
        self.data['filters'] = []

        response = self.client.put('/api/admin/assignments/{}/'.format(self.assignment.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], self.data['id'])
        self.assertNotIn('tenant', data)
        self.assertEqual(data['order'], 1)
        self.assertEqual(data['description'], self.data['description'])
        self.assertEqual(data['assignee'], self.data['assignee'])
        self.assertEqual(len(data['filters']), 0)

    def test_update__nested_create(self):
        af = create_available_filter_location()
        self.assertNotEqual(self.assignment.filters.first().source, af)
        self.assertNotEqual(self.assignment.filters.first().criteria, [str(self.location.id)])
        self.data['filters'] = [{
            'id': str(af.id),
            'criteria': [str(self.location.id)],
            'lookups': {'location_level': str(self.location.location_level.id)}
        }]

        response = self.client.put('/api/admin/assignments/{}/'.format(self.assignment.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(self.assignment.filters.first().source.id, af.id)
        self.assertEqual(self.assignment.filters.first().criteria, self.data['filters'][0]['criteria'])
        self.assertEqual(self.assignment.filters.first().lookups, self.data['filters'][0]['lookups'])

    def test_update__nested_update(self):
        priority_two = mommy.make(TicketPriority)
        criteria_two = [str(priority_two.id)]
        self.assertEqual(self.assignment.filters.first().source, self.priority_af)
        self.assertNotEqual(self.assignment.filters.first().criteria, criteria_two)
        self.data['filters'] = [{
            'id': str(self.priority_af.id),
            'criteria': criteria_two
        }]

        response = self.client.put('/api/admin/assignments/{}/'.format(self.assignment.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(self.assignment.filters.first().source, self.priority_af)
        self.assertEqual(self.assignment.filters.first().criteria, criteria_two)

    def test_update__nested_update__dynamic(self):
        self.assignment.filters.clear()
        location = mommy.make(Location)
        criteria_two = [str(location.id)]
        location_filter = create_ticket_location_filter()
        location_af = location_filter.source
        self.assignment.filters.add(location_filter)
        # pre-test
        self.assertEqual(self.assignment.filters.first().source, location_af)
        self.assertNotEqual(self.assignment.filters.first().criteria, criteria_two)
        self.data['filters'] = [{
            'id': str(location_filter.source.id),
            'criteria': criteria_two,
            'lookups': {'location_level': str(location.location_level.id)}
        }]

        response = self.client.put('/api/admin/assignments/{}/'.format(self.assignment.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(self.assignment.filters.first().source, location_af)
        self.assertEqual(self.assignment.filters.first().criteria, criteria_two)
        self.assertEqual(self.assignment.filters.first().lookups, self.data['filters'][0]['lookups'])

    def test_update__nested_delete(self):
        """
        Related ProfileFilters are "hard" deleted if they have been
        removed from the Assignment.
        """
        self.assertEqual(self.assignment.filters.count(), 1)
        deleted_id = self.data['filters'][0]['id']
        self.data['filters'] = []

        response = self.client.put('/api/admin/assignments/{}/'.format(self.assignment.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['filters']), 0)
        self.assertFalse(ProfileFilter.objects.filter(id=deleted_id).exists())
        self.assertFalse(ProfileFilter.objects_all.filter(id=deleted_id).exists())

    def test_update__other_assignment_filters_not_affected(self):
        """
        Confirms that the nested remove clean up loop filters for the related
        ProfileFilters only for the Assignment instance.
        """
        mommy.make(ProfileFilter, criteria=self.priority_filter.criteria)
        init_count = ProfileFilter.objects.count()
        self.data['filters'] = self.priority_payload

        response = self.client.put('/api/admin/assignments/{}/'.format(self.assignment.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(ProfileFilter.objects.count(), init_count)


class AvailableFilterTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.tenant = self.person.role.tenant
        self.assignment = create_assignment(tenant=self.tenant)
        create_location_levels()
        create_available_filters()
        self.af = AvailableFilter.objects.first()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list_non_dynamic(self):
        response = self.client.get('/api/admin/assignments-available-filters/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        # non-dynamic record
        for d in data['results']:
            if d['field'] == 'priority':
                priority_data = d
        self.assertTrue(priority_data['id'])
        self.assertEqual(priority_data['key'], 'admin.placeholder.ticket_priority')
        self.assertEqual(priority_data['context'], settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(priority_data['field'], 'priority')
        self.assertEqual(priority_data['lookups'], {'unique_key': 'priority'})

    def test_list__dynamic(self):
        raw_filter_count = AvailableFilter.objects.count()
        dynamic_filter_count = AvailableFilter.objects.filter(lookups__filters='location_level').count()
        location_level_filters = LocationLevel.objects.count()
        self.assertEqual(raw_filter_count, 6)
        self.assertEqual(dynamic_filter_count, 1)
        self.assertEqual(location_level_filters, 5)
        desired_count = raw_filter_count - dynamic_filter_count + location_level_filters

        response = self.client.get('/api/admin/assignments-available-filters/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        # count dynamic and non-dynamic
        self.assertEqual(data['count'], 10)
        # dynamic location_level record
        for d in data['results']:
            if 'location_level' in d['lookups']:
                location_data = d
        location_level = LocationLevel.objects.get(id=location_data['lookups']['location_level']['id'])
        self.assertTrue(location_data['id'])
        self.assertEqual(location_data['key'], location_level.name)
        self.assertEqual(location_data['context'], settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(location_data['field'], 'location')
        self.assertEqual(location_data['lookups']['unique_key'], "location_level-{}".format(location_level.name))
        self.assertEqual(location_data['lookups']['location_level']['id'], str(location_level.id))
        self.assertEqual(location_data['lookups']['location_level']['name'], location_level.name)

    def test_auto_assign_filter_removed_if_already_in_use(self):
        # AUTO_ASSIGN included
        self.assertFalse(Assignment.objects.auto_assign_filter_in_use(self.tenant))

        response = self.client.get('/api/admin/assignments-available-filters/')

        data = json.loads(response.content.decode('utf8'))
        self.assertIn(
            AUTO_ASSIGN,
            [f['field'] for f in data['results']]
        )

        # AUTO_ASSIGN excluded
        auto_assign_filter = create_auto_assign_filter()
        self.assignment.filters.add(auto_assign_filter)
        self.assertTrue(Assignment.objects.auto_assign_filter_in_use(self.tenant))

        response = self.client.get('/api/admin/assignments-available-filters/')

        data = json.loads(response.content.decode('utf8'))
        self.assertNotIn(
            AUTO_ASSIGN,
            [f['field'] for f in data['results']]
        )

    def test_detail(self):
        response = self.client.get('/api/admin/assignments-available-filters/{}/'.format(self.af.id))
        self.assertEqual(response.status_code, 405)

    def test_create(self):
        response = self.client.post('/api/admin/assignments-available-filters/', {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_update(self):
        response = self.client.put('/api/admin/assignments-available-filters/{}/'.format(self.af.id))
        self.assertEqual(response.status_code, 405)

    def test_delete(self):
        response = self.client.delete('/api/admin/assignments-available-filters/{}/'.format(self.af.id))
        self.assertEqual(response.status_code, 405)

    def test_unique_key__exists_on_all_and_is_unique(self):
        response = self.client.get('/api/admin/assignments-available-filters/')

        data = json.loads(response.content.decode('utf8'))

        # exists on all
        for d in data['results']:
            self.assertIn('unique_key', d['lookups'])
            self.assertTrue(d['lookups']['unique_key'])
        # is unique accross all
        unique_keys = set([d['lookups']['unique_key'] for d in data['results']])
        self.assertEqual(data['count'], len(unique_keys))
