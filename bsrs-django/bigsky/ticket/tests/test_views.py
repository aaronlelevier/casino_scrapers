import json
import uuid

from rest_framework import status
from rest_framework.test import APITestCase, APITransactionTestCase

from model_mommy import mommy

from category.models import Category
from person.tests.factory import PASSWORD, create_single_person
from ticket.models import (Ticket, TicketStatus, TicketPriority, TicketActivity,
    TicketActivityType, TICKET_ACTIVITY_TYPES)
from ticket.serializers import TicketCreateSerializer
from ticket.tests.factory import (create_ticket, create_ticket_activity,
    create_ticket_activity_type, create_ticket_activity_types,
    create_ticket_status, create_ticket_priority)


class TicketListTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        create_single_person()
        # Ticket
        self.ticket = create_ticket()
        # Person
        self.person = self.ticket.assignee
        # Category
        self.category_ids = [str(x) for x in Category.objects.values_list('id', flat=True)]
        self.category_names = [str(x) for x in Category.objects.values_list('name', flat=True)]
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        response = self.client.get('/api/tickets/')
        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/tickets/')

        data = json.loads(response.content.decode('utf8'))
        ticket = data['results'][0]

        self.assertEqual(ticket['id'], str(self.ticket.id))
        self.assertEqual(ticket['status'], str(self.ticket.status.id))
        self.assertEqual(ticket['priority'], str(self.ticket.priority.id))
        self.assertEqual(ticket['requester'], str(self.ticket.requester.id))
        self.assertEqual(ticket['attachments'],
            list(self.ticket.attachments.values_list('id', flat=True)))
        self.assertEqual(ticket['request'], self.ticket.request)
        self.assertEqual(ticket['number'], self.ticket.number)

    def test_data_location(self):
        response = self.client.get('/api/tickets/')

        data = json.loads(response.content.decode('utf8'))
        location = data['results'][0]['location']

        self.assertEqual(location['id'], str(self.ticket.location.id))
        self.assertEqual(location['name'], self.ticket.location.name)
        self.assertEqual(location['number'], self.ticket.location.number)
        self.assertEqual(location['location_level'],
            str(self.ticket.location.location_level.id))

    def test_data_categories(self):
        response = self.client.get('/api/tickets/')

        data = json.loads(response.content.decode('utf8'))
        category = data['results'][0]['categories'][0]

        self.assertIn('id', category)
        self.assertIn('name', category)
        self.assertIn('parent', category)
        self.assertIn('children_fks', category)

    def test_data_assignee(self):
        response = self.client.get('/api/tickets/')

        data = json.loads(response.content.decode('utf8'))
        assignee = data['results'][0]['assignee']

        self.assertEqual(assignee['id'], str(self.ticket.assignee.id))
        self.assertEqual(assignee['first_name'], self.ticket.assignee.first_name)
        self.assertEqual(assignee['middle_initial'], self.ticket.assignee.middle_initial)
        self.assertEqual(assignee['last_name'], self.ticket.assignee.last_name)
        self.assertEqual(assignee['title'], self.ticket.assignee.title)
        self.assertEqual(assignee['role'], str(self.ticket.assignee.role.id))


class TicketDetailTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        # Ticket
        create_single_person()
        self.ticket = create_ticket()
        self.person = self.ticket.assignee
        # Category
        category = Category.objects.first()
        child = Category.objects.last()
        category.children.add(child)
        self.ticket.categories.add(category)
        self.ticket.save()
        self.category_ids = [str(c.id) for c in Category.objects.all()]
        self.category_names = [str(x) for x in Category.objects.values_list('name', flat=True)]
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_response(self):
        response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))

        self.assertEqual(response.status_code, 200)

    def test_data(self):
        response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(data['id'], str(self.ticket.id))
        self.assertEqual(data['status'], str(self.ticket.status.id))
        self.assertEqual(data['priority'], str(self.ticket.priority.id))
        self.assertEqual(data['attachments'],
            list(self.ticket.attachments.values_list('id', flat=True)))
        self.assertEqual(data['request'], self.ticket.request)
        self.assertEqual(data['number'], self.ticket.number)

    def test_location(self):
        response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        location = data['location']

        self.assertEqual(location['id'], str(self.ticket.location.id))
        self.assertEqual(location['name'], self.ticket.location.name)
        self.assertEqual(location['number'], self.ticket.location.number)
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
        self.assertEqual(assignee['title'], self.ticket.assignee.title)
        self.assertEqual(assignee['role'], str(self.ticket.assignee.role.id))

    def test_requester(self):
        response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        requester = data['requester']

        self.assertEqual(requester['id'], str(self.ticket.requester.id))
        self.assertEqual(requester['first_name'], self.ticket.requester.first_name)
        self.assertEqual(requester['middle_initial'], self.ticket.requester.middle_initial)
        self.assertEqual(requester['last_name'], self.ticket.requester.last_name)
        self.assertEqual(requester['title'], self.ticket.requester.title)
        self.assertEqual(requester['role'], str(self.ticket.requester.role.id))

    def test_data_categories(self):
        response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        category = data['categories'][0]

        self.assertIn('id', category)
        self.assertIn('name', category)
        self.assertIn('parent', category)
        self.assertIn('children_fks', category)

    def test_cc(self):
        response = self.client.get('/api/tickets/{}/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        data_cc = data['cc'][0]
        cc = self.ticket.cc.first()

        self.assertEqual(data_cc['id'], str(cc.id))
        self.assertEqual(data_cc['first_name'], cc.first_name)
        self.assertEqual(data_cc['middle_initial'], cc.middle_initial)
        self.assertEqual(data_cc['last_name'], cc.last_name)
        self.assertEqual(data_cc['title'], cc.title)
        self.assertEqual(data_cc['role'], str(cc.role.id))


class TicketUpdateTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        # Ticket
        create_single_person()
        self.ticket = create_ticket()
        self.person = self.ticket.assignee
        # Category
        # Data
        serializer = TicketCreateSerializer(self.ticket)
        self.data = serializer.data
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_no_change(self):
        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)

    def test_change_name(self):
        self.data['request'] = 'new request name'
        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id),
            self.data, format='json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertNotEqual(self.ticket.request, data['request'])


class TicketCreateTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_single_person()
        # Ticket
        self.ticket = create_ticket()
        # Data
        serializer = TicketCreateSerializer(self.ticket)
        self.data = serializer.data
        self.categories = Category.objects.all()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_ticket(self):
        self.data.update({
            'id': str(uuid.uuid4()),
            'request': 'plumbing',
        })

        response = self.client.post('/api/tickets/', self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.data['id'], data['id'])
        self.assertEqual(self.data['request'], data['request'])

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


class TicketActivityViewSetTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
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

    def test_ticket_count(self):
        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 2)

    def test_ticket_details(self):
        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))
        data = json.loads(response.content.decode('utf8'))

        activity = TicketActivity.objects.get(id=data['results'][0]['id'])
        self.assertIsInstance(activity, TicketActivity)
        self.assertIsInstance(TicketActivityType.objects.get(name=data['results'][0]['type']), TicketActivityType)
        self.assertEqual(data['results'][0]['ticket'], str(self.ticket.id))
        self.assertEqual(data['results'][0]['person']['id'], str(activity.person.id))
        self.assertEqual(data['results'][0]['content'], activity.content)

    def test_ticket_two(self):
        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket_two.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 0)

    def test_post(self):
        response = self.client.post('/api/tickets/{}/activity/'.format(self.ticket.id), {}, format='json')
        self.assertEqual(response.status_code, 405)

    def test_paginate(self):
        # page 1
        response = self.client.get('/api/tickets/{}/activity/?page=1'.format(self.ticket.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 2)
        # page 2
        response = self.client.get('/api/tickets/{}/activity/?page=2'.format(self.ticket.id))
        self.assertEqual(response.status_code, 404)

    def test_filter_field(self):
        person = self.ticket_activity.person
        response = self.client.get('/api/tickets/{}/activity/?person={}'
            .format(self.ticket.id, person.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], TicketActivity.objects.filter(person=person).count())

    def test_filter_field_none(self):
        person = create_single_person()
        response = self.client.get('/api/tickets/{}/activity/?person={}'
            .format(self.ticket.id, person.id))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], TicketActivity.objects.filter(person=person).count())

    def test_filter_related(self):
        person = self.ticket_activity.person

        response = self.client.get('/api/tickets/{}/activity/?person__username={}'
            .format(self.ticket.id, person.username))
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            TicketActivity.objects.filter(person__username=person.username).count()
        )

    def test_filter_related_with_arg(self):
        letter = "a"

        response = self.client.get('/api/tickets/{}/activity/?person__username__icontains={}'
            .format(self.ticket.id, letter))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            TicketActivity.objects.filter(person__username__icontains=letter).count()
        )


