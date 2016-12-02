from mock import patch

from django.test import TestCase

from automation import tasks
from automation.tests.factory import create_automation_event
from person.tests.factory import create_single_person
from ticket.tests.factory import create_ticket


class TaskTests(TestCase):

    @patch("automation.tasks._process_ticket")
    def test_process_ticket(self, mock_func):
        person = create_single_person()
        ticket = create_ticket()
        event = create_automation_event()
        # params
        tenant_id = person.role.tenant.id
        ticket_id = ticket.id
        event_key = event.key

        tasks.process_ticket(tenant_id, ticket_id, event_key)

        self.assertEqual(mock_func.call_args[0][0], tenant_id)
        self.assertEqual(mock_func.call_args[0][1], ticket)
        self.assertEqual(mock_func.call_args[0][2], event)
