import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from category.models import Category
from contact.models import State, Country
from location.models import LocationLevel
from location.tests.factory import (create_location_levels, create_top_level_location,
    create_location_level, create_location)
from person.tests.factory import create_single_person, PASSWORD
from routing.models import RoutingEvent, Automation, ProfileFilter, AvailableFilter
from routing.tests.factory import (
    create_automation, create_available_filters, create_available_filter_location,
    create_ticket_location_filter, create_ticket_categories_mid_level_filter, create_automation,
    create_ticket_location_state_filter, create_ticket_location_country_filter, create_routing_events)
from routing.tests.mixins import ViewTestSetupMixin
from ticket.models import TicketPriority
from utils.create import _generate_chars
from utils.helpers import create_default


class RoutingEventTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        create_routing_events()
        self.event = RoutingEvent.objects.first()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        self.assertTrue(self.event)

        response = self.client.get('/api/admin/automation-events/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['count'] > 0)
        self.assertEqual(len(data['results'][0]), 2)
        event = RoutingEvent.objects.get(id=data['results'][0]['id'])
        self.assertEqual(data['results'][0]['key'], event.key)

    def test_detail(self):
        response = self.client.get('/api/admin/automation-events/{}/'.format(self.event.id))
        self.assertEqual(response.status_code, 405)

    def test_create(self):
        response = self.client.post('/api/admin/automation-events/', {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_update(self):
        response = self.client.put('/api/admin/automation-events/{}/'.format(self.event.id), {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_delete(self):
        response = self.client.delete('/api/admin/automation-events/{}/'.format(self.event.id))
        self.assertEqual(response.status_code, 405)


class AutomationListTests(ViewTestSetupMixin, APITestCase):

    def test_data(self):
        response = self.client.get('/api/admin/automations/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        data = data['results'][0]
        self.assertEqual(data['id'], str(self.automation.id))
        self.assertNotIn('tenant', data)
        self.assertEqual(data['description'], self.automation.description)

    def test_search(self):
        self.automation_two = create_automation(_generate_chars())
        self.automation_three = create_automation(_generate_chars())
        self.assertEqual(Automation.objects.count(), 3)
        keyword = self.automation_two.description

        response = self.client.get('/api/admin/automations/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)


class AutomationDetailTests(ViewTestSetupMixin, APITestCase):

    def test_data(self):
        response = self.client.get('/api/admin/automations/{}/'.format(self.automation.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.automation.id))
        self.assertNotIn('tenant', data)
        self.assertEqual(data['description'], self.automation.description)
        # profile_filter
        self.assertEqual(len(data['filters']), 2)
        pf = self.automation.filters.get(id=data['filters'][0]['id'])
        af = pf.source
        self.assertEqual(data['filters'][0]['id'], str(pf.id))
        self.assertEqual(data['filters'][0]['source_id'], str(af.id))
        self.assertEqual(data['filters'][0]['key'], af.key)
        self.assertEqual(data['filters'][0]['field'], af.field)
        self.assertEqual(data['filters'][0]['lookups'], pf.lookups)
        self.assertEqual(data['filters'][0]['criteria'][0]['id'], pf.criteria[0])

    def test_data__dynamic_source_filter(self):
        # dynamic available filter for "location" linked to ProfileFilter.source
        location_level = create_top_level_location().location_level
        location_filter = create_ticket_location_filter()
        location_filter.lookups.pop('filters', None)
        self.automation.filters.clear()
        self.automation.filters.add(location_filter)

        response = self.client.get('/api/admin/automations/{}/'.format(self.automation.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['filters']), 1)
        filter_data = data['filters'][0]
        self.assertEqual(filter_data['lookups']['id'], str(location_level.id))
        self.assertEqual(filter_data['lookups']['name'], location_level.name)
        self.assertNotIn('filters', filter_data)
        # unchanged
        self.assertEqual(filter_data['id'], str(location_filter.id))
        self.assertEqual(filter_data['source_id'], str(location_filter.source.id))
        self.assertEqual(filter_data['key'], location_level.name)
        self.assertEqual(filter_data['field'], location_filter.source.field)

    def test_criteria__priority(self):
        priority = create_default(TicketPriority)
        for pf in self.automation.filters.exclude(source__field='priority'):
            self.automation.filters.remove(pf)

        response = self.client.get('/api/admin/automations/{}/'.format(self.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(len(data['filters'][0]['criteria']), 1)
        self.assertEqual(data['filters'][0]['criteria'][0]['id'], str(priority.id))
        self.assertEqual(data['filters'][0]['criteria'][0]['name'], str(priority.name))

    def test_criteria__location(self):
        self.automation.filters.clear()
        self.assertEqual(self.automation.filters.count(), 0)
        location = create_top_level_location()
        location_filter = create_ticket_location_filter()
        self.automation.filters.add(location_filter)

        response = self.client.get('/api/admin/automations/{}/'.format(self.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(len(data['filters'][0]['criteria']), 1)
        self.assertEqual(data['filters'][0]['criteria'][0]['id'], str(location.id))
        self.assertEqual(data['filters'][0]['criteria'][0]['name'], location.name)

    def test_criteria__categories(self):
        self.automation.filters.clear()
        self.assertEqual(self.automation.filters.count(), 0)
        category_filter = create_ticket_categories_mid_level_filter()
        category = Category.objects.get(id=category_filter.criteria[0])
        self.automation.filters.add(category_filter)

        response = self.client.get('/api/admin/automations/{}/'.format(self.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(len(data['filters'][0]['criteria']), 1)
        self.assertEqual(data['filters'][0]['criteria'][0]['id'], str(category.id))
        self.assertEqual(data['filters'][0]['criteria'][0]['name'], category.parents_and_self_as_string())

    def test_criteria_state(self):
        self.automation.filters.clear()
        self.assertEqual(self.automation.filters.count(), 0)
        state_filter = create_ticket_location_state_filter()
        state = State.objects.get(id=state_filter.criteria[0])
        self.automation.filters.add(state_filter)

        response = self.client.get('/api/admin/automations/{}/'.format(self.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(len(data['filters'][0]['criteria']), 1)
        self.assertEqual(data['filters'][0]['criteria'][0]['id'], str(state.id))
        self.assertEqual(data['filters'][0]['criteria'][0]['name'], state.name)

    def test_criteria_country(self):
        self.automation.filters.clear()
        self.assertEqual(self.automation.filters.count(), 0)
        country_filter = create_ticket_location_country_filter()
        country = Country.objects.get(id=country_filter.criteria[0])
        self.automation.filters.add(country_filter)

        response = self.client.get('/api/admin/automations/{}/'.format(self.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(len(data['filters'][0]['criteria']), 1)
        self.assertEqual(data['filters'][0]['criteria'][0]['id'], str(country.id))
        self.assertEqual(data['filters'][0]['criteria'][0]['name'], country.common_name)


class AutomationCreateTests(ViewTestSetupMixin, APITestCase):

    def test_create(self):
        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'
        # dynamic location filter
        location = create_location()
        criteria_two = [str(location.id)]
        location_af = create_available_filter_location()
        self.data['filters'] = [{
            'id': str(uuid.uuid4()),
            'source': str(location_af.id),
            'criteria': criteria_two,
            'lookups': {'id': str(location.location_level.id)}
        }]

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        automation = Automation.objects.get(id=self.data['id'])
        self.assertEqual(data['id'], str(automation.id))
        self.assertNotIn('tenant', data)
        self.assertEqual(data['description'], automation.description)
        # profile_filter
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(automation.filters.first().source, location_af)
        self.assertEqual(automation.filters.first().criteria, criteria_two)
        self.assertEqual(automation.filters.first().lookups, {'id': str(location.location_level.id)})

    def test_create__multiple_filters(self):
        # filter 1 (will come w/ `self.data` by default)
        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'
        # filter 2
        location_af = create_available_filter_location()
        location_level = create_location_level('foo')
        location = create_location(location_level)
        self.data['filters'].append({
            'id': str(uuid.uuid4()),
            'source': str(location_af.id),
            'criteria': [str(location.id)],
            'lookups': {'id': str(location_level.id)}
        })
        # filter 3 - shows being able to distinguish dynamic filters
        location_level_two = create_location_level('bar')
        location_two = create_location(location_level)
        self.data['filters'].append({
            'id': str(uuid.uuid4()),
            'source': str(location_af.id),
            'criteria': [str(location_two.id)],
            'lookups': {'id': str(location_level_two.id)}
        })

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        automation = Automation.objects.get(id=data['id'])
        self.assertEqual(automation.filters.filter(source__field='priority').count(), 1)
        self.assertEqual(automation.filters.filter(source__field='location', lookups={'id': str(location_level.id)}).count(), 1)
        self.assertEqual(automation.filters.filter(source__field='location', lookups={'id': str(location_level_two.id)}).count(), 1)


class AutomationUpdateTests(ViewTestSetupMixin, APITestCase):

    def setUp(self):
        super(AutomationUpdateTests, self).setUp()
        self.automation.filters.remove(self.category_filter)

    def test_setup(self):
        self.assertEqual(self.automation.filters.count(), 1)
        self.assertEqual(self.automation.filters.first(), self.priority_filter)

    def test_update(self):
        # Base fields update only, no nested updating
        self.data.update({
            'description': 'foo',
        })
        self.data['filters'] = []

        response = self.client.put('/api/admin/automations/{}/'.format(self.automation.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], self.data['id'])
        self.assertNotIn('tenant', data)
        self.assertEqual(data['description'], self.data['description'])
        self.assertEqual(len(data['filters']), 0)

    def test_update__nested_create(self):
        af = create_available_filter_location()
        self.assertNotEqual(self.automation.filters.first().source, af)
        self.assertNotEqual(self.automation.filters.first().criteria, [str(self.location.id)])
        self.data['filters'] = [{
            'id': str(uuid.uuid4()),
            'source': str(af.id),
            'criteria': [str(self.location.id)],
            'lookups': {'id': str(self.location.location_level.id)}
        }]

        response = self.client.put('/api/admin/automations/{}/'.format(self.automation.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(str(self.automation.filters.first().id), data['filters'][0]['id'])
        self.assertEqual(self.automation.filters.first().source.id, af.id)
        self.assertEqual(self.automation.filters.first().criteria, self.data['filters'][0]['criteria'])
        self.assertEqual(self.automation.filters.first().lookups, self.data['filters'][0]['lookups'])

    def test_update__nested_create__multiple(self):
        # filter 1 - in existing record
        # filter 2
        location_af = create_available_filter_location()
        location_level = create_location_level('foo')
        location = create_location(location_level)
        self.data['filters'].append({
            'id': str(uuid.uuid4()),
            'source': str(location_af.id),
            'criteria': [str(location.id)],
            'lookups': {'id': str(location_level.id)}
        })
        # filter 3 - shows being able to distinguish dynamic filters
        location_level_two = create_location_level('bar')
        location_two = create_location(location_level)
        self.data['filters'].append({
            'id': str(uuid.uuid4()),
            'source': str(location_af.id),
            'criteria': [str(location_two.id)],
            'lookups': {'id': str(location_level_two.id)}
        })

        response = self.client.put('/api/admin/automations/{}/'.format(self.automation.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['filters']), 3)
        self.assertEqual(self.automation.filters.filter(source__field='priority').count(), 1)
        self.assertEqual(self.automation.filters.filter(source__field='location', lookups={'id': str(location_level.id)}).count(), 1)
        self.assertEqual(self.automation.filters.filter(source__field='location', lookups={'id': str(location_level_two.id)}).count(), 1)

    def test_update__nested_update(self):
        priority_two = mommy.make(TicketPriority)
        criteria_two = [str(priority_two.id)]
        profile_filter = self.automation.filters.first()
        self.assertEqual(self.automation.filters.first().source, self.priority_af)
        self.assertNotEqual(self.automation.filters.first().criteria, criteria_two)
        self.data['filters'] = [{
            'id': str(profile_filter.id),
            'source': str(profile_filter.source.id),
            'criteria': criteria_two
        }]

        response = self.client.put('/api/admin/automations/{}/'.format(self.automation.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(self.automation.filters.first(), profile_filter)
        self.assertEqual(self.automation.filters.first().source, self.priority_af)
        self.assertEqual(self.automation.filters.first().criteria, criteria_two)

    def test_update__nested_update__dynamic(self):
        self.automation.filters.clear()
        location = create_location()
        criteria_two = [str(location.id)]
        location_filter = create_ticket_location_filter()
        location_af = location_filter.source
        self.automation.filters.add(location_filter)
        # pre-test
        self.assertEqual(self.automation.filters.first().source, location_af)
        self.assertNotEqual(self.automation.filters.first().criteria, criteria_two)
        self.data['filters'] = [{
            'id': str(location_filter.id),
            'source': str(location_af.id),
            'criteria': criteria_two,
            'lookups': {'id': str(location.location_level.id)}
        }]

        response = self.client.put('/api/admin/automations/{}/'.format(self.automation.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(self.automation.filters.first(), location_filter)
        self.assertEqual(self.automation.filters.first().source, location_af)
        self.assertEqual(self.automation.filters.first().criteria, criteria_two)
        self.assertEqual(self.automation.filters.first().lookups, self.data['filters'][0]['lookups'])

    def test_update__nested_update__dynamic__multiple(self):
        self.automation.filters.clear()
        location_filter = create_ticket_location_filter()
        # filter 1 - will be an existing related record
        location_level = create_location_level('foo')
        location = create_location(location_level)
        self.automation.filters.add(location_filter)
        self.assertEqual(self.automation.filters.first().source, location_filter.source)
        self.assertNotEqual(self.automation.filters.first().criteria, [str(location.id)])
        self.data['filters'] = [{
            'id': str(location_filter.id),
            'source': str(location_filter.source.id),
            'criteria': [str(location.id)],
            'lookups': {'id': str(location.location_level.id)}
        }]
        # filter 2
        location_filter_two = create_ticket_location_filter()
        self.automation.filters.add(location_filter_two)
        location_level_two = create_location_level('bar')
        location_two = create_location(location_level)
        self.data['filters'].append({
            'id': str(location_filter_two.id),
            'source': str(location_filter_two.source.id),
            'criteria': [str(location_two.id)],
            'lookups': {'id': str(location_level_two.id)}
        })

        response = self.client.put('/api/admin/automations/{}/'.format(self.automation.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['filters']), 2)
        self.assertEqual(self.automation.filters.filter(source__field='location', lookups={'id': str(location_level.id)}).count(), 1)
        self.assertEqual(self.automation.filters.filter(source__field='location', lookups={'id': str(location_level_two.id)}).count(), 1)

    def test_update__nested_delete(self):
        """
        Related ProfileFilters are "hard" deleted if they have been
        removed from the Automation.
        """
        self.assertEqual(self.automation.filters.count(), 1)
        deleted_id = self.data['filters'][0]['id']
        self.data['filters'] = []

        response = self.client.put('/api/admin/automations/{}/'.format(self.automation.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['filters']), 0)
        self.assertFalse(ProfileFilter.objects.filter(id=deleted_id).exists())
        self.assertFalse(ProfileFilter.objects_all.filter(id=deleted_id).exists())

    def test_update__other_automation_filters_not_affected(self):
        """
        Confirms that the nested remove clean up loop filters for the related
        ProfileFilters only for the Automation instance.
        """
        mommy.make(ProfileFilter, criteria=self.priority_filter.criteria)
        init_count = ProfileFilter.objects.count()

        response = self.client.put('/api/admin/automations/{}/'.format(self.automation.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(ProfileFilter.objects.count(), init_count)


class AvailableFilterTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.tenant = self.person.role.tenant
        self.automation = create_automation(tenant=self.tenant)
        create_location_levels()
        create_available_filters()
        self.af = AvailableFilter.objects.first()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list_non_dynamic(self):
        response = self.client.get('/api/admin/automation-available-filters/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        # non-dynamic record
        for d in data['results']:
            if d['field'] == 'priority':
                priority_data = d
        self.assertTrue(priority_data['id'])
        self.assertEqual(priority_data['key'], 'admin.placeholder.priority_filter_select')
        self.assertEqual(priority_data['field'], 'priority')
        self.assertNotIn('unique_key', priority_data['lookups'])

    def test_list__dynamic(self):
        raw_filter_count = AvailableFilter.objects.count()
        dynamic_filter_count = AvailableFilter.objects.filter(lookups__filters='location_level').count()
        location_level_filters = LocationLevel.objects.count()
        self.assertEqual(raw_filter_count, 5)
        self.assertEqual(dynamic_filter_count, 1)
        self.assertEqual(location_level_filters, 5)
        desired_count = raw_filter_count - dynamic_filter_count + location_level_filters

        response = self.client.get('/api/admin/automation-available-filters/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        # count dynamic and non-dynamic
        self.assertEqual(data['count'], desired_count)
        # dynamic location_level record
        for d in data['results']:
            if d['lookups']:
                location_data = d
        location_level = LocationLevel.objects.get(id=location_data['lookups']['id'])
        location_af = create_available_filter_location()
        self.assertEqual(location_data['id'], str(location_af.id))
        self.assertEqual(location_data['key'], location_level.name)
        self.assertEqual(location_data['field'], 'location')
        self.assertNotIn('unique_key', location_data['lookups'])
        self.assertEqual(location_data['lookups']['id'], str(location_level.id))
        self.assertEqual(location_data['lookups']['name'], location_level.name)

    def test_list_sorted_in_ascending_order_by_key(self):
        response = self.client.get('/api/admin/automation-available-filters/')

        data = json.loads(response.content.decode('utf8'))
        prev = None
        for i, af in enumerate(data['results']):
            if i > 0:
                self.assertTrue(af['key'] > prev['key'])
            prev = af

    def test_detail(self):
        response = self.client.get('/api/admin/automation-available-filters/{}/'.format(self.af.id))
        self.assertEqual(response.status_code, 405)

    def test_create(self):
        response = self.client.post('/api/admin/automation-available-filters/', {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_update(self):
        response = self.client.put('/api/admin/automation-available-filters/{}/'.format(self.af.id))
        self.assertEqual(response.status_code, 405)

    def test_delete(self):
        response = self.client.delete('/api/admin/automation-available-filters/{}/'.format(self.af.id))
        self.assertEqual(response.status_code, 405)

    def test_list_non_dynamic_no_llevel(self):
        AvailableFilter.objects.filter(lookups__filters='location_level').delete()
        response = self.client.get('/api/admin/automation-available-filters/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['count'], AvailableFilter.objects.count())
