import json
import uuid
import random

from rest_framework import status
from rest_framework.test import APITestCase

from category.models import Category
from person.tests.factory import PASSWORD, create_person
from ticket.models import Ticket
from ticket.serializers import TicketCreateSerializer
from ticket.tests.factory import create_ticket


class TicketListTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        # Ticket
        self.ticket = create_ticket()
        self.person = self.ticket.assignee
        # Category
        self.category_ids = [str(x) for x in Category.objects.values_list('id', flat=True)]
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        response = self.client.get('/api/tickets/')
        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/tickets/')
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(len(data['results']) > 0)
        self.assertTrue(data['results'][0]['number'])
        assignee_person = data['results'][0]['assignee']
        self.assertEqual(str(assignee_person['id']), str(self.person.id))
        self.assertEqual(assignee_person['first_name'], self.person.first_name)
        self.assertEqual(assignee_person['middle_initial'], self.person.middle_initial)
        self.assertEqual(assignee_person['last_name'], self.person.last_name)
        self.assertEqual(assignee_person['role'], str(self.person.role.id))
        self.assertEqual(assignee_person['title'], self.person.title)
        categories = data['results'][0]['categories']
        self.assertIn(categories[0]['id'], self.category_ids)


class TicketDetailTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        # Ticket
        self.ticket = create_ticket()
        self.person = self.ticket.assignee
        # Category
        category = Category.objects.first()
        self.ticket.categories.add(category)
        self.ticket.save()
        self.category_ids = [str(c.id) for c in Category.objects.all()]
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_detail(self):
        response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.ticket.id))
        self.assertIn(data['categories'][0]['id'], self.category_ids)
        self.assertEqual(str(data['assignee']['id']), str(self.person.id))
        self.assertEqual(data['assignee']['first_name'], self.person.first_name)
        self.assertEqual(data['assignee']['middle_initial'], self.person.middle_initial)
        self.assertEqual(data['assignee']['last_name'], self.person.last_name)
        self.assertEqual(data['assignee']['role'], str(self.person.role.id))
        self.assertEqual(data['assignee']['title'], self.person.title)


class TicketUpdateTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        # Ticket
        self.ticket = create_ticket()
        self.person = self.ticket.assignee
        # Category
        # Data
        serializer = TicketCreateSerializer(self.ticket)
        self.data = serializer.data
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_no_change(self):
        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_change_name(self):
        self.data['request'] = 'new request name'
        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertNotEqual(self.ticket.request, data['request'])


class TicketCreateTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # Ticket
        self.ticket = create_ticket()
        # Data
        serializer = TicketCreateSerializer(self.ticket)
        self.data = serializer.data
        self.categories = Category.objects.all()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        self.data.update({
            'id': str(uuid.uuid4()),
            'request': 'plumbing',
            })
        response = self.client.post('/api/tickets/', self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)

        ticket = Ticket.objects.get(id=data['id'])
        self.assertIsInstance(ticket, Ticket)
