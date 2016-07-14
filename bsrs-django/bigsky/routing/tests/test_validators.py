import json
import uuid

from rest_framework.test import APITestCase

from routing.tests.mixins import ViewTestSetupMixin
from ticket.models import Ticket, TicketPriority


class ValidatorTests(ViewTestSetupMixin, APITestCase):

    def setUp(self):
        super(ValidatorTests, self).setUp()

        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'
        self.invalid_id= str(uuid.uuid4())
        self.invalid_context = 'foo'
        self.invalid_field = 'bar'
        self.invalid_criteria_id = str(uuid.uuid4())
        self.data['filters'] = [{
            'id': self.invalid_id,
            'context': self.invalid_context,
            'field': self.invalid_field,
            'criteria': [self.invalid_criteria_id]
        }]

    def test_is_model_class__not_correct_format(self):
        response = self.client.post('/api/admin/assignments/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['filters'][0]['non_field_errors'][0],
            "{} must be an 'app_label.model'".format(self.invalid_context)
        )

    def test_is_model_class__class_doesnotexist(self):
        invalid_context = 'ticket.person'
        self.data['filters'][0].update({
            'context': invalid_context
        })

        response = self.client.post('/api/admin/assignments/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['filters'][0]['non_field_errors'][0],
            "'{}' content type does not exist.".format(invalid_context)
        )

    def test_is_model_field(self):
        self.data['filters'][0].update({
            'context': 'ticket.ticket',
        })

        response = self.client.post('/api/admin/assignments/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['filters'][0]['non_field_errors'][0],
            "'{}' is not a field on '{}'".format(self.invalid_field, Ticket.__name__)
        )

    def test_is_valid_field_filter(self):
        self.data['filters'][0].update({
            'context': 'ticket.ticket',
            'field': 'priority'
        })

        response = self.client.post('/api/admin/assignments/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['filters'][0]['non_field_errors'][0],
            "'{}' is not a valid id for '{}'".format([self.invalid_criteria_id], TicketPriority.__name__)
        )

    def test_is_valid_field_filter__uuid_list(self):
        criteria = 'x'
        self.data['filters'][0].update({
            'context': 'ticket.ticket',
            'field': 'priority',
            'criteria': criteria
        })

        response = self.client.post('/api/admin/assignments/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['filters'][0]['non_field_errors'][0],
            "'{}' not valid. Must be a list of UUIDs".format(criteria)
        )
