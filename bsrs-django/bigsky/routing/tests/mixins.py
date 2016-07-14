from person.tests.factory import create_single_person, PASSWORD
from routing.serializers import AssignmentCreateUpdateSerializer
from routing.tests.factory import create_assignment
from ticket.tests.factory import create_ticket


class ViewTestSetupMixin(object):

    def setUp(self):
        self.person = create_single_person()
        self.tenant = self.person.role.tenant
        self.assignment = create_assignment()
        self.assignment.assignee = self.person
        self.assignment.save()
        self.profile_filter = self.assignment.filters.first()
        self.ticket = create_ticket()
        self.ticket_priority = self.ticket.priority
        self.data = AssignmentCreateUpdateSerializer(self.assignment).data
        self.data.pop('order', None)
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()
