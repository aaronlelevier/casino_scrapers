import datetime
import json
import uuid

from django.utils.timezone import now

from rest_framework.test import APITestCase

from category.models import Category
from category.tests.factory import create_categories, create_single_category
from location.models import Location
from location.tests.factory import create_location, create_locations
from generic.models import Attachment
from generic.tests.factory import create_file_attachment
from person.tests.factory import PASSWORD, create_single_person, DistrictManager
from ticket.models import Ticket, TicketStatus, TicketActivity, TicketActivityType
from ticket.serializers import TicketCreateSerializer
from ticket.tests.factory import (create_ticket, create_ticket_activity,
    create_ticket_activity_type, create_ticket_activity_types,)
from ticket.tests.factory_related import create_ticket_priority, create_ticket_status
from ticket.tests.mixins import TicketSetupNoLoginMixin, TicketSetupMixin
from utils.helpers import media_path


class TicketListFulltextTests(TicketSetupMixin, APITestCase):

    def setUp(self):
        super(TicketListFulltextTests, self).setUp()

    def test_ticket_filter_related_m2m_with_icontains(self):
        letters = str(uuid.uuid4())
        rando = create_single_category(letters)
        self.ticket_two.categories.add(rando)
        self.ticket_two.save()
        response = self.client.get('/api/tickets/?categories__name__icontains={}'.format(letters))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], str(self.ticket_two.pk))


class TicketListTests(TicketSetupMixin, APITestCase):

    def setUp(self):
        super(TicketListTests, self).setUp()
        self.ticket_two.delete(override=True)

    def test_response(self):
        response = self.client.get('/api/tickets/')
        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/tickets/')

        data = json.loads(response.content.decode('utf8'))
        ticket = data['results'][0]

        self.assertEqual(ticket['id'], str(self.ticket.id))
        self.assertEqual(ticket['status']['id'], str(self.ticket.status.id))
        self.assertEqual(ticket['priority']['id'], str(self.ticket.priority.id))
        self.assertEqual(ticket['requester'], str(self.ticket.requester))
        self.assertEqual(ticket['request'], self.ticket.request)
        self.assertEqual(ticket['number'], self.ticket.number)
        self.assertEqual(
            self.ticket.created.strftime('%m/%d/%Y'),
            datetime.datetime.strptime(str(ticket['created']), '%Y-%m-%dT%H:%M:%S.%fZ').strftime('%m/%d/%Y')
        )

    def test_data_location(self):
        response = self.client.get('/api/tickets/')

        data = json.loads(response.content.decode('utf8'))
        location = data['results'][0]['location']

        self.assertEqual(location['id'], str(self.ticket.location.id))
        self.assertEqual(location['name'], self.ticket.location.name)
        self.assertEqual(location['number'], self.ticket.location.number)

    def test_data_categories(self):
        response = self.client.get('/api/tickets/')

        data = json.loads(response.content.decode('utf8'))
        category = data['results'][0]['categories'][0]

        self.assertIn('id', category)
        self.assertIn('name', category)
        self.assertIn('level', category)

    def test_data_assignee(self):
        response = self.client.get('/api/tickets/')

        data = json.loads(response.content.decode('utf8'))
        assignee = data['results'][0]['assignee']

        self.assertEqual(assignee['id'], str(self.ticket.assignee.id))
        self.assertEqual(assignee['fullname'], self.ticket.assignee.fullname)
        self.assertEqual(assignee['photo']['id'], str(self.person.photo.id))
        self.assertTrue(assignee['photo']['image_thumbnail'])
        self.assertNotIn('image_medium', assignee['photo'])
        self.assertNotIn('image_full', assignee['photo'])
        self.assertNotIn('first_name', assignee)
        self.assertNotIn('last_name', assignee)
        self.assertNotIn('middle_initial', assignee)
        self.assertNotIn('status', assignee)
        self.assertNotIn('role', assignee)

    # Ticket specific "filter" tests

    def test_filter__category_name(self):
        """
        Filter for all 'light fixture' Tickets for example.
        """
        keyword = self.ticket.categories.first().name[:5]

        response = self.client.get('/api/tickets/?categories__name__icontains={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            Ticket.objects.filter(categories__name__icontains=keyword).count()
        )
        self.assertTrue(data['count'] > 0)