class TicketActivityViewSetReponseTests(APITestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_single_person()
        # Ticket
        self.ticket = create_ticket()
        # TicketActivityTypes
        create_ticket_activity_types()
        # Login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_type(self):
        type = 'create'
        ticket_activity = create_ticket_activity(ticket=self.ticket, type=type)

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['results'][0]['type'], type)

    def test_create(self):
        ticket_activity = create_ticket_activity(ticket=self.ticket, type='create')

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['ticket'], str(self.ticket.id))
        self.assertIsNone(data['results'][0]['content'])

    def test_assignee(self):
        from_assignee = self.ticket.assignee
        to_assignee = create_single_person()
        ticket_activity = create_ticket_activity(ticket=self.ticket, type='assignee',
            content={'from': str(from_assignee.id), 'to': str(to_assignee.id)})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['ticket'], str(self.ticket.id))
        self.assertEqual(data['results'][0]['content']['from']['id'], str(from_assignee.id))
        self.assertEqual(data['results'][0]['content']['from']['first_name'], from_assignee.first_name)
        self.assertEqual(data['results'][0]['content']['from']['middle_initial'], from_assignee.middle_initial)
        self.assertEqual(data['results'][0]['content']['from']['last_name'], from_assignee.last_name)
        self.assertEqual(data['results'][0]['content']['to']['id'], str(to_assignee.id))
        self.assertEqual(data['results'][0]['content']['to']['first_name'], to_assignee.first_name)
        self.assertEqual(data['results'][0]['content']['to']['middle_initial'], to_assignee.middle_initial)
        self.assertEqual(data['results'][0]['content']['to']['last_name'], to_assignee.last_name)

    def test_cc_add(self):
        cc = create_single_person()
        ticket_activity = create_ticket_activity(ticket=self.ticket, type='cc_add',
            content={'0': str(cc.id)})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(len(data['results'][0]['content']), 1)
        self.assertEqual(data['results'][0]['content']['added'][0]['id'], str(cc.id))
        self.assertEqual(data['results'][0]['content']['added'][0]['first_name'], cc.first_name)
        self.assertEqual(data['results'][0]['content']['added'][0]['middle_initial'], cc.middle_initial)
        self.assertEqual(data['results'][0]['content']['added'][0]['last_name'], cc.last_name)

    def test_cc_remove(self):
        cc = create_single_person()
        ticket_activity = create_ticket_activity(ticket=self.ticket, type='cc_remove',
            content={'0': str(cc.id)})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(len(data['results'][0]['content']), 1)
        self.assertEqual(data['results'][0]['content']['removed'][0]['id'], str(cc.id))
        self.assertEqual(data['results'][0]['content']['removed'][0]['first_name'], cc.first_name)
        self.assertEqual(data['results'][0]['content']['removed'][0]['middle_initial'], cc.middle_initial)
        self.assertEqual(data['results'][0]['content']['removed'][0]['last_name'], cc.last_name)

    def test_status(self):
        from_status = self.ticket.status
        to_status = create_ticket_status('ticket.status.new')
        ticket_activity = create_ticket_activity(ticket=self.ticket, type='status',
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
        ticket_activity = create_ticket_activity(ticket=self.ticket, type='priority',
            content={'from': str(from_priority.id), 'to': str(to_priority.id)})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['ticket'], str(self.ticket.id))
        self.assertEqual(data['results'][0]['content']['from'], str(from_priority.id))
        self.assertEqual(data['results'][0]['content']['to'], str(to_priority.id))

    def test_categories(self):
        from_category = self.ticket.categories.first()
        to_category = Category.objects.exclude(id=from_category.id).first()
        ticket_activity = create_ticket_activity(ticket=self.ticket, type='categories',
            content={'from_0': str(from_category.id), 'to_0': str(to_category.id)})

        response = self.client.get('/api/tickets/{}/activity/'.format(self.ticket.id))

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['ticket'], str(self.ticket.id))
        self.assertEqual(data['results'][0]['content']['from'][0]['id'], str(from_category.id))
        self.assertEqual(data['results'][0]['content']['from'][0]['parent'], str(from_category.parent.id))
        self.assertEqual(data['results'][0]['content']['from'][0]['name'], from_category.name)
        self.assertEqual(data['results'][0]['content']['to'][0]['id'], str(to_category.id))
        self.assertEqual(data['results'][0]['content']['to'][0]['parent'], str(to_category.parent.id))
        self.assertEqual(data['results'][0]['content']['to'][0]['name'], to_category.name)
        # old keys gone
        with self.assertRaises(KeyError):
            data['results'][0]['content']['from_0']
        with self.assertRaises(KeyError):
            data['results'][0]['content']['to_0']


class TicketAndTicketActivityTests(APITransactionTestCase):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_single_person()
        # Ticket
        self.ticket = create_ticket()
        # TicketActivityType
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
        self.data.update({
            'id': str(uuid.uuid4()),
            'request': 'plumbing',
        })

        response = self.client.post('/api/tickets/', self.data, format='json')

        self.assertEqual(TicketActivity.objects.count(), 1)
        activity = TicketActivity.objects.first()
        self.assertEqual(activity.type.name, name)

    def test_assignee(self):
        name = 'assignee'
        self.assertEqual(TicketActivity.objects.count(), 0)
        new_assingee = create_single_person()
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
        new_cc = create_single_person()
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
        new_cc = create_single_person()
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
        new_cc = create_single_person()
        new_cc_two = create_single_person()
        self.data['cc'].append(str(new_cc.id))
        self.data['cc'].append(str(new_cc_two.id))

        response = self.client.put('/api/tickets/{}/'.format(self.ticket.id), self.data, format='json')

        self.assertEqual(TicketActivity.objects.count(), 1)
        activity = TicketActivity.objects.first()
        self.assertEqual(activity.type.name, name)
        self.assertEqual(len(activity.content), 2)
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
        # ticket_activity_type = create_ticket_activity_type(name=name)
        # Only one Category on the Ticket
        [c.delete(override=True) for c in self.ticket.categories.all()[:self.ticket.categories.count()-1]]
        new_category = Category.objects.exclude(id=self.ticket.categories.first().id).first()
        self.assertEqual(len(self.data['categories']), 3)
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
