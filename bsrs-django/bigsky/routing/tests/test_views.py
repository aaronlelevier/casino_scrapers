import json
import uuid

from django.conf import settings

from model_mommy import mommy
from rest_framework.test import APITestCase

from location.models import LocationLevel
from location.tests.factory import create_location_levels
from person.tests.factory import create_single_person, PASSWORD
from routing.models import Assignment, ProfileFilter, AvailableFilter
from routing.tests.factory import create_assignment, create_available_filters
from routing.tests.mixins import ViewTestSetupMixin
from utils.create import _generate_chars


class AssignmentTests(ViewTestSetupMixin, APITestCase):

    def test_list(self):
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

    def test_detail(self):
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
        self.assertEqual(data['filters'][0]['id'], str(self.profile_filter.id))
        self.assertEqual(data['filters'][0]['key'], self.profile_filter.key)
        self.assertEqual(data['filters'][0]['context'], self.profile_filter.context)
        self.assertEqual(data['filters'][0]['field'], self.profile_filter.field)
        self.assertEqual(data['filters'][0]['criteria'], self.profile_filter.criteria)

    def test_create(self):
        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'
        self.assertEqual(len(self.data['filters']), 2)
        # POST will on create filters, not use existing
        init_filter_count = ProfileFilter.objects.count()
        self.data['filters'][0]['id'] = str(uuid.uuid4())
        self.data['filters'][1]['id'] = str(uuid.uuid4())

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
        self.assertEqual(ProfileFilter.objects.count(), init_filter_count+2)
        self.assertEqual(len(data['filters']), 2)
        self.assertIn(data['filters'][0]['id'], [f['id'] for f in self.data['filters']])
        profile_filter = ProfileFilter.objects.get(id=data['filters'][0]['id'])
        self.assertEqual(data['filters'][0]['key'], profile_filter.key)
        self.assertEqual(data['filters'][0]['context'], profile_filter.context)
        self.assertEqual(data['filters'][0]['field'], profile_filter.field)
        self.assertEqual(data['filters'][0]['criteria'], profile_filter.criteria)

    def test_create__context_not_required(self):
        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'
        self.data['filters'] = self.data['filters'][:1]
        self.data['filters'][0]['id'] = str(uuid.uuid4())
        self.data['filters'][0].pop('context', None)

        response = self.client.post('/api/admin/assignments/', self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(data['filters'][0]['id'], self.data['filters'][0]['id'])
        self.assertEqual(data['filters'][0]['context'], settings.DEFAULT_PROFILE_FILTER_CONTEXT)

    def test_update(self):
        assignee = create_single_person()
        self.data.update({
            'description': 'foo',
            'assignee': str(assignee.id)
        })

        response = self.client.put('/api/admin/assignments/{}/'.format(self.assignment.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], self.data['id'])
        self.assertNotIn('tenant', data)
        self.assertEqual(data['order'], 1)
        self.assertEqual(data['description'], self.data['description'])
        self.assertEqual(data['assignee'], self.data['assignee'])
        # profile_filter
        self.assertEqual(len(data['filters']), 2)
        self.assertEqual(data['filters'][0]['id'], str(self.profile_filter.id))
        self.assertEqual(data['filters'][0]['key'], self.profile_filter.key)
        self.assertEqual(data['filters'][0]['context'], self.profile_filter.context)
        self.assertEqual(data['filters'][0]['field'], self.profile_filter.field)
        self.assertEqual(data['filters'][0]['criteria'], self.profile_filter.criteria)

    def test_update__nested_create(self):
        self.assertEqual(self.assignment.filters.count(), 2)
        new_filter_id = str(uuid.uuid4())
        self.data['description'] = _generate_chars()
        self.data['filters'].append({
            'id': new_filter_id,
            'key': self.profile_filter.key,
            'field': 'priority',
            'criteria': [str(self.ticket_priority.id)]
        })

        response = self.client.put('/api/admin/assignments/{}/'.format(self.assignment.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['filters']), 3)
        self.assertIn(new_filter_id, [f['id'] for f in data['filters']])

    def test_update__nested_update(self):
        self.assertEqual(self.assignment.filters.count(), 2)
        new_filter_id = str(uuid.uuid4())
        self.data['filters'][0].update({
            'field': 'location',
            'criteria': [str(self.ticket.location.id)]
        })

        response = self.client.put('/api/admin/assignments/{}/'.format(self.assignment.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['filters']), 2)
        profile_filter = ProfileFilter.objects.get(id=self.data['filters'][0]['id'])
        self.assertEqual(profile_filter.field, self.data['filters'][0]['field'])
        self.assertEqual(profile_filter.criteria, self.data['filters'][0]['criteria'])

    def test_update__nested_delete(self):
        self.assertEqual(self.assignment.filters.count(), 2)
        deleted_id = self.data['filters'][1]['id']
        self.data['filters'] = self.data['filters'][:1]

        response = self.client.put('/api/admin/assignments/{}/'.format(self.assignment.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['filters']), 1)
        self.assertNotIn(deleted_id, [f['id'] for f in data['filters']])
        self.assertFalse(ProfileFilter.objects.filter(id=deleted_id).exists())
        self.assertFalse(ProfileFilter.objects_all.filter(id=deleted_id).exists())

    def test_update__other_assignment_filters_not_affected(self):
        mommy.make(ProfileFilter, criteria=self.profile_filter.criteria)
        init_count = ProfileFilter.objects.count()

        response = self.client.put('/api/admin/assignments/{}/'.format(self.assignment.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(ProfileFilter.objects.count(), init_count)


class AvailableFilterTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
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
        self.assertTrue(priority_data['key_is_i18n'])
        self.assertEqual(priority_data['context'], settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(priority_data['field'], 'priority')
        self.assertEqual(priority_data['lookups'], {})

    def test_list__dynamic(self):
        raw_filter_count = AvailableFilter.objects.count()
        dynamic_filter_count = AvailableFilter.objects.filter(lookups__filters='location_level').count()
        location_level_filters = LocationLevel.objects.count()
        self.assertEqual(raw_filter_count, 3)
        self.assertEqual(dynamic_filter_count, 1)
        self.assertEqual(location_level_filters, 5)
        desired_count = raw_filter_count - dynamic_filter_count + location_level_filters

        response = self.client.get('/api/admin/assignments-available-filters/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        # count dynamic and non-dynamic
        self.assertEqual(data['count'], 7)
        # dynamic location_level record
        for d in data['results']:
            if 'location_level' in d['lookups']:
                location_data = d
        location_level = LocationLevel.objects.get(id=location_data['lookups']['location_level'])
        self.assertTrue(location_data['id'])
        self.assertEqual(location_data['key'], location_level.name)
        self.assertFalse(location_data['key_is_i18n'])
        self.assertEqual(location_data['context'], settings.DEFAULT_PROFILE_FILTER_CONTEXT)
        self.assertEqual(location_data['field'], 'location')
        self.assertEqual(location_data['lookups'], {'location_level': str(location_level.id)})

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
