import json
import uuid

from rest_framework.test import APITestCase

from person.tests.factory import create_single_person, PASSWORD
from routing.models import Assignment, ProfileFilter
from routing.serializers import AssignmentCreateUpdateSerializer
from routing.tests.factory import create_assignment
from routing.tests.mixins import ViewTestSetupMixin
from ticket.tests.factory import create_ticket
from utils.create import _generate_chars


class ViewTests(ViewTestSetupMixin, APITestCase):

    def setUp(self):
        super(ViewTests, self).setUp()

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
            'criteria': self.invalid_criteria_id
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

    # def test_is_model_field(self):
    #     invalid_field = 'foo'
    #     self.data['filters'][0].update({
    #         'context': 'ticket.ticket',
    #     })

    #     response = self.client.post('/api/admin/assignments/', self.data, format='json')

    #     self.assertEqual(response.status_code, 400)
    #     data = json.loads(response.content.decode('utf8'))
    #     print(data)
    #     self.assertEqual(
    #         data['filters'][0]['context'][0],
    #         "'{}' content type does not exist.".format(invalid_context)
    #     )
    #     self.fail()
