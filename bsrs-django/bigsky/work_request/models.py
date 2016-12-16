from django.conf import settings
from django.db import models

from django_fsm import FSMKeyField, FSMFieldMixin, transition


class WorkRequestStatusEnum(object):
    DRAFT = 'draft'
    DENIED = 'denied'
    SOLVED = 'problem_solved'
    COMPLETE = 'complete'
    DEFERRED = 'deferred'
    NEW = 'new'
    ASSIGNED = 'assigned'
    IN_PROGRESS = 'in_progress'
    UNSATISFACTORY = 'unsatisfactory_completion'
    REQUESTED = 'requested'
    APPROVED = 'approved'

    @classmethod
    def to_dict(cls):
        """ dict'ify the object """
        return {key:value for key, value in cls.__dict__.items()
                          if not key.startswith("__")}

    @property
    def keys(self):
        """
        'keys' that are allowed for ``WorkRequestStatus.id``
        """
        return list(self.to_dict().keys())


    def get_key_from_value(self, value):
        """
        To set 'default' field for ``WorkRequestStatus.name`` so it's 
        human readable.
        """
        return next(("_{}_".format(k) for k,v in self.to_dict().items()
                                      if v == value), None)


class WorkRequestStatusManager(models.Manager):

    def default(self):
        try: 
            obj = self.get(name='NEW')
        except WorkRequestStatus.DoesNotExist:
            obj = self.create(id=WorkRequestStatusEnum.NEW)

        return obj


class WorkRequestStatus(models.Model):
    id = models.CharField(primary_key=True, max_length=50, editable=False,
        default=WorkRequestStatusEnum.NEW)
    label = models.CharField(max_length=254, blank=True,
        help_text="String value of the ID 'key'.")

    objects = WorkRequestStatusManager()

    def __str__(self):
        return self.label

    def save(self, *args, **kwargs):
        self.label = WorkRequestStatusEnum().get_key_from_value(self.id)
        return super(WorkRequestStatus, self).save(*args, **kwargs)


class WorkRequest(models.Model):
    status = FSMKeyField(WorkRequestStatus, default=WorkRequestStatusEnum.NEW, protected=True)
    request = models.CharField(max_length=254, blank=True, null=True)
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True)

    def __str__(self):
        return str(self.id)

    def save(self, *args, **kwargs):
        self._update_defaults()
        return super(WorkRequest, self).save(*args, **kwargs)

    def _update_defaults(self):
        if not self.status:
            self.status = WorkRequestStatusEnum.NEW # WorkRequestStatus.objects.default()

    # condition booleans

    def requested(self):
        return bool(self.request)

    def approved(self):
        return bool(self.approver)

    @transition(field=status, source='new', target='draft')
    def draft(self):
        pass

    @transition(field=status, source='draft', target='requested',
        conditions=[requested])
    def submit_request(self):
        pass

    @transition(field=status, source='requested', target='approved',
        conditions=[requested, approved])
    def approve_request(self):
        pass
