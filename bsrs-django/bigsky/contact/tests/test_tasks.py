from mock import patch

from django.test import TestCase

from automation.models import AutomationEvent
from automation.tests.factory import (
    create_automation_action_send_email, create_automation_action_send_sms)
from contact import tasks
from ticket.tests.factory import create_ticket


class TaskTests(TestCase):

    @patch("contact.tasks.Email.objects.process_send_email")
    def test_process_send_email(self, mock_func):
        ticket = create_ticket()
        action = create_automation_action_send_email()
        event = AutomationEvent.STATUS_NEW

        tasks.process_send_email(ticket.id, action.id, event)

        self.assertEqual(mock_func.call_args[0][0], ticket)
        self.assertEqual(mock_func.call_args[0][1], action)
        self.assertEqual(mock_func.call_args[0][2], event)

    @patch("contact.tasks.PhoneNumber.objects.process_send_sms")
    def test_process_send_sms(self, mock_func):
        ticket = create_ticket()
        action = create_automation_action_send_sms()
        event = AutomationEvent.STATUS_NEW

        tasks.process_send_sms(ticket.id, action.id, event)

        self.assertEqual(mock_func.call_args[0][0], ticket)
        self.assertEqual(mock_func.call_args[0][1], action)
        self.assertEqual(mock_func.call_args[0][2], event)
