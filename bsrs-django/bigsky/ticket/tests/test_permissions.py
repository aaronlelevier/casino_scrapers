from django.contrib.auth.models import Permission

from model_mommy import mommy
from rest_framework.test import APITestCase

from person.tests.factory import PASSWORD, create_single_person
from ticket.models import Ticket
from ticket.tests.factory import create_ticket_activity_type, create_ticket_activity
from utils.permissions import CrudPermissions, PermissionInfo


class CrudPermissionsTests(APITestCase):

    def setUp(self):
        super(CrudPermissionsTests, self).setUp()

        self.person = create_single_person()
        PermissionInfo().setUp()

        self.ticket = mommy.make(Ticket)
        activity_type = create_ticket_activity_type("comment")
        activity = create_ticket_activity(ticket=self.ticket, type=activity_type,
            content={'comment': 'with comment'}, automation=True)

        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_can_view(self):
        perm = Permission.objects.get(codename='view_ticket')
        self.person.role.group.permissions.add(perm)
        self.assertIn('view_ticket', self.person.permissions)

        response = self.client.get('/api/tickets/{}/activity/?person__isnull=True'
                                   .format(self.ticket.id))

        self.assertNotEqual(response.status_code, 404)

    def test_cant_view(self):
        self.assertNotIn('view_ticket', self.person.permissions)

        response = self.client.get('/api/tickets/{}/activity/?person__isnull=True'
                                   .format(self.ticket.id))

        self.assertEqual(response.status_code, 404)
