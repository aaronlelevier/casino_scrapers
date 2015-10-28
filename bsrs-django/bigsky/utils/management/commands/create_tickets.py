from django.core.management.base import BaseCommand

from person.models import Person
from ticket.tests.factory import create_tickets


class Command(BaseCommand):
    help = 'create test tickets'

    def handle(self, *args, **options):
        people = Person.objects.all()[:3]
        create_tickets(
            cc=people[0],
            requester=people[1],
            assignee=people[2]
        )