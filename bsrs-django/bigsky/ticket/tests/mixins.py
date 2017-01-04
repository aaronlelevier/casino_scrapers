from unittest.mock import MagicMock

from model_mommy import mommy

from category.models import Category, CategoryStatus
from category.tests.factory import create_categories
from location.models import LocationStatus, LocationType
from location.tests.factory import create_location
from person.tests.factory import PASSWORD, DistrictManager
from ticket.models import Ticket
from ticket.permissions import TicketActivityPermissions
from ticket.tests.factory_related import (create_ticket_priorities, create_ticket_statuses)
from ticket.tests.factory import create_ticket
from utils.tests.test_helpers import create_default
from utils.tests.mixins import MockPermissionsAllowAnyMixin



class MockTicketActivityPermissionsMixin(object):
    """
    Mixin to allow for ignoring permissions in TicketActivity view tests.
    """
    def setUp(self):
        self.has_permission = TicketActivityPermissions.has_permission
        TicketActivityPermissions.has_permission = MagicMock(return_value=True)

    def tearDown(self):
        TicketActivityPermissions.has_permission = self.has_permission


class TicketSetupNoLoginMixin(MockPermissionsAllowAnyMixin):

    def setUp(self):
        super(TicketSetupNoLoginMixin, self).setUp()
        # Categories
        self.categories = create_categories()
        self.category = Category.objects.first()
        self.category_two = Category.objects.last()
        self.category_ids = [str(x) for x in Category.objects.values_list('id', flat=True)]
        self.category_names = [str(x) for x in Category.objects.values_list('name', flat=True)]

        self.dm = DistrictManager()
        self.person = self.dm.person

        create_ticket_statuses()
        create_ticket_priorities()
        self.ticket = create_ticket(assignee=self.person)
        self.location = create_location()
        self.ticket.location = self.location
        self.ticket.save()
        self.ticket_two = create_ticket()


class TicketSetupMixin(TicketSetupNoLoginMixin):

    def setUp(self):
        super(TicketSetupMixin, self).setUp()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        super(TicketSetupMixin, self).tearDown()
        self.client.logout()


class TicketCategoryOrderingSetupMixin(object):

    def setUp(self):
        """
        1. Loss Prevention - Locks - Drawer Lock
        2. Loss Prevention - Sensors - Front Door
        3. Repair - Electrical - Outlets
        4. Repair - Electrical - Switches
        5. Repair - Plumbing - Leak
        6. Repair - Plumbing - Toilet
        """
        # default statuses
        create_default(CategoryStatus)
        create_default(LocationStatus)
        create_default(LocationType)
        # 1: Loss Prevention - Locks - Drawer Lock
        loss_prevention = mommy.make(Category, name="Loss Prevention", subcategory_label="trade")
        locks = mommy.make(Category, name="Locks", parent=loss_prevention, subcategory_label="issue")
        drawer_locks = mommy.make(Category, name="Drawer Lock", parent=locks)

        # 2: Loss Prevention - Sensors - Front Door
        sensors = mommy.make(Category, name="Sensors", parent=loss_prevention, subcategory_label='issue')
        front_door = mommy.make(Category, name="Front Door", parent=sensors)

        # 3: Repair - Electrical - Outlets
        repair = mommy.make(Category, name="Repair", subcategory_label="trade")
        electrical = mommy.make(Category, name="Electrical", parent=repair, subcategory_label="issue")
        outlets = mommy.make(Category, name="Outlets", parent=electrical)

        # 4: Repair - Electrical - Switches
        switches = mommy.make(Category, name="Switches", parent=electrical)

        # 5: Repair - Plumbing - Leak
        plumbing = mommy.make(Category, name="Plumbing", parent=repair, subcategory_label="issue")
        leak = mommy.make(Category, name="Leak", parent=plumbing)

        # 6: Repair - Plumbing - Toilet
        toilet = mommy.make(Category, name="Toilet", parent=plumbing)

        # Tickets
        self.one = mommy.make(Ticket, request="one")
        self.two = mommy.make(Ticket, request="two")
        self.three = mommy.make(Ticket, request="three")
        self.four = mommy.make(Ticket, request="four")
        self.five = mommy.make(Ticket, request="five")
        self.six = mommy.make(Ticket, request="six")

        # Join Categories to Tickets
        self.one.categories.add(loss_prevention)
        self.one.categories.add(locks)
        self.one.categories.add(drawer_locks)

        self.two.categories.add(loss_prevention)
        self.two.categories.add(sensors)
        self.two.categories.add(front_door)

        self.three.categories.add(repair)
        self.three.categories.add(electrical)
        self.three.categories.add(outlets)

        self.four.categories.add(repair)
        self.four.categories.add(electrical)
        self.four.categories.add(switches)

        self.five.categories.add(repair)
        self.five.categories.add(plumbing)
        self.five.categories.add(leak)

        self.six.categories.add(repair)
        self.six.categories.add(plumbing)
        self.six.categories.add(toilet)