class TicketDetailTests(TicketSetupMixin, APITestCase):

    def test_response(self):
        response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))

        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(data['id'], str(self.ticket.id))
        self.assertEqual(data['status_fk'], str(self.ticket.status.id))
        self.assertEqual(data['priority_fk'], str(self.ticket.priority.id))
        self.assertEqual(data['attachments'],
            list(self.ticket.attachments.values_list('id', flat=True)))
        self.assertEqual(data['request'], self.ticket.request)
        self.assertEqual(data['number'], self.ticket.number),
        self.assertEqual(
            self.ticket.created.strftime('%m/%d/%Y'),
            datetime.datetime.strptime(str(data['created']), '%Y-%m-%dT%H:%M:%S.%fZ').strftime('%m/%d/%Y')
        )
        self.assertIn('completion_date', data)
        self.assertIn('creator', data)
        self.assertIn('dt_path', data)

    def test_legacy_ref_number(self):
        self.ticket.legacy_ref_number = '42'
        self.ticket.save()

        response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['legacy_ref_number'], self.ticket.legacy_ref_number)

    def test_location(self):
        response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        location = data['location']

        self.assertEqual(location['id'], str(self.ticket.location.id))
        self.assertEqual(location['name'], self.ticket.location.name)
        self.assertEqual(location['number'], self.ticket.location.number)
        self.assertEqual(location['status_fk'], str(self.ticket.location.status.id))
        self.assertEqual(location['location_level'],
            str(self.ticket.location.location_level.id))

    def test_assignee(self):
        response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        assignee = data['assignee']

        self.assertEqual(assignee['id'], str(self.ticket.assignee.id))
        self.assertEqual(assignee['first_name'], self.ticket.assignee.first_name)
        self.assertEqual(assignee['middle_initial'], self.ticket.assignee.middle_initial)
        self.assertEqual(assignee['last_name'], self.ticket.assignee.last_name)

    def test_data_categories(self):
        response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        category = data['categories'][0]

        self.assertIn('id', category)
        self.assertIn('name', category)
        self.assertIn('level', category)

    def test_cc(self):
        response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        data_cc = data['cc'][0]
        cc = self.ticket.cc.first()

        self.assertEqual(data_cc['id'], str(cc.id))
        self.assertEqual(data_cc['first_name'], cc.first_name)
        self.assertEqual(data_cc['middle_initial'], cc.middle_initial)
        self.assertEqual(data_cc['last_name'], cc.last_name)
        self.assertNotIn('status', data_cc)
        self.assertNotIn('role', data_cc)


