from django.core.management.base import BaseCommand

from automation.tests.factory import create_automations, create_profile_filters
from ticket.tests.factory_related import (create_ticket_statuses, create_ticket_priorities)
from ticket.tests.factory import (create_ticket_activity_types, create_tickets)


class Command(BaseCommand):
    help = 'create test tickets'

    def handle(self, *args, **options):
        create_ticket_statuses()
        create_ticket_priorities()
        create_ticket_activity_types()
        create_tickets(100)

        # automation profiles
        create_profile_filters()
        create_automations()
