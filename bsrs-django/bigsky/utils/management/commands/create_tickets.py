from django.core.management.base import BaseCommand

from person.models import Person
from ticket.tests.factory import (create_ticket_statuses, create_ticket_priorites,
    create_tickets_with_single_category,)


class Command(BaseCommand):
    help = 'create test tickets'

    def handle(self, *args, **options):
        person = Person.objects.get(username='aaron')
        create_ticket_statuses()
        create_ticket_priorites()
        create_tickets_with_single_category(assignee=person, _many=51)
