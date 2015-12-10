from django.core.management.base import BaseCommand

from ticket.tests.factory import create_tickets


class Command(BaseCommand):
    help = 'create test tickets'

    def handle(self, *args, **options):
        create_tickets(_many=51)