class TicketUpdateTests(TicketSetupMixin, APITestCase):

    def setUp(self):
        super(TicketUpdateTests, self).setUp()
        # serializer data
        serializer = TicketCreateSerializer(self.ticket)
        self.data = serializer.data

    def test_no_change(self):
        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_no_change_patch(self):
        self.data = { 'id': self.data['id'], 'location': self.data['location'] }
        response = self.client.patch('/api/tickets/{}/'.format(self.ticket.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_change_name(self):
        self.data['request'] = 'new request name'
        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertNotEqual(self.ticket.request, data['request'])

    # attachments

    def test_attachments_add_multiple(self):
        new_attachment = create_file_attachment()
        new_attachment_two = create_file_attachment()
        self.data['attachments'].append(str(new_attachment.id))
        self.data['attachments'].append(str(new_attachment_two.id))
        self.assertEqual(self.ticket.attachments.count(), 0)

        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        self.assertEqual(self.ticket.attachments.count(), 2)

    def test_attachments_remove_from_ticket(self):
        new_attachment = create_file_attachment(self.ticket)
        self.data['attachments'] = []
        self.assertEqual(self.ticket.attachments.count(), 1)

        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        self.assertEqual(self.ticket.attachments.count(), 0)

    def test_dt_path(self):
        self.data['dt_path'] = [{'foo': 'bar'}]

        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['dt_path'], self.data['dt_path'])


class TicketCreateTests(TicketSetupMixin, APITestCase):

    def setUp(self):
        super(TicketCreateTests, self).setUp()
        # serializer data
        serializer = TicketCreateSerializer(self.ticket)
        self.data = serializer.data

    def test_data(self):
        self.data.pop('cc', None)
        self.data.update({
            'id': str(uuid.uuid4()),
            'request': 'plumbing',
            'dt_path': [{'foo': 'bar'}],
            'completion_date': now()
        })

        response = self.client.post('/api/tickets/', self.data, format='json')

        self.assertEqual(response.status_code, 201)
        data = json.loads(response.content.decode('utf8'))
        ticket = Ticket.objects.get(id=data['id'])
        self.assertEqual(data['id'], str(ticket.id))
        self.assertEqual(data['location'], str(ticket.location.id))
        self.assertEqual(data['status'], str(ticket.status.id))
        self.assertIsInstance(ticket.status, TicketStatus)
        self.assertEqual(data['priority'], str(ticket.priority.id))
        self.assertEqual(data['assignee'], str(ticket.assignee.id))
        self.assertEqual(data['requester'], str(ticket.requester))
        self.assertIn(data['categories'][0],
            [str(id) for id in ticket.categories.values_list('id', flat=True)])
        self.assertEqual(data['attachments'],
            list(ticket.attachments.values_list('id', flat=True)))
        self.assertEqual(data['request'], ticket.request)
        self.assertEqual(data['dt_path'], self.data['dt_path'])
        self.assertTrue(data['completion_date'])
        self.assertEqual(data['creator'], str(self.person.id))

    def test_attachments_field_not_required(self):
        self.data.update({
            'id': str(uuid.uuid4()),
            'request': 'plumbing',
        })
        self.data.pop('attachments', None)
        self.assertNotIn('attachments', self.data)

        response = self.client.post('/api/tickets/', self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)

    def test_ticket_no_cc(self):
        self.data.pop('cc', None)
        self.data.update({
            'id': str(uuid.uuid4()),
            'request': 'plumbing',
        })

        response = self.client.post('/api/tickets/', self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.data['id'], data['id'])
        self.assertEqual(self.data['request'], data['request'])

    def test_status_and_priority_required(self):
        self.data.pop('cc', None)
        self.data.update({
            'id': str(uuid.uuid4()),
            'status': None,
            'priority': None
        })

        response = self.client.post('/api/tickets/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(json.loads(response.content.decode('utf8'))['status'], ['This field may not be null.'])
        self.assertEqual(json.loads(response.content.decode('utf8'))['priority'], ['This field may not be null.'])


class TicketSearchTests(TicketSetupMixin, APITestCase):

    def test_response(self):
        keyword = 'wat'
        response = self.client.get('/api/tickets/?search={}'.format(keyword))
        self.assertEqual(response.status_code, 200)

    def test_search_request(self):
        keyword = self.ticket.request
        count = Ticket.objects.search_multi(keyword=keyword).count()

        response = self.client.get('/api/tickets/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], count)

    def test_search_related_location(self):
        keyword = self.ticket.location.name
        count = Ticket.objects.search_multi(keyword=keyword).count()

        response = self.client.get('/api/tickets/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], count)

    def test_search_related_assignee(self):
        keyword = self.ticket.assignee.fullname
        count = Ticket.objects.search_multi(keyword=keyword).count()

        response = self.client.get('/api/tickets/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], count)

    def test_search_related_priority(self):
        keyword = self.ticket.priority.name
        count = Ticket.objects.search_multi(keyword=keyword).count()

        response = self.client.get('/api/tickets/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], count)

    def test_search_related_status(self):
        keyword = self.ticket.status.name
        count = Ticket.objects.search_multi(keyword=keyword).count()

        response = self.client.get('/api/tickets/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], count)

    def test_search_related_categories(self):
        keyword = self.person.role.categories.first().name[:5]
        count = Ticket.objects.search_multi(keyword=keyword).count()

        response = self.client.get('/api/tickets/?search={}'.format(keyword))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data["count"], count)


class TicketActivityViewSetTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        create_categories()
        self.person = create_single_person()
        # Ticket
        self.ticket = create_ticket()
        self.ticket_two = create_ticket()
        # TicketActivity (Both for the 1st Ticket, Ticket-Two has no Activities !!)
        self.ticket_activity = create_ticket_activity(ticket=self.ticket)
        self.ticket_activity_two = create_ticket_activity(ticket=self.ticket)
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))
        self.assertEqual(response.status_code, 200)

    def test_ticket_details(self):
        activity_type = create_ticket_activity_type("comment")
        create_ticket_activity(ticket=self.ticket, type=activity_type,
            content={'comment': 'with comment'})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['count'])
        activity = TicketActivity.objects.get(id=data['results'][0]['id'])
        self.assertIsInstance(activity, TicketActivity)
        self.assertIsInstance(TicketActivityType.objects.get(name=data['results'][0]['type']), TicketActivityType)
        self.assertEqual(data['results'][0]['ticket'], str(self.ticket.id))
        self.assertEqual(data['results'][0]['person']['id'], str(activity.person.id))
        self.assertEqual(data['results'][0]['content'], activity.content)

    def test_data_automation(self):
        activity_type = create_ticket_activity_type("comment")
        activity = create_ticket_activity(ticket=self.ticket, type=activity_type,
            content={'comment': 'with comment'}, automation=True)

        response = self.client.get('/api/tickets/{}/activity/?person__isnull=True'
                                   .format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['id'], str(activity.id))
        self.assertEqual(data['results'][0]['person'], None)
        self.assertEqual(data['results'][0]['automation']['id'], str(activity.automation.id))
        self.assertEqual(data['results'][0]['automation']['description'], activity.automation.description)

    def test_ticket_two(self):
        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket_two.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 0)

    def test_ticket_three(self):
        activity_type = create_ticket_activity_type("comment")
        create_ticket_activity(ticket=self.ticket, type=activity_type,
            content={'comment': 'with comment'})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(len(data['results'][0]['content']), 1)
        self.assertEqual(data['results'][0]['content']['comment'], 'with comment')

    def test_paginate(self):
        # page 1
        response = self.client.get('/api/tickets/{}/activity/?page=1'.format(self.ticket.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertTrue(data['count'])
        # page 2
        response = self.client.get('/api/tickets/{}/activity/?page=2'.format(self.ticket.id))
        self.assertEqual(response.status_code, 404)

    def test_filter_field(self):
        person = self.ticket_activity.person
        response = self.client.get('/api/tickets/{}/activity/?person={}'
            .format(self.ticket.id, person.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            (TicketActivity.objects.filter(person=person)
                                   .filter(ticket=self.ticket.id)
                                   .filter_out_unsupported_types()
                                   .count()))

    def test_filter_field_none(self):
        person = create_single_person()
        response = self.client.get('/api/tickets/{}/activity/?person={}'
            .format(self.ticket.id, person.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            (TicketActivity.objects.filter(person=person)
                                   .filter_out_unsupported_types()
                                   .count()))

    def test_filter_related(self):
        person = self.ticket_activity.person
        response = self.client.get('/api/tickets/{}/activity/?person__username={}'
            .format(self.ticket.id, person.username))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            (TicketActivity.objects.filter(person__username=person.username)
                                   .filter(ticket=self.ticket.id)
                                   .filter_out_unsupported_types()
                                   .count()))

    def test_filter_related_with_arg(self):
        letter = "a"
        response = self.client.get('/api/tickets/{}/activity/?person__username__icontains={}'
            .format(self.ticket.id, letter))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            (TicketActivity.objects.filter(person__username__icontains=letter)
                                   .filter(ticket=self.ticket.id)
                                   .filter_out_unsupported_types()
                                   .count()))


class TicketActivityViewSetReponseTests(APITestCase):

    def setUp(self):
        create_categories()

        self.dm = DistrictManager()
        self.person = self.dm.person
        self.ticket = create_ticket(assignee=self.person)

        # Add additional 'child' Category to Ticket and Role.
        # These are needed to correct test the 'from'/'to' category change for the 'parent' key
        self.child_category = Category.objects.exclude(parent__isnull=True)[0]
        self.person.role.categories.add(self.child_category)
        self.ticket.categories.add(self.child_category)

        # TicketActivityTypes
        create_ticket_activity_types()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        type = 'create'
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=type)

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertIn('id', data['results'][0])
        self.assertIn('created', data['results'][0])
        self.assertEqual(data['results'][0]['type'], type)
        self.assertEqual(data['results'][0]['ticket'], str(self.ticket.id))
        self.assertEqual(data['results'][0]['person']['id'], str(self.dm.person.id))
        self.assertEqual(data['results'][0]['person']['fullname'], self.dm.person.fullname)
        self.assertIsNone(data['results'][0]['content'])

    def test_assignee(self):
        from_assignee = self.ticket.assignee
        to_assignee = create_single_person()
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=TicketActivityType.ASSIGNEE,
            content={'from': str(from_assignee.id), 'to': str(to_assignee.id)})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['ticket'], str(self.ticket.id))
        self.assertEqual(data['results'][0]['content']['from']['id'], str(from_assignee.id))
        self.assertEqual(data['results'][0]['content']['from']['fullname'], from_assignee.fullname)
        self.assertEqual(data['results'][0]['content']['to']['id'], str(to_assignee.id))
        self.assertEqual(data['results'][0]['content']['to']['fullname'], to_assignee.fullname)

    def test_cc_add(self):
        cc = create_single_person()
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=TicketActivityType.CC_ADD,
            content={'0': str(cc.id)})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(len(data['results'][0]['content']), 1)
        self.assertEqual(data['results'][0]['content']['added'][0]['id'], str(cc.id))
        self.assertEqual(data['results'][0]['content']['added'][0]['fullname'], cc.fullname)

    def test_cc_remove(self):
        cc = create_single_person()
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=TicketActivityType.CC_REMOVE,
            content={'0': str(cc.id)})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(len(data['results'][0]['content']), 1)
        self.assertEqual(data['results'][0]['content']['removed'][0]['id'], str(cc.id))
        self.assertEqual(data['results'][0]['content']['removed'][0]['fullname'], cc.fullname)

    def test_status(self):
        from_status = self.ticket.status
        to_status = create_ticket_status('ticket.status.new')
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=TicketActivityType.STATUS,
            content={'from': str(from_status.id), 'to': str(to_status.id)})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['ticket'], str(self.ticket.id))
        self.assertEqual(data['results'][0]['content']['from'], str(from_status.id))
        self.assertEqual(data['results'][0]['content']['to'], str(to_status.id))

    def test_priority(self):
        from_priority = self.ticket.priority
        to_priority = create_ticket_priority('ticket.priority.new')
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=TicketActivityType.PRIORITY,
            content={'from': str(from_priority.id), 'to': str(to_priority.id)})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['ticket'], str(self.ticket.id))
        self.assertEqual(data['results'][0]['content']['from'], str(from_priority.id))
        self.assertEqual(data['results'][0]['content']['to'], str(to_priority.id))

    def test_categories(self):
        child_child_category = Category.objects.filter(parent=str(self.child_category.id))[0]
        self.ticket.categories.add(child_child_category)
        from_category = self.ticket.categories.exclude(parent__isnull=True).first()
        to_category = (Category.objects.exclude(id=from_category.id)
                                       .exclude(parent__isnull=True).first())
        to_child_category = Category.objects.filter(parent=str(to_category.id))[0]
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=TicketActivityType.CATEGORIES,
                content={'from_0': str(from_category.id), 'from_1': str(child_child_category.id), 'to_0': str(to_category.id),
                    'to_1': str(to_child_category.id)})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['ticket'], str(self.ticket.id))
        self.assertEqual(data['results'][0]['content']['from'][0]['id'], str(from_category.id))
        self.assertEqual(data['results'][0]['content']['from'][0]['parent'], str(from_category.parent.id))
        self.assertEqual(data['results'][0]['content']['from'][0]['name'], from_category.name)
        self.assertEqual(data['results'][0]['content']['from'][0]['level'], from_category.level)
        self.assertEqual(data['results'][0]['content']['from'][1]['id'], str(child_child_category.id))
        self.assertEqual(data['results'][0]['content']['from'][1]['parent'], str(child_child_category.parent.id))
        self.assertEqual(data['results'][0]['content']['from'][1]['name'], child_child_category.name)
        self.assertEqual(data['results'][0]['content']['from'][1]['level'], child_child_category.level)
        self.assertEqual(data['results'][0]['content']['to'][0]['id'], str(to_category.id))
        self.assertEqual(data['results'][0]['content']['to'][0]['parent'], str(to_category.parent.id))
        self.assertEqual(data['results'][0]['content']['to'][0]['name'], to_category.name)
        self.assertEqual(data['results'][0]['content']['to'][0]['level'], to_category.level)
        self.assertEqual(data['results'][0]['content']['to'][1]['id'], str(to_child_category.id))
        self.assertEqual(data['results'][0]['content']['to'][1]['parent'], str(to_child_category.parent.id))
        self.assertEqual(data['results'][0]['content']['to'][1]['name'], to_child_category.name)
        self.assertEqual(data['results'][0]['content']['to'][1]['level'], to_child_category.level)
        # old keys gone
        with self.assertRaises(KeyError):
            data['results'][0]['content']['from_0']
        with self.assertRaises(KeyError):
            data['results'][0]['content']['to_0']

    def test_attachment_add(self):
        attachment = create_file_attachment(self.ticket)
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=TicketActivityType.ATTACHMENT_ADD,
            content={'0': str(attachment.id)})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(len(data['results'][0]['content']), 1)
        self.assertEqual(data['results'][0]['content']['added'][0]['id'], str(attachment.id))
        self.assertEqual(data['results'][0]['content']['added'][0]['filename'], attachment.filename)
        self.assertEqual(data['results'][0]['content']['added'][0]['file'], media_path(attachment.file))
        self.assertEqual(data['results'][0]['content']['added'][0]['image_thumbnail'], str(attachment.image_thumbnail))

    def test_comment(self):
        my_comment = 'my random comment'
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=TicketActivityType.COMMENT,
            content={'comment': my_comment})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['ticket'], str(self.ticket.id))
        self.assertEqual(data['results'][0]['content']['comment'], my_comment)

    def test_deleted_records_show_as_well(self):
        from_assignee = self.ticket.assignee
        person = create_single_person()
        # assignee
        person.delete()
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=TicketActivityType.ASSIGNEE,
            content={'from': str(from_assignee.id), 'to': str(person.id)})
        # cc_add
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=TicketActivityType.CC_ADD,
            content={'0': str(person.id)})
        # cc_remove
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=TicketActivityType.CC_REMOVE,
            content={'0': str(person.id)})
        # attachment
        attachment = create_file_attachment(self.ticket)
        attachment.delete()
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=TicketActivityType.ATTACHMENT_ADD,
            content={'0': str(attachment.id)})
        # categories
        from_category = self.ticket.categories.exclude(parent__isnull=True).first()
        from_category.delete()
        to_category = (Category.objects.exclude(id=from_category.id)
                                       .exclude(parent__isnull=True).first())
        to_category.delete()
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=TicketActivityType.CATEGORIES,
                content={'from_0': str(from_category.id), 'to_0': str(to_category.id)})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        self.assertEqual(response.status_code, 200)

    # TODO: add back assertions once UI supports this type
    def test_send_email(self):
        person = create_single_person()
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=TicketActivityType.SEND_EMAIL,
                                                 content=[str(person.id)])

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 0)
        # self.assertEqual(data['results'][0]['ticket'], str(self.ticket.id))
        # self.assertEqual(data['results'][0]['content'][0]['id'], str(person.id))
        # self.assertEqual(data['results'][0]['content'][0]['fullname'], person.fullname)

    # TODO: add back assertions once UI supports this type
    def test_send_sms(self):
        person = create_single_person()
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=TicketActivityType.SEND_SMS,
                                                 content=[str(person.id)])

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 0)
        # self.assertEqual(data['results'][0]['ticket'], str(self.ticket.id))
        # self.assertEqual(data['results'][0]['content'][0]['id'], str(person.id))
        # self.assertEqual(data['results'][0]['content'][0]['fullname'], person.fullname)


