from django.test import TestCase

from django_fsm import can_proceed

from finite_state.models import (WorkRequestStatusEnum, WorkRequestStatus,
    WorkRequest)


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
        self.status_new = WorkRequestStatus.objects.create(
            id=WorkRequestStatusEnum.NEW)
        self.status_assigned = WorkRequestStatus.objects.create(
            id=WorkRequestStatusEnum.ASSIGNED)
        self.request = WorkRequest.objects.create()

    def test_initial_state_instatiated(self):
        self.assertEqual(self.request.status, 'new',)

    def test_known_transition_should_succeed(self):
        self.assertTrue(can_proceed(self.request.draft))
        self.request.draft()
        self.assertEqual(self.request.status, 'draft')
