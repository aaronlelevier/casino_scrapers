import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from dtd.models import TreeData
from dtd.serializers import TreeDataDetailSerializer
from dtd.tests.mixins import TreeDataTestSetUpMixin
from person.tests.factory import create_single_person
from ticket.models import Ticket
from ticket.serializers import TicketCreateSerializer, TicketSerializer
from ticket.tests.factory import create_ticket


class DTTicketViewSetTests(TreeDataTestSetUpMixin, APITestCase):

    def setUp(self):
        super(DTTicketViewSetTests, self).setUp()
        # serializer data
        self.ticket = create_ticket(assignee=self.person)
        serializer = TicketCreateSerializer(self.ticket)
        self.data = serializer.data
        link = self.tree_data.links.first()
        link.destination = mommy.make(TreeData)
        link.save()

    def test_post__ticket_created_and_dtd_response_returned(self):
        self.data.update({
            'id': str(uuid.uuid4()),
            'request': 'plumbing'
        })

        response = self.client.post('/api/tickets/{}/dt/'.format(self.tree_data.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 201)
        # Ticket
        self.assertTrue(Ticket.objects.get(id=self.data['id']))
        # DTD
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.tree_data.id))
        self.assertEqual(data.keys(), TreeDataDetailSerializer(self.tree_data).data.keys())

    def test_patch__ticket_updated_and_dtd_response_returned(self):
        self.data.update({
            'request': 'plumbing'
        })
        self.assertNotEqual(self.data['request'], self.ticket.request)

        response = self.client.patch('/api/tickets/{}/dt/'.format(self.tree_data.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        # Ticket
        ticket = Ticket.objects.get(id=self.data['id'])
        self.assertEqual(ticket.request, self.data['request'])
        # DTD
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.tree_data.id))
        self.assertEqual(data.keys(), TreeDataDetailSerializer(self.tree_data).data.keys())

    def test_patch__404_if_dtd_not_found(self):
        id = uuid.uuid4()

        response = self.client.patch('/api/tickets/{}/dt/'.format(id),
            self.data, format='json')

        self.assertEqual(response.status_code, 404)

    def test_patch__404_if_ticket_not_found(self):
        self.data['id'] = uuid.uuid4()

        response = self.client.patch('/api/tickets/{}/dt/'.format(self.tree_data.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 404)

    def test_patch__cannot_set_required_field_to_none(self):
        self.data['location'] =  None
        self.assertTrue(self.ticket.location)

        response = self.client.patch('/api/tickets/{}/dt/'.format(self.tree_data.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 400)
        message = json.loads(response.content.decode('utf8'))
        self.assertEqual(message, {'location': ['This field may not be null.']})

    def test_patch__missing_required_field(self):
        self.data.pop('location',  None)
        self.assertTrue(self.ticket.location)

        response = self.client.patch('/api/tickets/{}/dt/'.format(self.tree_data.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        ticket = Ticket.objects.get(id=self.ticket.id)
        self.assertEqual(self.ticket.location, ticket.location)

    def test_put(self):
        response = self.client.put('/api/tickets/{}/dt/'.format(self.tree_data.id), {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_delete(self):
        response = self.client.delete('/api/tickets/{}/dt/'.format(self.tree_data.id), {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_get__ticket_not_returned_if_no_query_param(self):
        response = self.client.get('/api/tickets/{}/dt/'.format(self.tree_data.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data.keys(), TreeDataDetailSerializer(self.tree_data).data.keys())

    def test_get__ticket_returned_if_query_param(self):
        response = self.client.get('/api/tickets/{}/dt/?ticket={}'
                                   .format(self.tree_data.id, self.ticket.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data), 2)
        self.assertEqual(data['dtd'].keys(), TreeDataDetailSerializer(self.tree_data).data.keys())
        self.assertEqual(data['ticket'].keys(), TicketSerializer(self.ticket).data.keys())
