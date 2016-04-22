from django.conf import settings
from django.db.models import Q
from django.test import TestCase

from model_mommy import mommy

from category.tests.factory import create_categories
from person.tests.factory import create_single_person
from ticket.models import (Ticket, TicketStatus, TicketPriority, TicketActivityType,
    TicketActivity, TICKET_STATUSES, TICKET_PRIORITIES)
from ticket.tests.factory import (create_ticket, create_tickets,
    create_ticket_statuses, create_ticket_priorities)
from ticket.tests.mixins import TicketCategoryOrderingSetupMixin
from generic.tests.factory import create_file_attachment


class TicketStatusTests(TestCase):

    def setUp(self):
        create_ticket_statuses()

    def test_to_dict__default(self):
        status = TicketStatus.objects.get(name=TICKET_STATUSES[0])

        ret = status.to_dict()

        self.assertEqual(len(ret), 3)
        self.assertEqual(ret['id'], str(status.id))
        self.assertEqual(ret['name'], status.name)
        self.assertTrue(ret['default'])

    def test_to_dict__non_default(self):
        status = TicketStatus.objects.get(name=TICKET_STATUSES[1])

        ret = status.to_dict()

        self.assertEqual(len(ret), 3)
        self.assertEqual(ret['id'], str(status.id))
        self.assertEqual(ret['name'], status.name)
        self.assertFalse(ret['default'])


class TicketPriorityTests(TestCase):

    def setUp(self):
        create_ticket_priorities()

    def test_to_dict__default(self):
        priority = TicketPriority.objects.get(name=TICKET_PRIORITIES[0])

        ret = priority.to_dict()

        self.assertEqual(len(ret), 3)
        self.assertEqual(ret['id'], str(priority.id))
        self.assertEqual(ret['name'], priority.name)
        self.assertTrue(ret['default'])

    def test_to_dict__non_default(self):
        priority = TicketPriority.objects.get(name=TICKET_PRIORITIES[1])

        ret = priority.to_dict()

        self.assertEqual(len(ret), 3)
        self.assertEqual(ret['id'], str(priority.id))
        self.assertEqual(ret['name'], priority.name)
        self.assertFalse(ret['default'])


class TicketManagerTests(TestCase):

    def setUp(self):
        create_categories()
        self.person = create_single_person()
        self.ticket = create_ticket(assignee=self.person)
        self.ticket_two = create_ticket()

    def test_deleted(self):
        ticket = Ticket.objects.first()

        ticket.delete()

        self.assertEqual(Ticket.objects.count(), 1)
        self.assertEqual(Ticket.objects_all.count(), 2)

    def test_search_multi(self):
        search = TicketPriority.objects.first().name
        raw_qs_count = Ticket.objects.filter(
                Q(request__icontains=search) | \
                Q(location__name__icontains=search) | \
                Q(assignee__fullname__icontains=search) | \
                Q(priority__name__icontains=search) | \
                Q(status__name__icontains=search) | \
                Q(categories__name__in=[search])
            ).count()

        ret = Ticket.objects.search_multi(keyword=search).count()

        self.assertEqual(ret, raw_qs_count)

    def test_filter_on_categories_and_location(self):
        raw_qs = Ticket.objects.filter(
            Q(categories__id__in=self.person.role.categories.filter(parent__isnull=True).values_list('id', flat=True)) &
            Q(location__id__in=self.person.locations.values_list('id', flat=True))
        ).distinct().values_list('id', flat=True)

        ret = Ticket.objects.filter_on_categories_and_location(self.person).values_list('id', flat=True)

        self.assertEqual(sorted(ret), sorted(raw_qs))


class TicketTests(TestCase):

    def setUp(self):
        create_categories()
        create_single_person()
        create_tickets(_many=2)

    def test_number(self):
        one = Ticket.objects.get(number=1)
        self.assertIsInstance(one, Ticket)

        two = Ticket.objects.get(number=2)
        self.assertIsInstance(two, Ticket)


class TicketActivityTests(TestCase):
    
    def setUp(self):
        create_categories()
        self.person = create_single_person()
        self.person_two = create_single_person()
        self.ticket = create_ticket()
        self.activity = mommy.make(TicketActivity, person=self.person)

    def test_setup(self):
        self.assertIsInstance(self.activity, TicketActivity)

    def test_meta_ordering(self):
        self.activity = mommy.make(TicketActivity, person=self.person)
        self.assertEqual(TicketActivity.objects.count(), 2)

        ret = TicketActivity.objects.all()

        self.assertEqual(
            ret.first(),
            TicketActivity.objects.order_by('-created').first()
        )

    def test_weigh_default(self):
        self.assertEqual(
            self.activity.weight,
            settings.ACTIVITY_DEFAULT_WEIGHT
        )

    def test_weight_category(self):
        type = mommy.make(TicketActivityType)
        self.activity.type = type
        self.activity.save()

        self.assertEqual(
            self.activity.weight,
            type.weight
        )

    def test_log_create(self):
        name = 'create'
        type, _ = TicketActivityType.objects.get_or_create(name=name)
        
        ticket_activity = TicketActivity.objects.create(type=type, ticket=self.ticket,
            person=self.person)

        self.assertIsInstance(ticket_activity, TicketActivity)
        self.assertEqual(ticket_activity.type.name, name)

    def test_log_assignee(self):
        name = 'assignee'
        type, _ = TicketActivityType.objects.get_or_create(name='assignee')
        
        ticket_activity = TicketActivity.objects.create(
            type=type,
            person=self.person,
            ticket=self.ticket,
            content={
                'from': str(self.person.id),
                'to': str(self.person_two.id)
            }
        )

        self.assertIsInstance(ticket_activity, TicketActivity)
        self.assertEqual(ticket_activity.type.name, name)
        self.assertTrue(TicketActivity.objects.filter(content__from=str(self.person.id)).exists())

    def test_log_attachment(self):
        attachment = create_file_attachment(self.ticket)
        type, _ = TicketActivityType.objects.get_or_create(name='attachment_add')
        
        ticket_activity = TicketActivity.objects.create(
            type=type,
            person=self.person,
            ticket=self.ticket,
            content={
                '0': str(attachment.id),
            }
        )

        self.assertIsInstance(ticket_activity, TicketActivity)
        self.assertEqual(ticket_activity.ticket.id, self.ticket.id)
        self.assertEqual(ticket_activity.content['0'], str(attachment.id))

    def test_log_cc_add(self):
        type, _ = TicketActivityType.objects.get_or_create(name='cc_add')
        
        ticket_activity = TicketActivity.objects.create(
            type=type,
            person=self.person,
            ticket=self.ticket,
            content={
                '0': str(self.person.id)
            }
        )

        self.assertIsInstance(ticket_activity, TicketActivity)
        self.assertEqual(ticket_activity.ticket.id, self.ticket.id)
        self.assertEqual(ticket_activity.content['0'], str(self.person.id))


class TicketCategoryOrderingTests(TicketCategoryOrderingSetupMixin, TestCase):

    def test_ticket_one(self):
        ordered_categories = self.one.categories.order_by('level').values_list('name', flat=True)
        
        self.assertEqual(
            " - ".join(ordered_categories),
            "Loss Prevention - Locks - Drawer Lock"
        )

    def test_ticket_and_category_ordering(self):
        manual = (Ticket.objects.all()
                                .prefetch_related('categories')
                                .exclude(categories__isnull=True))

        queryset = Ticket.objects.all_with_ordered_categories()

        for i, obj in enumerate(queryset):
            self.assertEqual(manual[i].id, obj.id)
