import json
import uuid

from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase

from automation.models import AutomationActionType
from automation.serializers import AutomationCreateUpdateSerializer
from automation.tests.mixins import ViewTestSetupMixin
from automation.tests.factory import create_ticket_location_filter, create_automation_action_types
from automation.validators import AutomationActionValidator
from location.models import Location
from location.tests.factory import create_top_level_location
from person.models import Person
from ticket.models import TicketPriority, TicketStatus


class AutomationActionValidatorTests(ViewTestSetupMixin, APITestCase):

    def setUp(self):
        super(AutomationActionValidatorTests, self).setUp()

        create_automation_action_types()
        self.assignee_action_type = AutomationActionType.objects.get(key=AutomationActionType.TICKET_ASSIGNEE)
        self.priority_action_type = AutomationActionType.objects.get(key=AutomationActionType.TICKET_PRIORITY)
        self.status_action_type = AutomationActionType.objects.get(key=AutomationActionType.TICKET_STATUS)
        self.send_email_action_type = AutomationActionType.objects.get(key=AutomationActionType.SEND_EMAIL)
        self.send_sms_action_type = AutomationActionType.objects.get(key=AutomationActionType.SEND_SMS)
        self.request_action_type = AutomationActionType.objects.get(key=AutomationActionType.TICKET_REQUEST)
        self.cc_action_type = AutomationActionType.objects.get(key=AutomationActionType.TICKET_CC)

        self.validator = AutomationActionValidator()

        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'

    # assignee

    def test_assignee(self):
        self.data['actions'] = [{
            'id': str(uuid.uuid4()),
            'type': str(self.assignee_action_type.id),
            'content': {
                'foo': 'bar'
            }
        }]

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['actions'][0]['non_field_errors'][0],
            "For type: {} must provide a key of: {} which is a {}.id"
            .format(AutomationActionType.TICKET_ASSIGNEE, 'assignee', Person.__class__.__name__)
        )

    # priority

    def test_priority(self):
        self.data['actions'] = [{
            'id': str(uuid.uuid4()),
            'type': str(self.priority_action_type.id),
            'content': {
                'foo': 'bar'
            }
        }]

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['actions'][0]['non_field_errors'][0],
            "For type: {} must provide a key of: {} which is a {}.id"
            .format(AutomationActionType.TICKET_PRIORITY, 'priority', TicketPriority.__class__.__name__)
        )

    # status

    def test_status(self):
        self.data['actions'] = [{
            'id': str(uuid.uuid4()),
            'type': str(self.status_action_type.id),
            'content': {
                'foo': 'bar'
            }
        }]

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['actions'][0]['non_field_errors'][0],
            "For type: {} must provide a key of: {} which is a {}.id"
            .format(AutomationActionType.TICKET_STATUS, 'status', TicketStatus.__class__.__name__)
        )

    # related_model_is_valid - used for action types: assignee, priority, status

    def test_related_model_is_valid__missing_assignee_key(self):
        self.validator.action_type = self.assignee_action_type
        self.validator.content = {'foo': 'bar'}

        with self.assertRaises(ValidationError):
            self.validator.related_model_is_valid('assignee', Person)

    def test_related_model_is_valid__too_man_args(self):
        self.validator.action_type = self.assignee_action_type
        self.validator.content = {'assignee': 1, 'foo': 'bar'}

        with self.assertRaises(ValidationError):
            self.validator.related_model_is_valid('assignee', Person)

    def test_related_model_is_valid__not_invalid_id(self):
        self.validator.action_type = self.assignee_action_type
        self.validator.content = {'assignee': 1}

        with self.assertRaises(ValidationError):
            self.validator.related_model_is_valid('assignee', Person)

    def test_related_model_is_valid__id_does_not_exist(self):
        self.validator.action_type = self.assignee_action_type
        self.validator.content = {'assignee': uuid.uuid4()}

        with self.assertRaises(ValidationError):
            self.validator.related_model_is_valid('assignee', Person)

    # related_model_is_valid: end

    def test_send_email(self):
        self.data['actions'] = [{
            'id': str(uuid.uuid4()),
            'type': str(self.send_email_action_type.id),
            'content': {
                'foo': 'bar'
            }
        }]

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['actions'][0]['non_field_errors'][0],
            "For type: {} must provide these keys: {}"
            .format(AutomationActionType.SEND_EMAIL, ', '.join(['recipients', 'subject', 'body']))
        )

    def test_send_sms(self):
        self.data['actions'] = [{
            'id': str(uuid.uuid4()),
            'type': str(self.send_sms_action_type.id),
            'content': {
                'foo': 'bar'
            }
        }]

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['actions'][0]['non_field_errors'][0],
            "For type: {} must provide these keys: {}"
            .format(AutomationActionType.SEND_SMS, ', '.join(['recipients', 'body']))
        )

    def test_request(self):
        self.data['actions'] = [{
            'id': str(uuid.uuid4()),
            'type': str(self.request_action_type.id),
            'content': {
                'foo': 'bar'
            }
        }]

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['actions'][0]['non_field_errors'][0],
            "For type: {} must provide these keys: {}"
            .format(AutomationActionType.TICKET_REQUEST, ', '.join(['request']))
        )

    def test_cc(self):
        self.data['actions'] = [{
            'id': str(uuid.uuid4()),
            'type': str(self.cc_action_type.id),
            'content': {
                'foo': 'bar'
            }
        }]

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['actions'][0]['non_field_errors'][0],
            "For type: {} must provide these keys: {}"
            .format(AutomationActionType.TICKET_CC, ', '.join(['ccs']))
        )


