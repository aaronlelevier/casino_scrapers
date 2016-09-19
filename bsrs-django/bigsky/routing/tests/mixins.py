import uuid

from location.tests.factory import create_top_level_location
from person.tests.factory import create_single_person, PASSWORD
from routing.serializers import AutomationCreateUpdateSerializer
from routing.tests.factory import (create_automation, create_available_filter_location,
    create_available_filter_priority)
from ticket.tests.factory import create_ticket


class ViewTestSetupMixin(object):

    def setUp(self):
        self.person = create_single_person()
        self.tenant = self.person.role.tenant
        self.automation = create_automation()
        self.automation.assignee = self.person
        self.automation.save()

        self.priority_filter = self.automation.filters.filter(source__field='priority')[0]
        self.category_filter = self.automation.filters.filter(source__field='categories')[0]

        self.source = create_available_filter_location()

        self.ticket = create_ticket()
        self.ticket_priority = self.ticket.priority
        self.location = create_top_level_location()
        self.data = AutomationCreateUpdateSerializer(self.automation).data
        self.data.pop('order', None)
        self.data.pop('tenant', None)
        # automation.filter payloads - b/c a combo of the PF & AF
        self.priority_af = create_available_filter_priority()
        self.data['filters'] = [{
            'id': str(uuid.uuid4()),
            'source': str(self.priority_af.id),
            'criteria': [str(self.ticket_priority.id)]
        }]

        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()
