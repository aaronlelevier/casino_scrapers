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
from work_order.models import WorkOrder
from work_order.serializers import WorkOrderCreateSerializer, WorkOrderUpdateSerializer
from work_order.tests.factory import create_work_order, create_work_order_status, TIME


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
        self.assertIsNotNone(data['instructions'])
        self.assertIsNotNone(data['location'])
        self.assertEqual(data['priority'], str(self.wo.priority.id))
        self.assertIsNotNone(data['requester'])
        self.assertIsNotNone(data['scheduled_date'])
        self.assertEqual(data['status'], str(self.wo.status.id))


class WorkOrderUpdateTests(SetupMixin, APITestCase):

    def setUp(self):
        super(WorkOrderUpdateTests, self).setUp()
        self.data = WorkOrderCreateSerializer(self.wo).data

    def test_no_change(self):
        response = self.client.put('/api/work-orders/{}/'.format(self.wo.id), 
            self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_change_location(self):
        new_location = create_location()
        self.data['location'] = new_location.id
        response = self.client.put('/api/work-orders/{}/'.format(self.wo.id), 
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['location'], str(self.data['location']))

    def test_change_status(self):
        new_status = create_work_order_status()
        self.data['status'] = new_status.id
        response = self.client.put('/api/work-orders/{}/'.format(self.wo.id), 
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['status'], str(self.data['status']))

    def test_change_assignee(self):
        new_assignee = create_single_person()
        self.data['assignee'] = new_assignee.id
        response = self.client.put('/api/work-orders/{}/'.format(self.wo.id), 
            self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['assignee'], str(self.data['assignee']))



class WorkOrderCreateTests(SetupMixin, APITestCase):

    def setUp(self):
        super(WorkOrderCreateTests, self).setUp()
        self.wo = create_work_order()
        self.data = WorkOrderCreateSerializer(self.wo).data

    def test_data(self):
        self.data.update({
            'id': str(uuid.uuid4())
        })

        response = self.client.post('/api/work-orders/', self.data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], self.data['id'])
        self.assertEqual(data['category'], str(self.data['category']))
        self.assertEqual(data['provider'], str(self.data['provider']))
        self.assertEqual(data['location'], str(self.data['location']))
        self.assertEqual(data['scheduled_date'], self.data['scheduled_date'])
        self.assertEqual(data['approved_amount'], self.data['approved_amount'])
        self.assertEqual(data['cost_estimate'], self.data['cost_estimate'])
        self.assertEqual(data['cost_estimate_currency'], str(self.data['cost_estimate_currency']))

    def test_validation__scheduled_date_gte_today(self):
        self.data.update({
            'id': str(uuid.uuid4()),
            'scheduled_date': localtime(now()) - timedelta(days=1)
        })

        response = self.client.post('/api/work-orders/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['scheduled_date'][0], 'errors.date.gte_today')
