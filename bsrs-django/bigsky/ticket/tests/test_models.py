from django.conf import settings
from django.db.models import Q, Max
from django.test import TestCase

from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_categories
from generic.tests.factory import create_file_attachment
from location.models import Location
from location.tests.factory import create_location
from person.tests.factory import create_single_person
from ticket.models import (Ticket, TicketStatus, TicketPriority, TicketActivityType,
    TicketActivity, TICKET_STATUS_DEFAULT, TICKET_PRIORITY_DEFAULT)
from ticket.tests.factory import (create_ticket, create_tickets,
    create_ticket_status, create_ticket_statuses, create_ticket_priorities)
from ticket.tests.mixins import TicketCategoryOrderingSetupMixin


class TicketStatusTests(TestCase):

    def setUp(self):
        create_ticket_statuses()

    def test_to_dict__default(self):
        status = TicketStatus.objects.get(name=TICKET_STATUS_DEFAULT)

        ret = status.to_dict()

        self.assertEqual(len(ret), 3)
        self.assertEqual(ret['id'], str(status.id))
        self.assertEqual(ret['name'], status.name)
        self.assertTrue(ret['default'])

    def test_to_dict__non_default(self):
        status = TicketStatus.objects.exclude(name=TICKET_STATUS_DEFAULT).first()

        ret = status.to_dict()

        self.assertEqual(len(ret), 3)
        self.assertEqual(ret['id'], str(status.id))
        self.assertEqual(ret['name'], status.name)
        self.assertFalse(ret['default'])


class TicketPriorityTests(TestCase):

    def setUp(self):
        create_ticket_priorities()

    def test_to_dict__default(self):
        priority = TicketPriority.objects.get(name=TICKET_PRIORITY_DEFAULT)

        ret = priority.to_dict()

        self.assertEqual(len(ret), 3)
        self.assertEqual(ret['id'], str(priority.id))
        self.assertEqual(ret['name'], priority.name)
        self.assertTrue(ret['default'])

    def test_to_dict__non_default(self):
        priority = TicketPriority.objects.exclude(name=TICKET_PRIORITY_DEFAULT).first()

        ret = priority.to_dict()

        self.assertEqual(len(ret), 3)
        self.assertEqual(ret['id'], str(priority.id))
        self.assertEqual(ret['name'], priority.name)
        self.assertFalse(ret['default'])


