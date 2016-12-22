import json
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from dtd.models import TreeData, DTD_START_ID
from dtd.serializers import TreeDataDetailSerializer, TreeDataCreateUpdateSerializer
from dtd.tests.factory import create_tree_data
from dtd.tests.mixins import TreeDataTestSetUpMixin
from ticket.models import Ticket
from ticket.serializers import TicketCreateUpdateSerializer, TicketSerializer
from ticket.tests.factory import create_ticket


class DTTicketViewSetTests(TreeDataTestSetUpMixin, APITestCase):

    def setUp(self):
        super(DTTicketViewSetTests, self).setUp()
        # serializer data
        self.ticket = create_ticket(assignee=self.person)
        serializer = TicketCreateUpdateSerializer(self.ticket)
        self.data = serializer.data
        link = self.tree_data.links.first()
        link.destination = mommy.make(TreeData)
        link.save()
        self.destination = TreeData.objects.get(pk=str(link.destination.id))

    def test_get_start_page(self):
        """
        Response is the DTD start point, which is configured as a General Setting.
        """
        create_tree_data(id=DTD_START_ID)
        start = TreeData.objects.get_start()

        response = self.client.get('/api/dt/dt-start/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(start.id))
        self.assertEqual(data['key'], start.key)

    def test_post__ticket_created_and_dtd_response_returned(self):
        """
        Response is the DTD based on the links destination id
        """
        self.data.update({
            'id': str(uuid.uuid4()),
            'request': 'plumbing'
        })
        response = self.client.post('/api/dt/{}/ticket/'.format(self.destination.id), self.data, format='json')
        self.assertEqual(response.status_code, 201)
        # Ticket
        self.assertTrue(Ticket.objects.get(id=self.data['id']))
        # DTD
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.destination.id))
        self.assertEqual(data['key'], self.destination.key)
        self.assertEqual(data.keys(), TreeDataCreateUpdateSerializer(self.destination).data.keys())

    def test_patch__ticket_updated_and_dtd_response_returned(self):
        """
        Patch is patching to Start DTD.  Although this never happens in the real app, since the start dtd is just a normal dtd
        then it shouldnt make a difference
        """
        self.data.update({
            'request': 'plumbing'
        })
        self.assertNotEqual(self.data['request'], self.ticket.request)

        response = self.client.patch('/api/dt/{}/ticket/'.format(self.destination.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)
        # Ticket
        ticket = Ticket.objects.get(id=self.data['id'])
        self.assertEqual(ticket.request, self.data['request'])
        # DTD
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.destination.id))
        self.assertEqual(data.keys(), TreeDataDetailSerializer(self.destination).data.keys())

    def test_patch__ticket_submit_and_ticket_response_returned(self):
        """
        Submit will use custom list patch route defined in the view and will return ticket that was updated
        Backend logic for determining if status or priority are different will be added in the future
        """
        self.data.update({
            'request': 'plumbing'
        })
        self.assertNotEqual(self.data['request'], self.ticket.request)
        response = self.client.patch('/api/dt/submit/'.format(self.destination.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)
        # Ticket
        ticket = Ticket.objects.get(id=self.data['id'])
        self.assertEqual(ticket.request, self.data['request'])
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(ticket.id))
        # TODO: settings will result in ticket status possibly changing for example

    def test_patch__404_if_dtd_not_found(self):
        id = uuid.uuid4()

        response = self.client.patch('/api/dt/{}/ticket/'.format(id),
            self.data, format='json')

        self.assertEqual(response.status_code, 404)

    def test_patch__404_if_ticket_not_found(self):
        self.data['id'] = uuid.uuid4()

        response = self.client.patch('/api/dt/{}/ticket/'.format(self.destination.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 404)

    def test_patch__cannot_set_required_field_to_none(self):
        self.data['location'] =  None
        self.assertTrue(self.ticket.location)

        response = self.client.patch('/api/dt/{}/ticket/'.format(self.destination.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 400)
        message = json.loads(response.content.decode('utf8'))
        self.assertEqual(message, {'location': ['This field may not be null.']})

    def test_patch__missing_required_field(self):
        self.data.pop('location',  None)
        self.assertTrue(self.ticket.location)

        response = self.client.patch('/api/dt/{}/ticket/'.format(self.destination.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 200)
        ticket = Ticket.objects.get(id=self.ticket.id)
        self.assertEqual(self.ticket.location, ticket.location)

    def test_put(self):
        response = self.client.put('/api/dt/{}/ticket/'.format(self.destination.id), {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_delete(self):
        response = self.client.delete('/api/dt/{}/ticket/'.format(self.destination.id), {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_get__ticket_returned_if_query_param(self):
        response = self.client.get('/api/dt/{}/ticket/?ticket={}'
                                   .format(self.destination.id, self.ticket.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data), 2)
        self.assertEqual(data['dtd'].keys(), TreeDataDetailSerializer(self.destination).data.keys())
        self.assertEqual(data['ticket'].keys(), TicketSerializer(self.ticket).data.keys())