class TicketAndTicketActivityTests(APITestCase):

    def setUp(self):
        create_categories()

        self.dm = DistrictManager()
        self.person = self.dm.person
        self.ticket = create_ticket(assignee=self.person)

        create_ticket_activity_types()
        # Data
        serializer = TicketCreateSerializer(self.ticket)
        self.data = serializer.data
        self.categories = Category.objects.all()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_create(self):
        name = 'create'
        self.assertEqual(TicketActivity.objects.count(), 0)
        location = create_location()
        self.data.update({
            'id': str(uuid.uuid4()),
            'request': 'plumbing',
            'location': str(location.id)
        })

        response = self.client.post('/api/tickets/', self.data, format='json')

        self.assertEqual(TicketActivity.objects.count(), 1)
        activity = TicketActivity.objects.first()
        self.assertEqual(activity.type.name, name)

    def test_assignee(self):
        name = 'assignee'
        self.assertEqual(TicketActivity.objects.count(), 0)
        new_assingee = create_single_person(name='foo')
        self.assertNotEqual(self.data['assignee'], str(new_assingee.id))
        self.data['assignee'] = str(new_assingee.id)

        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        # response
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['assignee'], str(new_assingee.id))
        # TicketActivity
        self.assertEqual(response.status_code, 200)
        self.assertEqual(TicketActivity.objects.count(), 1)
        activity = TicketActivity.objects.first()
        self.assertEqual(activity.type.name, name)
        self.assertTrue(TicketActivity.objects.filter(content__from=str(self.ticket.assignee.id)).exists())
        self.assertTrue(TicketActivity.objects.filter(content__to=str(new_assingee.id)).exists())

    def test_cc_add(self):
        name = 'cc_add'
        self.assertEqual(TicketActivity.objects.count(), 0)
        new_cc = create_single_person(name='foo')
        self.data['cc'].append(str(new_cc.id))

        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        self.assertEqual(TicketActivity.objects.count(), 1)
        activity = TicketActivity.objects.first()
        self.assertEqual(activity.type.name, name)
        self.assertEqual(activity.content['0'], str(new_cc.id))

    def test_cc_remove(self):
        name = 'cc_remove'
        # ticket
        init_cc = self.ticket.cc.first()
        self.assertEqual(self.ticket.cc.count(), 1)
        # ticket activity
        self.assertEqual(TicketActivity.objects.count(), 0)
        self.data['cc'] = []

        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        self.assertEqual(TicketActivity.objects.count(), 1)
        activity = TicketActivity.objects.first()
        self.assertEqual(activity.type.name, name)
        self.assertEqual(activity.content['0'], str(init_cc.id))

    def test_cc_add_and_remove(self):
        self.assertEqual(TicketActivity.objects.count(), 0)
        init_cc = self.ticket.cc.first()
        new_cc = create_single_person(name='foo')
        self.data['cc'] = [str(new_cc.id)]

        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        self.assertEqual(TicketActivity.objects.count(), 2)
        # cc_add record
        name = 'cc_add'
        activity = TicketActivity.objects.get(type__name=name)
        self.assertEqual(activity.content['0'], str(new_cc.id))
        # cc_remove record
        name = 'cc_remove'
        activity = TicketActivity.objects.get(type__name=name)
        self.assertEqual(activity.content['0'], str(init_cc.id))

    def test_cc_add_multiple(self):
        name = 'cc_add'
        self.assertEqual(TicketActivity.objects.count(), 0)
        new_cc = create_single_person(name='foo')
        new_cc_two = create_single_person(name='bar')
        self.data['cc'].append(str(new_cc.id))
        self.data['cc'].append(str(new_cc_two.id))

        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        self.assertEqual(TicketActivity.objects.count(), 1)
        activity = TicketActivity.objects.first()
        self.assertEqual(activity.type.name, name)
        self.assertIn(
            str(new_cc.id),
            [str(activity.content[k]) for k,v in activity.content.items()]
        )
        self.assertIn(
            str(new_cc_two.id),
            [str(activity.content[k]) for k,v in activity.content.items()]
        )

    def test_status(self):
        name = 'status'
        self.assertEqual(TicketActivity.objects.count(), 0)
        new_status = create_ticket_status('my-new-status')
        self.assertNotEqual(self.data['status'], str(new_status.id))
        self.data['status'] = str(new_status.id)

        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        # response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['status'], str(new_status.id))
        # TicketActivity
        self.assertEqual(TicketActivity.objects.count(), 1)
        activity = TicketActivity.objects.first()
        self.assertEqual(activity.type.name, name)
        self.assertTrue(TicketActivity.objects.filter(content__from=str(self.ticket.status.id)).exists())
        self.assertTrue(TicketActivity.objects.filter(content__to=str(new_status.id)).exists())

    def test_priority(self):
        name = 'priority'
        self.assertEqual(TicketActivity.objects.count(), 0)
        new_priority = create_ticket_priority('my-new-priority')
        self.assertNotEqual(self.data['priority'], str(new_priority.id))
        self.data['priority'] = str(new_priority.id)

        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        # response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['priority'], str(new_priority.id))
        # TicketActivity
        self.assertEqual(TicketActivity.objects.count(), 1)
        activity = TicketActivity.objects.first()
        self.assertEqual(activity.type.name, name)
        self.assertTrue(TicketActivity.objects.filter(content__from=str(self.ticket.priority.id)).exists())
        self.assertTrue(TicketActivity.objects.filter(content__to=str(new_priority.id)).exists())

    def test_categories(self):
        name = 'categories'
        self.assertEqual(TicketActivity.objects.count(), 0)
        # Only one Category on the Ticket
        [self.ticket.categories.remove(c) for c in self.ticket.categories.all()[:self.ticket.categories.count()-1]]
        new_category = Category.objects.exclude(id=self.ticket.categories.first().id).first()
        # repopulate `self.data`
        serializer = TicketCreateSerializer(self.ticket)
        self.data = serializer.data
        # test setup correctly
        self.assertEqual(len(self.data['categories']), 1)
        self.assertNotEqual(self.data['categories'][0], str(new_category.id))
        # data
        init_categories = self.data['categories'] = [str(self.ticket.categories.first().id)]
        post_categories = self.data['categories'] = [str(new_category.id)]

        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        # response
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['categories'][0], str(new_category.id))
        # TicketActivity
        self.assertEqual(TicketActivity.objects.count(), 1)
        activity = TicketActivity.objects.first()
        self.assertEqual(activity.type.name, name)
        self.assertTrue(TicketActivity.objects.filter(content__from_0=str(init_categories[0])).exists())
        self.assertTrue(TicketActivity.objects.filter(content__to_0=str(post_categories[0])).exists())

    def test_comment(self):
        name = 'comment'
        my_comment = 'my random comment'
        self.assertEqual(TicketActivity.objects.count(), 0)
        self.data['comment'] = my_comment

        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        # response
        data = json.loads(response.content.decode('utf8'))
        # TicketActivity
        self.assertEqual(response.status_code, 200)
        self.assertEqual(TicketActivity.objects.count(), 1)
        activity = TicketActivity.objects.first()
        self.assertEqual(activity.type.name, name)
        self.assertTrue(TicketActivity.objects.filter(content__comment=my_comment).exists())

    def test_attachment_add(self):
        name = 'attachment_add'
        self.assertEqual(TicketActivity.objects.count(), 0)
        new_attachment = create_file_attachment() # not `Ticket` yet associated w/ this `Attachment`
        self.data['attachments'].append(str(new_attachment.id))

        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        self.assertEqual(TicketActivity.objects.count(), 1)
        activity = TicketActivity.objects.first()
        self.assertEqual(activity.type.name, name)
        self.assertEqual(activity.content['0'], str(new_attachment.id))
        self.assertEqual(str(activity.ticket.id), str(self.ticket.id))
        self.assertIsInstance(self.ticket.attachments.get(id=new_attachment.id), Attachment)

    def test_attachment_add__empty(self):
        """
        No TicketActivity will be generated when sending an empty 'attachments' field.
        """
        name = 'attachment_add'
        self.assertEqual(TicketActivity.objects.count(), 0)
        self.data['attachments'] = []

        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        self.assertEqual(TicketActivity.objects.count(), 0)

    def test_attachment_add__then_put_again(self):
        """
        First POST should create a TicketActivity, but the second shouldn't because
        the same Attachment.ID is getting re-posted, and it's already been logged.
        """
        name = 'attachment_add'
        self.assertEqual(TicketActivity.objects.count(), 0)
        new_attachment = create_file_attachment()
        self.data['attachments'].append(str(new_attachment.id))
        self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')
        self.assertEqual(TicketActivity.objects.count(), 1)

        self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')
        self.assertEqual(TicketActivity.objects.count(), 1)

    def test_attachment_add__then_add_ticket(self):
        """
        Each TicketActivity log should only log the Attachment(s) added.
        """
        name = 'attachment_add'
        self.assertEqual(TicketActivity.objects.count(), 0)

        # Attachment 1
        first_attachment = create_file_attachment()
        self.data['attachments'] = [str(first_attachment.id)]

        self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        self.assertEqual(TicketActivity.objects.count(), 1)
        self.assertIn(
            str(first_attachment.id),
            list(TicketActivity.objects.order_by('created').last().content.values())
        )

        # Attachment 2
        second_attachment = create_file_attachment()
        self.data['attachments'] = [str(second_attachment.id)]

        self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        self.assertEqual(TicketActivity.objects.count(), 2)
        self.assertIn(
            str(second_attachment.id),
            list(TicketActivity.objects.order_by('created').last().content.values())
        )
        self.assertNotIn(
            str(first_attachment.id),
            list(TicketActivity.objects.order_by('created').last().content.values())
        )


