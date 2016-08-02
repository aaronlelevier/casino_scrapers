from django.test import TestCase

from django_fsm import can_proceed, TransitionNotAllowed

from work_request.models import (WorkRequestStatusEnum, WorkRequestStatus,
    WorkRequest)
from person.tests.factory import create_single_person


class WorkRequestStatusEnumTests(TestCase):

    def setUp(self):
        self.enum = WorkRequestStatusEnum()

    def test_to_dict(self):
        self.assertEqual(
            self.enum.to_dict(),
            {key:value for key, value in WorkRequestStatusEnum.__dict__.items()
                       if not key.startswith("__")}
        )

    def test_keys(self):
        self.assertEqual(
            self.enum.keys,
            list(self.enum.to_dict().keys())
        )

    def test_get_key_from_value(self):
        value = "def11673-d4ab-41a6-a37f-0c6846b96001"

        self.assertEqual(
            self.enum.get_key_from_value(value),
            next(("_{}_".format(k) for k,v in self.enum.to_dict().items()
                                   if v == value), None)
        )


class WorkRequestStatusTests(TestCase):

    def setUp(self):
        self.status = WorkRequestStatus.objects.create()

    def test_name(self):
        self.assertEqual(
            self.status.label,
            WorkRequestStatusEnum().get_key_from_value(self.status.id)
        )


class WorkRequestTests(TestCase):

    def setUp(self):
        WorkRequestStatus.objects.create(id=WorkRequestStatusEnum.NEW)
        WorkRequestStatus.objects.create(id=WorkRequestStatusEnum.DRAFT)
        WorkRequestStatus.objects.create(id=WorkRequestStatusEnum.REQUESTED)
        WorkRequestStatus.objects.create(id=WorkRequestStatusEnum.ASSIGNED)
        self.request = WorkRequest.objects.create()

    def test_initial_state_instatiated(self):
        self.assertEqual(self.request.status, 'new')

    def test_transition(self):
        self.assertTrue(can_proceed(self.request.draft))

        self.request.draft()

        self.assertEqual(self.request.status, 'draft')

    def test_transition_doesnt_save_to_db(self):
        self.assertTrue(can_proceed(self.request.draft))

        self.request.draft()

        # Will alter 'status' of the object, but won't save it to the DB
        self.request = WorkRequest.objects.get(id=self.request.id)
        self.assertNotEqual(self.request.status, 'draft')

    def test_transition_explicitly_save_to_db(self):
        self.assertTrue(can_proceed(self.request.draft))

        self.request.draft()
        self.request.save()

        # Will alter 'status' of the object, but won't save it to the DB
        self.request = WorkRequest.objects.get(id=self.request.id)
        self.assertEqual(self.request.status, 'draft')

    def test_transition_condition_single__fail(self):
        self.assertTrue(can_proceed(self.request.draft))

        self.request.draft()
        self.assertEqual(self.request.status, 'draft')
        self.assertFalse(can_proceed(self.request.submit_request))
        self.assertRaises(TransitionNotAllowed, self.request.submit_request)
        self.assertTrue(can_proceed(self.request.submit_request,
                                    check_conditions=False))
        self.assertEqual(self.request.status, 'draft')

    def test_transition_condition_single__success(self):
        self.assertTrue(can_proceed(self.request.draft))
        self.request.draft()
        self.assertEqual(self.request.status, 'draft')

        self.request.request = 'foo'
        self.request.save()

        self.assertTrue(can_proceed(self.request.submit_request))

        self.request.submit_request()
        self.request.save()
        self.assertTrue(self.request.status, 'requested')

    def test_transition_condition_multiple(self):
        # 'draft' status
        self.assertTrue(can_proceed(self.request.draft))
        self.request.draft()
        self.assertEqual(self.request.status, 'draft')

        # 'requested' status
        self.request.request = 'foo'
        self.request.save()
        self.request.submit_request()
        self.assertTrue(self.request.status, 'requested')

        # 'approved' status
        self.assertFalse(can_proceed(self.request.approve_request))
        self.assertRaises(TransitionNotAllowed, self.request.approve_request)

        approver = create_single_person()
        self.request.approver = approver
        self.request.save()

        self.assertTrue(can_proceed(self.request.approve_request))
        self.request.approve_request()
        self.assertEqual(self.request.status, 'approved')