class TicketManagerTests(TestCase):

    def setUp(self):
        create_categories()
        self.status_draft = create_ticket_status('ticket.status.draft')
        self.person = create_single_person()
        self.person_category = self.person.role.categories.first()
        self.person_location = self.person.locations.first()
        # ticket_one - location match; category match
        self.ticket_one = create_ticket()
        self.ticket_one.categories.add(self.person_category)
        self.ticket_one.location = self.person_location
        self.ticket_one.save()
        # ticket_two - location no match; category match
        self.ticket_two = create_ticket()
        self.ticket_two.categories.add(self.person_category)
        other_location = create_location()
        self.ticket_two.location = other_location
        self.ticket_two.save()
        # ticket_three - location match; category no match
        self.ticket_three = create_ticket()
        self.ticket_three.location = self.person_location
        self.ticket_three.save()
        for c in self.person.role.categories.all():
            self.ticket_three.categories.remove(c)
        other_category = Category.objects.exclude(id=self.person_category.id).first()
        self.ticket_three.categories.add(other_category)
        # ticket_four - location match; category no match (is NULL),
        # but is a 'draft' status
        self.ticket_four = create_ticket()
        self.ticket_four.location = self.person_location
        self.ticket_four.status = self.status_draft
        self.ticket_four.save()
        for c in self.person.role.categories.all():
            self.ticket_four.categories.remove(c)
        # only 1 ticket should be status 'draft'
        self.status_new = create_ticket_status('ticket.status.new')
        for t in Ticket.objects.exclude(id=self.ticket_four.id):
            t.status = self.status_new
            t.save()

    def test_ticket_setup(self):
        self.assertEqual(self.person.role.categories.count(), 1)
        self.assertEqual(self.person.locations.count(), 1)
        self.assertEqual(Ticket.objects.count(), 4)
        self.assertEqual(Ticket.objects.filter(location=self.person.locations.first()).count(), 3)
        self.assertEqual(Ticket.objects.filter(categories=self.person.role.categories.all()).count(), 2)
        self.assertEqual(Ticket.objects.filter(status=self.status_new).count(), 3)
        self.assertEqual(Ticket.objects.filter(status=self.status_draft).count(), 1)
        # ticket_one
        self.assertIn(self.ticket_one.location, self.person.locations.all())
        self.assertIn(self.person.role.categories.first(), self.ticket_one.categories.all())
        # ticket_two
        self.assertNotIn(self.ticket_two.location, self.person.locations.all())
        self.assertIn(self.person.role.categories.first(), self.ticket_two.categories.all())
        # ticket_three
        self.assertIn(self.ticket_three.location, self.person.locations.all())
        self.assertNotIn(self.person.role.categories.first(), self.ticket_three.categories.all())

    def test_deleted(self):
        init_count = Ticket.objects_all.count()
        ticket = Ticket.objects.first()

        ticket.delete()

        self.assertEqual(Ticket.objects.count(), init_count-1)
        self.assertEqual(Ticket.objects_all.count(), init_count)

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

    def test_next_number(self):
        number = 100
        self.ticket_one.number = number
        self.ticket_one.save()
        raw_max = Ticket.objects.all().aggregate(Max('number'))['number__max']

        next_number = Ticket.objects.next_number()

        self.assertEqual(raw_max+1, next_number)

    def test_next_number__if_no_tickets(self):
        for t in Ticket.objects_all.all():
            t.delete(override=True)
        self.assertEqual(Ticket.objects_all.count(), 0)

        ret = Ticket.objects.next_number()

        self.assertEqual(ret, 1)

    # filter_on_categories_and_location

    def test_filter_on_categories_and_location(self):
        q = Q()
        if not self.person.has_top_level_location:
            q &= Q(location__id__in=self.person.locations.values_list('id', flat=True))
        if self.person.role.categories.first():
            q &= Q(
                    Q(categories__id__in=self.person.role.categories.filter(parent__isnull=True).values_list('id', flat=True)) | \
                    Q(categories__isnull=True)
                )
        raw_qs = Ticket.objects.filter(q).distinct().values_list('id', flat=True)

        ret = Ticket.objects.filter_on_categories_and_location(self.person).values_list('id', flat=True)

        self.assertEqual(sorted(ret), sorted(raw_qs))

    def test_filter_on_categories_and_location__default_filtering(self):
        """
        Only 2 Ticket is viewable based on Category and Location.
        1 that meets the Criteria, and 1 that is draft.
        For the other 2, they only meet 1 of the criteria, but not both.
        """
        ret = Ticket.objects.filter_on_categories_and_location(self.person)

        self.assertEqual(ret.count(), 2)
        self.assertEqual(ret.filter(status=self.status_draft).count(), 1)

    def test_filter_on_categories_and_location__person_has_top_level_location(self):
        """
        Only filter on Category, b/c `person.has_top_level_location == True`
        """
        top_location = Location.objects.create_top_level()
        for x in self.person.locations.all():
            self.person.locations.remove(x)
        self.person.locations.add(top_location)
        self.assertTrue(self.person.has_top_level_location)

        ret = Ticket.objects.filter_on_categories_and_location(self.person)

        self.assertEqual(ret.count(), 3)

    def test_filter_on_categories_and_location__no_role_categories(self):
        """
        Only filter on Location, b/c `person.role.categories == []`
        """
        for c in self.person.role.categories.all():
            self.person.role.categories.remove(c)
        self.assertFalse(self.person.role.categories.first())

        ret = Ticket.objects.filter_on_categories_and_location(self.person)

        self.assertEqual(ret.count(), 3)

    def test_filter_on_categories_and_location__top_location_and_no_role_categories(self):
        """
        `person.has_top_level_location == True` and 
        `person.role.categories == []`
        """
        # remove categories
        for c in self.person.role.categories.all():
            self.person.role.categories.remove(c)
        self.assertEqual(self.person.role.categories.count(), 0)
        # location - 'person' only has top level location
        top_location = Location.objects.create_top_level()
        for x in self.person.locations.all():
            self.person.locations.remove(x)
        self.person.locations.add(top_location)
        self.assertTrue(self.person.has_top_level_location)

        ret = Ticket.objects.filter_on_categories_and_location(self.person)

        self.assertEqual(ret.count(), 4)


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
