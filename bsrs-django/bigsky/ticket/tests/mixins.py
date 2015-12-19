from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_categories
from location.tests.factory import create_location
from person.tests.factory import (create_single_person, create_role, PASSWORD,
    DistrictManager)
from ticket.models import Ticket
from ticket.tests.factory import create_ticket, create_ticket_statuses, create_ticket_priorites


class TicketSetupMixin(object):

    def setUp(self):
        # Categories
        self.categories = create_categories()
        self.category = Category.objects.first()
        self.category_two = Category.objects.last()
        self.category_ids = [str(x) for x in Category.objects.values_list('id', flat=True)]
        self.category_names = [str(x) for x in Category.objects.values_list('name', flat=True)]

        self.dm = DistrictManager()
        self.person = self.dm.person

        create_ticket_statuses()
        create_ticket_priorites()
        self.ticket = create_ticket(requester=self.person)
        self.ticket_two = create_ticket()

        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
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
        # 1: Loss Prevention - Locks - Drawer Lock
        loss_prevention = Category.objects.create(name="Loss Prevention", subcategory_label="trade")
        locks = Category.objects.create(name="Locks", parent=loss_prevention, subcategory_label="issue")
        drawer_locks = Category.objects.create(name="Drawer Lock", parent=locks)

        # 2: Loss Prevention - Sensors - Front Door
        sensors = Category.objects.create(name="Sensors", parent=loss_prevention, subcategory_label='issue')
        front_door = Category.objects.create(name="Front Door", parent=sensors)

        # 3: Repair - Electrical - Outlets
        repair = Category.objects.create(name="Repair", subcategory_label="trade")
        electrical = Category.objects.create(name="Electrical", parent=repair, subcategory_label="issue")
        outlets = Category.objects.create(name="Outlets", parent=electrical)

        # 4: Repair - Electrical - Switches
        switches = Category.objects.create(name="Switches", parent=electrical)

        # 5: Repair - Plumbing - Leak
        plumbing = Category.objects.create(name="Plumbing", parent=repair, subcategory_label="issue")
        leak = Category.objects.create(name="Leak", parent=plumbing)

        # 6: Repair - Plumbing - Toilet
        toilet = Category.objects.create(name="Toilet", parent=plumbing)

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
