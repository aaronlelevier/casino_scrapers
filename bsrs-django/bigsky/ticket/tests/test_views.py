import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from ticket.models import Ticket
from rest_framework import status
from ticket.serializers import TicketSerializer
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
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_detail(self):
        response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.ticket.id))


class TicketUpdateTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_person()
        # Ticket
        create_tickets()
        self.ticket = Ticket.objects.first()
        # Data
        serializer = TicketSerializer(self.ticket)
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
        self.data['subject'] = 'new subject name'
        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertNotEqual(self.ticket.subject, data['subject'])


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
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        self.data.update({
            'id': str(uuid.uuid4()),
            'subject': 'plumbing'
            })
        response = self.client.post('/api/tickets/', self.data, format='json')
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(Ticket.objects.get(id=data['id']), Ticket)
