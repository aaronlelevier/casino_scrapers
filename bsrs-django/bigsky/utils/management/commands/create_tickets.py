from django.core.management.base import BaseCommand

from routing.tests.factory import create_assignments, create_available_filters
from ticket.tests.factory_related import (create_ticket_statuses, create_ticket_priorities)
from ticket.tests.factory import (create_ticket_activity_types, create_tickets)


class Command(BaseCommand):
    help = 'create test tickets'

    def handle(self, *args, **options):
        create_ticket_statuses()
        create_ticket_priorities()
        create_ticket_activity_types()
        create_tickets(100)

        # assignment profiles
        create_assignments()
        create_available_filters()
