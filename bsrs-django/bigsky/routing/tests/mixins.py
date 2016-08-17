import uuid

from location.tests.factory import create_top_level_location
from person.tests.factory import create_single_person, PASSWORD
from routing.serializers import AssignmentCreateUpdateSerializer
from routing.tests.factory import (create_assignment, create_available_filter_location,
    create_available_filter_priority)
from ticket.tests.factory import create_ticket


class ViewTestSetupMixin(object):

    def setUp(self):
        self.person = create_single_person()
        self.tenant = self.person.role.tenant
        self.assignment = create_assignment()
        self.assignment.assignee = self.person
        self.assignment.save()

        self.priority_filter = self.assignment.filters.filter(source__field='priority')[0]
        self.category_filter = self.assignment.filters.filter(source__field='categories')[0]

        self.source = create_available_filter_location()

        self.ticket = create_ticket()
        self.ticket_priority = self.ticket.priority
        self.location = create_top_level_location()
        self.data = AssignmentCreateUpdateSerializer(self.assignment).data
        self.data.pop('order', None)
        self.data.pop('tenant', None)
        # assignment.filter payloads - b/c a combo of the PF & AF
        self.priority_af = create_available_filter_priority()
        self.data['filters'] = [{
            'id': str(uuid.uuid4()),
            'source': str(self.priority_af.id),
            'criteria': [str(self.ticket_priority.id)]
        }]

        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()
