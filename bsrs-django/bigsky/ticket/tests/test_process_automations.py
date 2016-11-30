import json
from mock import patch
import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from automation.models import AutomationAction, AutomationActionType
from automation.tests.factory import (create_automation, create_automation_action_type,
    create_automation_action_assignee, create_ticket_categories_filter)
from person.tests.factory import create_single_person
from ticket.models import Ticket, TicketStatus, TicketActivityType
from ticket.serializers import TicketCreateSerializer
from ticket.tests.factory import (
    create_ticket_activity_type, create_ticket_activity_types,)
from ticket.tests.mixins import TicketSetupMixin
from utils.helpers import create_default, clear_related


class TicketStatusNewTests(TicketSetupMixin, APITestCase):

    def setUp(self):
        super(TicketStatusNewTests, self).setUp()
        # serializer data
        serializer = TicketCreateSerializer(self.ticket)
        self.data = serializer.data
        self.data.update({
            'id': str(uuid.uuid4()),
            'status': create_default(TicketStatus).id
        })

    def test_status_new__cc_gets_added(self):
        with self.settings(CELERY_ALWAYS_EAGER=True):
            # automation
            automation = create_automation('a')
            clear_related(automation, 'actions')
            clear_related(automation, 'filters')
            activity_type = create_ticket_activity_type(TicketActivityType.CC_ADD)
            cc_action_type = create_automation_action_type(AutomationActionType.TICKET_CC)
            person = create_single_person('foo')
            person_two = create_single_person('bar')
            action = mommy.make(AutomationAction, automation=automation,
                                type=cc_action_type, content={'ccs': [str(person.id), str(person_two.id)]})
            self.assertEqual(automation.actions.count(), 1)
            self.assertEqual(automation.actions.first(), action)
            # ticket
            self.data.pop('cc', None)

            response = self.client.post('/api/tickets/', self.data, format='json')

            self.assertEqual(response.status_code, 201)
            data = json.loads(response.content.decode('utf8'))
            ticket = Ticket.objects.get(id=data['id'])
            self.assertTrue(automation.is_match(ticket))
            self.assertEqual(ticket.cc.count(), 2)
            self.assertIn(person, ticket.cc.all())
            self.assertIn(person_two, ticket.cc.all())

    @patch("ticket.models.tasks.process_ticket.delay")
    def test_category_filter__set_assignee(self, mock_func):
        with self.settings(CELERY_ALWAYS_EAGER=True):
            # automation
            automation = create_automation('a')
            clear_related(automation, 'filters')
            clear_related(automation, 'actions')
            category_filter = create_ticket_categories_filter(automation)
            automation_action = create_automation_action_assignee(automation)
            self.assertEqual(automation.filters.count(), 1)
            self.assertEqual(automation.filters.first(), category_filter)
            self.assertEqual(automation.actions.count(), 1)
            self.assertEqual(automation.actions.first(), automation_action)
            # ticket
            create_ticket_activity_types()
            self.data.pop('cc', None)
            self.data.update({
                'categories': category_filter.criteria,
                'assignee': None
            })

            response = self.client.post('/api/tickets/', self.data, format='json')

            self.assertEqual(response.status_code, 201)
            data = json.loads(response.content.decode('utf8'))
            ticket = Ticket.objects.get(id=data['id'])
            self.assertTrue(automation.is_match(ticket))
            self.assertEqual(
                str(ticket.categories.values_list('id', flat=True)[0]),
                category_filter.criteria[0]
            )
            self.assertTrue(mock_func.called)
