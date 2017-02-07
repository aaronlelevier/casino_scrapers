import json
import random
import uuid
from datetime import datetime, timedelta

from django.utils.timezone import localtime, now

from mock import patch
from rest_framework import status
from rest_framework.test import APITestCase

from location.tests.factory import create_location
from person.tests.factory import PASSWORD, create_single_person
from utils.tests.mixins import MockPermissionsAllowAnyMixin
from work_order.models import WorkOrder, WorkOrderStatus
from work_order.serializers import (WorkOrderCreateSerializer,
                                    WorkOrderUpdateSerializer)
from work_order.tests.factory import (TIME, create_work_order,
                                      create_work_order_priorities,
                                      create_work_order_status,
                                      create_work_order_statuses)


class SetupMixin(MockPermissionsAllowAnyMixin):

    def setUp(self):
        super(SetupMixin, self).setUp()
        self.person = create_single_person()
        self.wo = create_work_order()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        super(SetupMixin, self).tearDown()
        self.client.logout()


class WorkOrderListTests(SetupMixin, APITestCase):

    def test_response(self):
        response = self.client.get('/api/work-orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_auth_required(self):
        self.client.logout()
        response = self.client.get('/api/work-orders/')
        self.assertEqual(response.status_code, 403)

    def test_data(self):
        response = self.client.get('/api/work-orders/')
        data = json.loads(response.content.decode('utf8'))
        wo = data['results'][0]
        self.assertEqual(wo['id'], str(self.wo.id))
        self.assertIsNotNone(wo['location'])
        self.assertEqual(wo['status'], str(self.wo.status.id))
        self.assertEqual(wo['priority'], str(self.wo.priority.id))
        self.assertIsNotNone(wo['requester'])
        self.assertIsNotNone(wo['scheduled_date'])

    def test_data_location(self):
        response = self.client.get('/api/work-orders/')
        data = json.loads(response.content.decode('utf8'))
        location = data['results'][0]['location']
        self.assertEqual(location['id'], str(self.wo.location.id))
        self.assertEqual(location['name'], self.wo.location.name)
        self.assertEqual(location['number'], self.wo.location.number)
        self.assertEqual(location['location_level'],
            str(self.wo.location.location_level.id))

    def test_data_assignee(self):
        response = self.client.get('/api/work-orders/')
        data = json.loads(response.content.decode('utf8'))
        assignee = data['results'][0]['assignee']
        self.assertEqual(assignee['id'], str(self.wo.assignee.id))
        self.assertEqual(assignee['first_name'], self.wo.assignee.first_name)
        self.assertEqual(assignee['middle_initial'], self.wo.assignee.middle_initial)
        self.assertEqual(assignee['last_name'], self.wo.assignee.last_name)


class WorkOrderDetailTests(SetupMixin, APITestCase):

    def test_response(self):
        response = self.client.get('/api/work-orders/{}/'.format(self.wo.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_data(self):
        response = self.client.get('/api/work-orders/{}/'.format(self.wo.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.wo.id))
        self.assertIsNotNone(data['assignee'])
        self.assertIsNotNone(data['category'])
        self.assertIsNotNone(data['cost_estimate'])
        self.assertIsNotNone(data['cost_estimate_currency'])
        self.assertIn('gl_code', data)
        self.assertIsNotNone(data['instructions'])
        self.assertIsNotNone(data['location'])
        self.assertEqual(data['priority'], str(self.wo.priority.id))
        self.assertIsNotNone(data['requester'])
        self.assertIsNotNone(data['scheduled_date'])
        self.assertEqual(data['status'], str(self.wo.status.id))


class WorkOrderUpdateTests(SetupMixin, APITestCase):

    def setUp(self):
        super(WorkOrderUpdateTests, self).setUp()
        self.data = {
            'id': str(uuid.uuid4()),
            'scheduled_date': self.wo.scheduled_date,
            'approval_date': self.wo.approval_date,
            'approved_amount': self.wo.approved_amount,
            'gl_code': self.wo.gl_code,
            'instructions': self.wo.instructions,
            'cost_estimate_currency': self.wo.cost_estimate_currency.id,
            'provider': self.wo.provider.id,
            'location': self.wo.location.id,
            'status': self.wo.status.id,
            'category': self.wo.category.id,
        }

    def test_no_change(self):
        response = self.client.put('/api/work-orders/{}/'.format(self.wo.id), 
            self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_change_status(self):
        new_status = create_work_order_status()
        self.data['status'] = new_status.id
        response = self.client.put('/api/work-orders/{}/'.format(self.wo.id), 
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['status'], str(new_status.id))


class WorkOrderCreateTests(SetupMixin, APITestCase):

    def setUp(self):
        super(WorkOrderCreateTests, self).setUp()
        create_work_order_statuses()
        create_work_order_priorities()

    def test_data(self):
        post_data = {
            'id': str(uuid.uuid4()),
            'ticket': self.wo.ticket.id,
            'category': self.wo.category.id,
            'provider': self.wo.provider.id,
            'location': self.wo.location.id,
            'scheduled_date': self.wo.scheduled_date,
            'instructions': self.wo.instructions,
            'approved_amount': self.wo.approved_amount,
            'cost_estimate_currency': self.wo.cost_estimate_currency.id,
            'requester': self.wo.requester
        }

        response = self.client.post('/api/work-orders/', post_data, format='json')

        self.assertEqual(response.status_code, 201,
                         'Error: {}'.format(json.loads(response.content.decode('utf8'))))
        data = json.loads(response.content.decode('utf8'))
        work_order = WorkOrder.objects.get(id=post_data['id'])
        self.assertEqual(data['id'], str(work_order.id))
        self.assertEqual(data['cost_estimate'], work_order.cost_estimate)
        self.assertEqual(data['cost_estimate_currency'], str(work_order.cost_estimate_currency.id))
        self.assertEqual(data['tracking_number'], work_order.tracking_number)
        self.assertEqual(data['gl_code'], work_order.gl_code)
        self.assertEqual(data['instructions'], work_order.instructions)
        self.assertIsNotNone(data['scheduled_date'])
        self.assertIsNotNone(data['expiration_date'])
        self.assertEqual(data['status']['id'], str(work_order.status.id))
        self.assertEqual(data['status']['name'], work_order.status.name)
        self.assertEqual(data['category']['id'], str(work_order.category.id))
        self.assertEqual(data['category']['name'], work_order.category.name)
        self.assertEqual(data['category']['description'], work_order.category.description)
        self.assertEqual(data['category']['cost_code'], work_order.category.cost_code)
        self.assertEqual(data['category']['cost_currency'], str(work_order.category.cost_currency.id))
        self.assertEqual(data['category']['cost_amount'], work_order.category.cost_amount)
        self.assertEqual(data['category']['label'], work_order.category.label)
        self.assertEqual(data['provider']['id'], str(work_order.provider.id))
        self.assertEqual(data['provider']['name'], work_order.provider.name)
        self.assertEqual(data['provider']['address1'], work_order.provider.address1)
        self.assertEqual(data['provider']['address2'], work_order.provider.address2)
        self.assertEqual(data['provider']['city'], work_order.provider.city)
        self.assertEqual(data['provider']['state'], work_order.provider.state)
        self.assertEqual(data['provider']['postal_code'], work_order.provider.postal_code)
        self.assertEqual(data['provider']['phone'], work_order.provider.phone)
        self.assertEqual(data['provider']['email'], work_order.provider.email)
        self.assertEqual(data['provider']['logo'], work_order.provider.logo)
        # these fields are auto generated
        self.assertEqual(work_order.cost_estimate, work_order.approved_amount)
        self.assertEqual(work_order.expiration_date, work_order.scheduled_date)
        self.assertEqual(work_order.approval_date, work_order.scheduled_date)
        self.assertIsNone(work_order.completed_date)
        self.assertEqual(work_order.priority.simple_name, work_order.ticket.priority.simple_name)
        # not being defaulted
        self.assertFalse(work_order.tracking_number)
        self.assertFalse(work_order.assignee)

    def test_validation__scheduled_date_gte_today(self):
        post_data = {
            'id': str(uuid.uuid4()),
            'ticket': self.wo.ticket.id,
            'category': self.wo.category.id,
            'provider': self.wo.provider.id,
            'location': self.wo.location.id,
            'scheduled_date': localtime(now()) - timedelta(days=1),
            'approved_amount': self.wo.approved_amount,
            'requester': self.wo.requester
        }

        response = self.client.post('/api/work-orders/', post_data, format='json')

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['scheduled_date'][0], 'errors.date.gte_today')


class WorkOrderDeleteTests(SetupMixin, APITestCase):
    """
    Work orders are a contract and can't be deleted, only cancelled
    """

    def test_delete_not_allowed(self):
        response = self.client.delete('/api/work-orders/{}/'.format(self.wo.id))
        self.assertEqual(response.status_code, 405)
