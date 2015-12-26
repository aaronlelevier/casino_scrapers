import json
import uuid
from rest_framework import status

from rest_framework.test import APITestCase, APITransactionTestCase
from work_order.models import (WorkOrderStatus, WorkOrder,)
from work_order.serializers import WorkOrderCreateSerializer
from person.tests.factory import PASSWORD, create_single_person
from person.models import Person
from location.tests.factory import create_location
from location.models import Location
from work_order.tests.factory import (create_work_orders, create_work_order, create_work_order_status)


class WorkOrderListTests(APITestCase):
    
    def setUp(self):
        self.person = create_single_person()
        self.wo = create_work_order()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        response = self.client.get('/api/work-orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_data(self):
        response = self.client.get('/api/work-orders/')
        data = json.loads(response.content.decode('utf8'))
        wo = data['results'][0]
        self.assertEqual(wo['id'], str(self.wo.id))
        self.assertIsNotNone(wo['location'])
        self.assertEqual(wo['status'], str(self.wo.status.id))
        self.assertEqual(wo['priority'], str(self.wo.priority.id))
        self.assertIsNotNone(wo['requester'])
        self.assertIsNotNone(wo['date_due'])

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
        self.assertEqual(assignee['title'], self.wo.assignee.title)
        self.assertEqual(assignee['role'], str(self.wo.assignee.role.id))


class WorkOrderDetailTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.wo = create_work_order()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        response = self.client.get('/api/work-orders/{}/'.format(self.wo.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_data(self):
        response = self.client.get('/api/work-orders/{}/'.format(self.wo.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.wo.id))
        self.assertIsNotNone(data['location'])
        self.assertEqual(data['status'], str(self.wo.status.id))
        self.assertEqual(data['priority'], str(self.wo.priority.id))
        self.assertIsNotNone(data['requester'])
        self.assertIsNotNone(data['date_due'])


class WorkOrderUpdateTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.wo = create_work_order()
        self.client.login(username=self.person.username, password=PASSWORD)
        serializer = WorkOrderCreateSerializer(self.wo)
        self.data = serializer.data

    def tearDown(self):
        self.client.logout()

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
