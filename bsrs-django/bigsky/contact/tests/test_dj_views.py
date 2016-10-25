from django.conf import settings
from django.core.urlresolvers import reverse
from django.test import TestCase

from contact.templatetags import contact_tags
from ticket.models import TicketActivityType
from ticket.tests.factory import TicketWithActivities


class SetupMixin(object):

    def setUp(self):
        self.twa = TicketWithActivities()
        self.twa.create()
        self.ticket = self.twa.ticket

class DjViewsTest(SetupMixin, TestCase):

    def test_ticket_activities(self):
        with self.settings(DEBUG=True):
            response = self.client.get('/email/ticket-activities/{}/'.format(self.ticket.id))
            if response.status_code == 200:
                self.assertEqual(response.context['ticket'], self.ticket)


class TemplateTagsTests(SetupMixin, TestCase):

    def test_ticket_activity_description__create(self):
        activity = self.ticket.activities.get(type__name=TicketActivityType.CREATE)

        ret = contact_tags.ticket_activity_description(activity)

        self.assertEqual(ret, 'ticket.activity_type.create')

    def test_ticket_activity_description__assignee(self):
        activity = self.ticket.activities.get(type__name=TicketActivityType.ASSIGNEE)

        ret = contact_tags.ticket_activity_description(activity)

        self.assertEqual(
            ret,
            'ticket.activity_type.assignee' + ' from: {} to {}'.format(
                self.twa.person.fullname, self.twa.person_two.fullname)
        )

    def test_ticket_activity_description__cc_add(self):
        activity = self.ticket.activities.get(type__name=TicketActivityType.CC_ADD)

        ret = contact_tags.ticket_activity_description(activity)

        self.assertEqual(
            ret,
            'ticket.activity_type.cc_add' +
            ' {}'.format(self.twa.person_two.fullname)
        )

    def test_ticket_activity_description__cc_remove(self):
        activity = self.ticket.activities.get(type__name=TicketActivityType.CC_REMOVE)

        ret = contact_tags.ticket_activity_description(activity)

        self.assertEqual(
            ret,
            'ticket.activity_type.cc_remove' +
            ' {}'.format(self.twa.person.fullname)
        )

    def test_ticket_activity_description__status(self):
        activity = self.ticket.activities.get(type__name=TicketActivityType.STATUS)

        ret = contact_tags.ticket_activity_description(activity)

        self.assertEqual(
            ret,
            'ticket.activity_type.status' + ' from: {} to {}'.format(
                self.twa.status.name, self.twa.status_two.name)
        )

    def test_ticket_activity_description__priority(self):
        activity = self.ticket.activities.get(type__name=TicketActivityType.PRIORITY)

        ret = contact_tags.ticket_activity_description(activity)

        self.assertEqual(
            ret,
            'ticket.activity_type.priority' + ' from: {} to {}'.format(
                self.twa.priority.name, self.twa.priority_two.name)
        )

    def test_ticket_activity_description__categories(self):
        activity = self.ticket.activities.get(type__name=TicketActivityType.CATEGORIES)

        ret = contact_tags.ticket_activity_description(activity)

        self.assertEqual(
            ret,
            'ticket.activity_type.categories' + ' from: {} to {}'.format(
                self.twa.category.name, self.twa.category_two.name)
        )

    def test_ticket_activity_description__comment(self):
        activity = self.ticket.activities.get(type__name=TicketActivityType.COMMENT)

        ret = contact_tags.ticket_activity_description(activity)

        self.assertEqual(ret, 'ticket.activity_type.comment' + ' ' + activity.content.get('comment', ''))

    def test_ticket_activity_description__attachment_add(self):
        activity = self.ticket.activities.get(type__name=TicketActivityType.ATTACHMENT_ADD)

        ret = contact_tags.ticket_activity_description(activity)

        self.assertEqual(
            ret,
            'ticket.activity_type.attachment_add' +
            ' {}'.format(', '.join([self.twa.attachment.filename]))
        )
