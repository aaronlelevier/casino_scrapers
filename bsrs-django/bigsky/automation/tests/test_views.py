import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from category.models import Category
from contact.models import State, Country
from location.models import LocationLevel
from location.tests.factory import (create_location_levels, create_top_level_location,
    create_location_level, create_location)
from person.models import Role, Person
from person.tests.factory import create_single_person, PASSWORD
from automation.models import (AutomationEvent, Automation, AutomationFilter, AutomationFilterType,
    AutomationActionType)
from automation.tests.factory import (
    create_automation, create_automation_filter_types, create_automation_filter_type_location,
    create_ticket_location_filter, create_ticket_categories_mid_level_filter, create_automation,
    create_ticket_location_state_filter, create_ticket_location_country_filter, create_automation_events,
    create_automation_event_two, create_automation_action_types, create_automation_action_priority,
    create_automation_action_type, create_automation_action_status, create_automation_action_send_email,
    create_automation_action_send_sms, create_automation_action_request, create_automation_action_cc)
from automation.tests.mixins import ViewTestSetupMixin
from ticket.models import TicketPriority, TicketStatus
from utils.create import _generate_chars
from utils.helpers import create_default, add_related, remove_related, clear_related


class AutomationEventTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        create_automation_events()
        self.event = AutomationEvent.objects.first()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        self.assertTrue(self.event)

        response = self.client.get('/api/admin/automation-events/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['count'] == len(AutomationEvent.ALL))
        self.assertEqual(len(data['results'][0]), 2)
        event = AutomationEvent.objects.get(id=data['results'][0]['id'])
        self.assertEqual(data['results'][0]['key'], event.key)


class AutomationActionTypesTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        create_automation_action_types()
        self.action_type = AutomationActionType.objects.first()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list(self):
        self.assertTrue(self.action_type)

        response = self.client.get('/api/admin/automation-action-types/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['count'] > 0)
        self.assertEqual(len(data['results'][0]), 2)
        event = AutomationActionType.objects.get(id=data['results'][0]['id'])
        self.assertEqual(data['results'][0]['key'], event.key)


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
        # events
        self.assertEqual(len(data['events']), 1)
        event = self.automation.events.first()
        self.assertEqual(data['events'][0]['id'], str(event.id))
        self.assertEqual(data['events'][0]['key'], event.key)
        # automation_filters
        self.assertTrue(self.automation.filters.first())
        self.assertTrue(data['has_filters'])

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
        # events
        self.assertEqual(len(data['events']), 1)
        event = self.automation.events.first()
        self.assertEqual(data['events'][0]['id'], str(event.id))
        self.assertEqual(data['events'][0]['key'], event.key)
        # automation_filter
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
        # dynamic available filter for "location" linked to AutomationFilter.source
        location_level = create_top_level_location().location_level
        location_filter = create_ticket_location_filter()
        location_filter.lookups.pop('filters', None)
        clear_related(self.automation, 'filters')
        add_related(location_filter, 'automation', self.automation)

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
            remove_related(pf)

        response = self.client.get('/api/admin/automations/{}/'.format(self.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(len(data['filters'][0]['criteria']), 1)
        self.assertEqual(data['filters'][0]['criteria'][0]['id'], str(priority.id))
        self.assertEqual(data['filters'][0]['criteria'][0]['name'], str(priority.name))

    def test_criteria__location(self):
        clear_related(self.automation, 'filters')
        self.assertEqual(self.automation.filters.count(), 0)
        location = create_top_level_location()
        location_filter = create_ticket_location_filter()
        add_related(location_filter, 'automation', self.automation)

        response = self.client.get('/api/admin/automations/{}/'.format(self.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(len(data['filters'][0]['criteria']), 1)
        self.assertEqual(data['filters'][0]['criteria'][0]['id'], str(location.id))
        self.assertEqual(data['filters'][0]['criteria'][0]['name'], location.name)

    def test_criteria__categories(self):
        clear_related(self.automation, 'filters')
        self.assertEqual(self.automation.filters.count(), 0)
        category_filter = create_ticket_categories_mid_level_filter()
        category = Category.objects.get(id=category_filter.criteria[0])
        add_related(category_filter, 'automation', self.automation)

        response = self.client.get('/api/admin/automations/{}/'.format(self.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(len(data['filters'][0]['criteria']), 1)
        self.assertEqual(data['filters'][0]['criteria'][0]['id'], str(category.id))
        self.assertEqual(data['filters'][0]['criteria'][0]['name'], category.parents_and_self_as_string())

    def test_criteria_state(self):
        clear_related(self.automation, 'filters')
        self.assertEqual(self.automation.filters.count(), 0)
        state_filter = create_ticket_location_state_filter()
        state = State.objects.get(id=state_filter.criteria[0])
        add_related(state_filter, 'automation', self.automation)

        response = self.client.get('/api/admin/automations/{}/'.format(self.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(len(data['filters'][0]['criteria']), 1)
        self.assertEqual(data['filters'][0]['criteria'][0]['id'], str(state.id))
        self.assertEqual(data['filters'][0]['criteria'][0]['name'], state.name)

    def test_criteria_country(self):
        clear_related(self.automation, 'filters')
        self.assertEqual(self.automation.filters.count(), 0)
        country_filter = create_ticket_location_country_filter()
        country = Country.objects.get(id=country_filter.criteria[0])
        add_related(country_filter, 'automation', self.automation)

        response = self.client.get('/api/admin/automations/{}/'.format(self.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(len(data['filters'][0]['criteria']), 1)
        self.assertEqual(data['filters'][0]['criteria'][0]['id'], str(country.id))
        self.assertEqual(data['filters'][0]['criteria'][0]['name'], country.common_name)

    def test_action_assignee(self):
        action = self.automation.actions.first()

        response = self.client.get('/api/admin/automations/{}/'.format(self.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['actions']), 1)
        self.assertEqual(data['actions'][0]['id'], str(action.id))
        self.assertEqual(data['actions'][0]['type']['id'], str(action.type.id))
        self.assertEqual(data['actions'][0]['type']['key'], action.type.key)
        assignee = Person.objects.get(id=action.content['assignee'])
        self.assertEqual(data['actions'][0]['assignee']['id'], str(assignee.id))
        self.assertEqual(data['actions'][0]['assignee']['fullname'], assignee.fullname)
        self.assertNotIn('content', data['actions'][0])

    def test_action_priority(self):
        action = create_automation_action_priority()

        response = self.client.get('/api/admin/automations/{}/'.format(action.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['actions']), 1)
        self.assertEqual(data['actions'][0]['id'], str(action.id))
        self.assertEqual(data['actions'][0]['type']['id'], str(action.type.id))
        self.assertEqual(data['actions'][0]['type']['key'], action.type.key)
        priority = TicketPriority.objects.get(id=action.content['priority'])
        self.assertEqual(data['actions'][0]['priority']['id'], str(priority.id))
        self.assertEqual(data['actions'][0]['priority']['name'], priority.name)
        self.assertNotIn('content', data['actions'][0])

    def test_action_status(self):
        action = create_automation_action_status()

        response = self.client.get('/api/admin/automations/{}/'.format(action.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['actions']), 1)
        self.assertEqual(data['actions'][0]['id'], str(action.id))
        self.assertEqual(data['actions'][0]['type']['id'], str(action.type.id))
        self.assertEqual(data['actions'][0]['type']['key'], action.type.key)
        status = TicketStatus.objects.get(id=action.content['status'])
        self.assertEqual(data['actions'][0]['status']['id'], str(status.id))
        self.assertEqual(data['actions'][0]['status']['name'], status.name)
        self.assertNotIn('content', data['actions'][0])

    def test_action_send_email(self):
        action = create_automation_action_send_email()

        response = self.client.get('/api/admin/automations/{}/'.format(action.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['actions']), 1)
        self.assertEqual(data['actions'][0]['id'], str(action.id))
        self.assertEqual(data['actions'][0]['type']['id'], str(action.type.id))
        self.assertEqual(data['actions'][0]['type']['key'], action.type.key)
        self.assertEqual(len(data['actions'][0]['recipients']), 2)
        person = Person.objects.get(id=action.content['recipients'][0]['id'])
        self.assertEqual(data['actions'][0]['recipients'][0]['id'], str(person.id))
        self.assertEqual(data['actions'][0]['recipients'][0]['fullname'], person.fullname)
        self.assertEqual(data['actions'][0]['recipients'][0]['type'], person.__class__.__name__.lower())
        role = Role.objects.get(id=action.content['recipients'][1]['id'])
        self.assertEqual(data['actions'][0]['recipients'][1]['id'], str(role.id))
        self.assertEqual(data['actions'][0]['recipients'][1]['fullname'], role.fullname)
        self.assertEqual(data['actions'][0]['recipients'][1]['type'], role.__class__.__name__.lower())
        self.assertEqual(data['actions'][0]['subject'], action.content['subject'])
        self.assertEqual(data['actions'][0]['body'], action.content['body'])
        self.assertNotIn('content', data['actions'][0])

    def test_action_send_sms(self):
        action = create_automation_action_send_sms()

        response = self.client.get('/api/admin/automations/{}/'.format(action.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['actions']), 1)
        self.assertEqual(data['actions'][0]['id'], str(action.id))
        self.assertEqual(data['actions'][0]['type']['id'], str(action.type.id))
        self.assertEqual(data['actions'][0]['type']['key'], action.type.key)
        self.assertEqual(len(data['actions'][0]['recipients']), 2)
        person = Person.objects.get(id=action.content['recipients'][0]['id'])
        self.assertEqual(data['actions'][0]['recipients'][0]['id'], str(person.id))
        self.assertEqual(data['actions'][0]['recipients'][0]['fullname'], person.fullname)
        self.assertEqual(data['actions'][0]['recipients'][0]['type'], person.__class__.__name__.lower())
        role = Role.objects.get(id=action.content['recipients'][1]['id'])
        self.assertEqual(data['actions'][0]['recipients'][1]['id'], str(role.id))
        self.assertEqual(data['actions'][0]['recipients'][1]['fullname'], role.fullname)
        self.assertEqual(data['actions'][0]['recipients'][1]['type'], role.__class__.__name__.lower())
        self.assertEqual(data['actions'][0]['body'], action.content['body'])
        self.assertNotIn('content', data['actions'][0])

    def test_action_request(self):
        action = create_automation_action_request()

        response = self.client.get('/api/admin/automations/{}/'.format(action.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['actions']), 1)
        self.assertEqual(data['actions'][0]['id'], str(action.id))
        self.assertEqual(data['actions'][0]['type']['id'], str(action.type.id))
        self.assertEqual(data['actions'][0]['type']['key'], action.type.key)
        self.assertEqual(data['actions'][0]['request'], action.content['request'])

    def test_action_cc(self):
        action = create_automation_action_cc()

        response = self.client.get('/api/admin/automations/{}/'.format(action.automation.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['actions']), 1)
        self.assertEqual(data['actions'][0]['id'], str(action.id))
        self.assertEqual(data['actions'][0]['type']['id'], str(action.type.id))
        self.assertEqual(data['actions'][0]['type']['key'], action.type.key)
        self.assertEqual(len(data['actions'][0]['ccs']), 1)
        person = Person.objects.get(id=data['actions'][0]['ccs'][0]['id'])
        self.assertEqual(data['actions'][0]['ccs'][0]['fullname'], person.fullname)


class AutomationCreateTests(ViewTestSetupMixin, APITestCase):

    def setUp(self):
        super(AutomationCreateTests, self).setUp()

        create_automation_action_types()

    def test_create(self):
        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'
        # events
        event = create_automation_event_two()
        self.data['events'] = [str(event.id)]
        # dynamic location filter
        location = create_location()
        criteria_two = [str(location.id)]
        location_af = create_automation_filter_type_location()
        self.data['filters'] = [{
            'id': str(uuid.uuid4()),
            'source': str(location_af.id),
            'criteria': criteria_two,
            'lookups': {'id': str(location.location_level.id)}
        }]
        # actions
        action_type = create_automation_action_type()
        self.data['actions'] = [{
            'id': str(uuid.uuid4()),
            'type': str(action_type.id),
            'content': {
                'assignee': str(self.person.id)
            }
        }]

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        automation = Automation.objects.get(id=self.data['id'])
        self.assertEqual(data['id'], str(automation.id))
        self.assertNotIn('tenant', data)
        self.assertEqual(data['description'], automation.description)
        # events
        self.assertEqual(data['events'], [str(event.id)])
        # automation_filter
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(automation.filters.first().source, location_af)
        self.assertEqual(automation.filters.first().criteria, criteria_two)
        self.assertEqual(automation.filters.first().lookups, {'id': str(location.location_level.id)})
        # actions
        self.assertEqual(len(data['actions']), 1)
        self.assertEqual(data['actions'][0]['id'], self.data['actions'][0]['id'])
        self.assertEqual(data['actions'][0]['type'], self.data['actions'][0]['type'])
        self.assertEqual(data['actions'][0]['content'], self.data['actions'][0]['content'])
        self.assertEqual(data['actions'][0]['content']['assignee'], str(self.person.id))

    def test_create__multiple_filters(self):
        # filter 1 (will come w/ `self.data` by default)
        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'
        # filter 2
        location_af = create_automation_filter_type_location()
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
        # set as empty here, because to be tested separately later for multiple
        self.data['actions'] = []

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        automation = Automation.objects.get(id=data['id'])
        self.assertEqual(automation.filters.filter(source__field='priority').count(), 1)
        self.assertEqual(automation.filters.filter(source__field='location', lookups={'id': str(location_level.id)}).count(), 1)
        self.assertEqual(automation.filters.filter(source__field='location', lookups={'id': str(location_level_two.id)}).count(), 1)

    def test_create_multiple_actions(self):
        assignee_action_type = AutomationActionType.objects.get(key=AutomationActionType.TICKET_ASSIGNEE)
        priority_action_type = AutomationActionType.objects.get(key=AutomationActionType.TICKET_PRIORITY)
        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'
        self.data['filters'] = []
        # actions
        action_types = create_automation_action_types()
        self.data['actions'] = [{
            'id': str(uuid.uuid4()),
            'type': str(assignee_action_type.id),
            'content': {
                'assignee': str(self.person.id)
            }
        },{
            'id': str(uuid.uuid4()),
            'type': str(priority_action_type.id),
            'content': {
                'priority': str(self.ticket_priority.id)
            }
        }]

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(data['actions']), 2)
        self.assertEqual(data['actions'][0], self.data['actions'][0])
        self.assertEqual(data['actions'][1], self.data['actions'][1])


class AutomationUpdateTests(ViewTestSetupMixin, APITestCase):

    def setUp(self):
        super(AutomationUpdateTests, self).setUp()
        remove_related(self.category_filter)

    def test_setup(self):
        self.assertEqual(self.automation.filters.count(), 1)
        self.assertEqual(self.automation.filters.first(), self.priority_filter)

    def test_update(self):
        # Base fields update only, no nested updating
        event = create_automation_event_two()
        self.assertNotEqual(self.data['events'], [str(event.id)])
        self.data.update({
            'description': 'foo',
            'events': [str(event.id)]
        })
        self.data['filters'] = []
        self.data['actions'] = []

        response = self.client.put('/api/admin/automations/{}/'.format(self.automation.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], self.data['id'])
        self.assertNotIn('tenant', data)
        self.assertEqual(data['description'], self.data['description'])
        self.assertEqual(data['events'], [str(event.id)])
        self.assertEqual(len(data['filters']), 0)
        self.assertEqual(len(data['actions']), 0)

    def test_update__nested_create(self):
        af = create_automation_filter_type_location()
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
        location_af = create_automation_filter_type_location()
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
        automation_filter = self.automation.filters.first()
        self.assertEqual(self.automation.filters.first().source, self.priority_af)
        self.assertNotEqual(self.automation.filters.first().criteria, criteria_two)
        self.data['filters'] = [{
            'id': str(automation_filter.id),
            'source': str(automation_filter.source.id),
            'criteria': criteria_two
        }]

        response = self.client.put('/api/admin/automations/{}/'.format(self.automation.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['filters']), 1)
        self.assertEqual(self.automation.filters.first(), automation_filter)
        self.assertEqual(self.automation.filters.first().source, self.priority_af)
        self.assertEqual(self.automation.filters.first().criteria, criteria_two)

    def test_update__nested_update__dynamic(self):
        clear_related(self.automation, 'filters')
        location = create_location()
        criteria_two = [str(location.id)]
        location_filter = create_ticket_location_filter()
        location_af = location_filter.source
        add_related(location_filter, 'automation', self.automation)
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
        clear_related(self.automation, 'filters')
        location_filter = create_ticket_location_filter()
        # filter 1 - will be an existing related record
        location_level = create_location_level('foo')
        location = create_location(location_level)
        add_related(location_filter, 'automation', self.automation)
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
        add_related(location_filter_two, 'automation', self.automation)
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

    def test_update__nested_deleting_of_filters(self):
        """
        Related AutomationFilters are "hard" deleted if they have been
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
        self.assertFalse(AutomationFilter.objects.filter(id=deleted_id).exists())
        self.assertFalse(AutomationFilter.objects_all.filter(id=deleted_id).exists())

    def test_update__other_automation_filters_not_affected(self):
        """
        Confirms that the nested remove clean up loop filters for the related
        AutomationFilters only for the Automation instance.
        """
        mommy.make(AutomationFilter, criteria=self.priority_filter.criteria)
        init_count = AutomationFilter.objects.count()

        response = self.client.put('/api/admin/automations/{}/'.format(self.automation.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(AutomationFilter.objects.count(), init_count)

    # AutomationActions

    def test_update__actions__existing(self):
        self.assertEqual(len(self.data['actions']), 1)
        new_action_type = create_automation_action_type(AutomationActionType.TICKET_PRIORITY)
        self.data['actions'][0]['type'] = str(new_action_type.id)
        self.data['actions'][0]['content'] = {'priority': str(self.ticket_priority.id)}

        response = self.client.put('/api/admin/automations/{}/'.format(self.automation.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['actions']), 1)
        self.assertEqual(data['actions'][0]['type'], self.data['actions'][0]['type'])
        self.assertEqual(data['actions'][0]['content'], self.data['actions'][0]['content'])

    def test_update__actions__add_new(self):
        new_action_type = create_automation_action_type(AutomationActionType.TICKET_PRIORITY)
        self.data['actions'].append({
            'id': str(uuid.uuid4()),
            'type': str(new_action_type.id),
            'content': {
                'priority': str(self.ticket_priority.id)
            }
        })
        self.assertEqual(len(self.data['actions']), 2)

        response = self.client.put('/api/admin/automations/{}/'.format(self.automation.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['actions']), 2)
        self.assertEqual(data['actions'][1]['id'], self.data['actions'][1]['id'])
        self.assertEqual(data['actions'][1]['type'], self.data['actions'][1]['type'])
        self.assertEqual(data['actions'][1]['content'], self.data['actions'][1]['content'])

    def test_update__nested_deleting_of_actions(self):
        """Hard delete nested Actions if not present in present in payload."""
        self.assertEqual(self.automation.actions.count(), 1)
        deleted_id = self.data['actions'][0]['id']
        self.data['actions'] = []

        response = self.client.put('/api/admin/automations/{}/'.format(self.automation.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data['actions']), 0)
        self.assertFalse(AutomationActionType.objects.filter(id=deleted_id).exists())
        self.assertFalse(AutomationActionType.objects_all.filter(id=deleted_id).exists())


class AutomationFilterTypeTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.tenant = self.person.role.tenant
        self.automation = create_automation(tenant=self.tenant)
        create_location_levels()
        create_automation_filter_types()
        self.af = AutomationFilterType.objects.first()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_list_non_dynamic(self):
        response = self.client.get('/api/admin/automation-automation-filter-types/')

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
        raw_filter_count = AutomationFilterType.objects.count()
        dynamic_filter_count = AutomationFilterType.objects.filter(lookups__filters='location_level').count()
        location_level_filters = LocationLevel.objects.count()
        self.assertEqual(raw_filter_count, 5)
        self.assertEqual(dynamic_filter_count, 1)
        self.assertEqual(location_level_filters, 5)
        desired_count = raw_filter_count - dynamic_filter_count + location_level_filters

        response = self.client.get('/api/admin/automation-automation-filter-types/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        # count dynamic and non-dynamic
        self.assertEqual(data['count'], desired_count)
        # dynamic location_level record
        for d in data['results']:
            if d['lookups']:
                location_data = d
        location_level = LocationLevel.objects.get(id=location_data['lookups']['id'])
        location_af = create_automation_filter_type_location()
        self.assertEqual(location_data['id'], str(location_af.id))
        self.assertEqual(location_data['key'], location_level.name)
        self.assertEqual(location_data['field'], 'location')
        self.assertNotIn('unique_key', location_data['lookups'])
        self.assertEqual(location_data['lookups']['id'], str(location_level.id))
        self.assertEqual(location_data['lookups']['name'], location_level.name)

    def test_list_sorted_in_ascending_order_by_key(self):
        response = self.client.get('/api/admin/automation-automation-filter-types/')

        data = json.loads(response.content.decode('utf8'))
        prev = None
        for i, af in enumerate(data['results']):
            if i > 0:
                self.assertTrue(af['key'] > prev['key'])
            prev = af

    def test_detail(self):
        response = self.client.get('/api/admin/automation-automation-filter-types/{}/'.format(self.af.id))
        self.assertEqual(response.status_code, 405)

    def test_create(self):
        response = self.client.post('/api/admin/automation-automation-filter-types/', {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_update(self):
        response = self.client.put('/api/admin/automation-automation-filter-types/{}/'.format(self.af.id))
        self.assertEqual(response.status_code, 405)

    def test_delete(self):
        response = self.client.delete('/api/admin/automation-automation-filter-types/{}/'.format(self.af.id))
        self.assertEqual(response.status_code, 405)

    def test_list_non_dynamic_no_llevel(self):
        AutomationFilterType.objects.filter(lookups__filters='location_level').delete()
        response = self.client.get('/api/admin/automation-automation-filter-types/')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['count'], AutomationFilterType.objects.count())
