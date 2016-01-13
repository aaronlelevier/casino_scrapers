from django.core.management.base import BaseCommand

from ticket.tests.factory import (create_ticket_statuses, create_ticket_priorities,
    create_tickets,)


class Command(BaseCommand):
    help = 'create test tickets'

    def handle(self, *args, **options):
        create_ticket_statuses()
        create_ticket_priorities()
        create_tickets(51)
