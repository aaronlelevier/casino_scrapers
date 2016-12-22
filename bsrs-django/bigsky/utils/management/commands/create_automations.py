from django.core.management.base import BaseCommand

from automation.tests import factory


class Command(BaseCommand):
    help = 'create test tickets'

    def handle(self, *args, **options):
        factory.create_automation_events()
        factory.create_automation_action_types()
        factory.create_automation_filters()
        factory.create_automations()
        factory.create_automation_actions()
        factory.upate_automation_names_for_fixtures()
