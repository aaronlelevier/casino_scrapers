import json
import uuid
import random

from rest_framework.test import APITestCase

from ticket.models import Ticket
from location.models import Location
from category.models import Category
from rest_framework import status
from ticket.serializers import TicketSerializer, TicketListSerializer, TicketCreateSerializer
from ticket.tests.factory import create_tickets
from person.tests.factory import PASSWORD, create_person


class TicketListTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # Ticket
        create_tickets()
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


class TicketDetailTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # Ticket
        create_tickets()
        self.ticket = Ticket.objects.first()
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
        # self.assertEqual(data['location']['id'], str(self.location.id))
        # self.assertTrue(data['cc'][0]['id'])
        # self.assertTrue(data['assignee']['id'])
        # self.assertTrue(data['requester']['id'])


# class TicketUpdateTests(APITestCase):

#     def setUp(self):
#         self.password = PASSWORD
#         self.person = create_person()
#         # Ticket
#         create_tickets()
#         self.ticket = Ticket.objects.first()
#         # self.location = Location.objects.first()
#         category = Category.objects.first()
#         self.ticket.categories.add(category)
#         # self.ticket.location.add(self.location)
#         self.ticket.save()
#         # Data
#         serializer = TicketCreateSerializer(self.ticket)
#         self.data = serializer.data
#         # Login
#         self.client.login(username=self.person.username, password=PASSWORD)

#     def tearDown(self):
#         self.client.logout()

#     def test_no_change(self):
#         response = self.client.put('/api/tickets/{}/'.format(self.ticket.id),
#             self.data, format='json')
#         self.assertEqual(response.status_code, 200)

#     def test_change_name(self):
#         self.data['subject'] = 'new subject name'
#         response = self.client.put('/api/tickets/{}/'.format(self.ticket.id),
#             self.data, format='json')
#         self.assertEqual(response.status_code, 200)
#         data = json.loads(response.content.decode('utf8'))
#         self.assertNotEqual(self.ticket.subject, data['subject'])


class TicketCreateTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # Ticket
        create_tickets()
        self.ticket = Ticket.objects.first()
        # Data
        serializer = TicketSerializer(self.ticket)
        self.data = serializer.data
        self.categories = Category.objects.all()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        self.data.update({
            'id': str(uuid.uuid4()),
            'number': random.randint(0, 1000),
            'subject': 'plumbing',
            'categories': [x.id for x in self.categories]
            })
        response = self.client.post('/api/tickets/', self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        ticket = Ticket.objects.get(id=data['id'])
        self.assertIsInstance(ticket, Ticket)
        self.assertEqual(ticket.categories.count(), 2)