class AutomationFilterFieldValidatorTests(ViewTestSetupMixin, APITestCase):

    def setUp(self):
        super(AutomationFilterFieldValidatorTests, self).setUp()

        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'
        self.invalid_id= str(uuid.uuid4())
        self.invalid_criteria_id = str(uuid.uuid4())
        self.data['filters'] = [{
            'id': str(uuid.uuid4()),
            'source': str(self.source.id),
            'criteria': [str(self.location.id)]
        }]

    def test_is_valid_field_filter(self):
        self.data['filters'][0].update({
            'criteria': [self.invalid_criteria_id]
        })

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['filters'][0]['non_field_errors'][0],
            "'{}' is not a valid id for '{}'".format([self.invalid_criteria_id], Location.__name__)
        )

    def test_is_valid_field_filter__uuid_list(self):
        criteria = 'x'
        self.data['filters'][0].update({
            'criteria': criteria
        })

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['filters'][0]['non_field_errors'][0],
            "'{}' not valid. Must be a list of UUIDs".format(criteria)
        )


class AutomationFilterTypeValidatorTests(ViewTestSetupMixin, APITestCase):

    def setUp(self):
        super(AutomationFilterTypeValidatorTests, self).setUp()

        location_filter = create_ticket_location_filter()
        location_level = create_top_level_location().location_level
        # simulate what an existing location_filter.lookup will hold
        location_filter.lookups = {'id': str(location_level.id)}
        location_filter.save()
        self.automation.filters.add(location_filter)
        self.data = AutomationCreateUpdateSerializer(self.automation).data

        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'
        self.data.pop('tenant', None)

    def test_non_dynamic_filter(self):
        dupe_field = 'priority'
        self.data['filters'] = [{
            'id': str(uuid.uuid4()),
            'source': str(self.priority_af.id),
            'criteria': [str(self.ticket_priority.id)]
        },{
            'id': str(uuid.uuid4()),
            'source': str(self.priority_af.id),
            'criteria': [str(self.ticket_priority.id)]
        }]

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['non_field_errors'][0],
            "Duplicate filter(s): {}".format(dupe_field)
        )

    def test_dynamic_filter(self):
        dupe_field = 'location'
        self.data['filters'] = [{
            'id': str(uuid.uuid4()),
            'source': str(self.source.id),
            'criteria': [str(self.location.id)],
            'lookups': {'id': str(self.location.location_level.id)}
        },{
            'id': str(uuid.uuid4()),
            'source': str(self.source.id),
            'criteria': [str(self.location.id)],
            'lookups': {'id': str(self.location.location_level.id)}
        }]

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['non_field_errors'][0],
            "Duplicate filter(s): {}-location_level-{}"
                .format(dupe_field, str(self.location.location_level.id))
        )