class TicketQuerySetFiltersTests(TicketSetupNoLoginMixin, APITestCase):

    def setUp(self):
        super(TicketQuerySetFiltersTests, self).setUp()

        self.person_two = create_single_person()

    def tearDown(self):
        self.client.logout()

    def test_cannot_view_tickets(self):
        with self.settings(TICKET_FILTERING_ON=True):
            self.client.login(username=self.person_two.username, password=PASSWORD)

            response = self.client.get('/api/tickets/')
            data = json.loads(response.content.decode('utf8'))

            self.assertEqual(data['count'], 0)

    def test_can_view_tickets(self):
        with self.settings(TICKET_FILTERING_ON=True):
            self.client.login(username=self.person.username, password=PASSWORD)

            response = self.client.get('/api/tickets/')
            data = json.loads(response.content.decode('utf8'))

            self.assertEqual(
                data['count'],
                Ticket.objects.filter_on_categories_and_location(self.person).count()
            )

    def test_can_view_tickets__location(self):
        """
        Checks that the Ticket 'Location' is in the Person's Locations.
        """
        with self.settings(TICKET_FILTERING_ON=True):
            self.client.login(username=self.person.username, password=PASSWORD)
            other_location = create_location()
            self.ticket_two.location = other_location
            self.ticket_two.save()

            response = self.client.get('/api/tickets/')
            data = json.loads(response.content.decode('utf8'))

            self.assertEqual(
                data['count'],
                Ticket.objects.filter_on_categories_and_location(self.person).count()
            )

    def test_can_view_tickets__child_location(self):
        """
        Make a Ticket belonging to the child_location, and make sure it's
        viewable by the Person.
        """
        create_locations()

        with self.settings(TICKET_FILTERING_ON=True):
            self.client.login(username=self.person.username, password=PASSWORD)
            # make sure a child_location exists for one of the Person's Locations
            location = self.person.locations.first()
            child_location = Location.objects.exclude(id=location.id)[0]
            location.children.add(child_location)
            # create ticket for child_location
            ticket = self.ticket_two
            ticket.location = child_location
            ticket.save()
            self.assertIn(ticket.location.id, self.person.locations.objects_and_their_children())
            # Category must also match
            category = self.person.role.categories.first()
            self.ticket.categories.add(category)

            response = self.client.get('/api/tickets/')
            data = json.loads(response.content.decode('utf8'))

    def test_can_view_tickets__category(self):
        """
        Checks that at least one of Ticket's 'Categories' are in the
        Person's Role Categories.
        """
        with self.settings(TICKET_FILTERING_ON=True):
            self.client.login(username=self.person.username, password=PASSWORD)
            other_category = create_single_category('some other category')
            [self.ticket_two.categories.remove(c) for c in self.ticket_two.categories.all()]
            self.ticket_two.categories.add(other_category)

            response = self.client.get('/api/tickets/')
            data = json.loads(response.content.decode('utf8'))

            self.assertEqual(
                data['count'],
                Ticket.objects.filter_on_categories_and_location(self.person).count()
            )

    def test_can_view_tickets__child_category(self):
        """
        If the Person has to Parent Category, the can view their Children's
        Category Tickets.
        """
        with self.settings(TICKET_FILTERING_ON=True):
            self.client.login(username=self.person.username, password=PASSWORD)
            child_category = create_single_category(parent=self.person.role.categories.first())
            [self.ticket_two.categories.remove(c) for c in self.ticket_two.categories.all()]
            self.ticket_two.categories.add(child_category)

            response = self.client.get('/api/tickets/')
            data = json.loads(response.content.decode('utf8'))

            self.assertNotIn(
                str(self.ticket_two.id),
                [x['id'] for x in data['results']]
            )

    def test_can_view_tickets__role_has_no_categories(self):
        """
        If a Role has no Categories, the Person can see all Categories
        """
        with self.settings(TICKET_FILTERING_ON=True):
            person_two = create_single_person()
            # No Categories
            for c in person_two.role.categories.all():
                person_two.role.categories.remove(c)
            self.assertEqual(person_two.role.categories.count(), 0)
            # Locations
            for x in Location.objects.filter(location_level=person_two.role.location_level):
                person_two.locations.add(x)
            self.assertEqual(
                person_two.locations.count(),
                Location.objects.filter(location_level=person_two.role.location_level).count()
            )
            # Ticket
            self.ticket.location = person_two.locations.first()
            self.ticket.save()
            self.assertEqual(1, Ticket.objects.filter_on_categories_and_location(person_two).count())
            # Login
            self.client.login(username=person_two.username, password=PASSWORD)

            response = self.client.get('/api/tickets/')
            data = json.loads(response.content.decode('utf8'))

            self.assertEqual(data['count'], 1)
            self.assertEqual(data['results'][0]['id'], str(self.ticket.id))

    def test_can_view_tickets__detail_endpoint_get_fails(self):
        """
        Person can't view any Tickets (due) to filtering, so a GET request
        should also fail.
        """
        with self.settings(TICKET_FILTERING_ON=True):
            person_two = create_single_person()
            self.ticket.location = person_two.locations.first()
            self.ticket.save()
            self.assertEqual(0, Ticket.objects.filter_on_categories_and_location(person_two).count())
            self.client.login(username=person_two.username, password=PASSWORD)

            response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))

            self.assertEqual(response.status_code, 404)
