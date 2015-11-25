import uuid

from django.db import models

from django_fsm import FSMKeyField, FSMFieldMixin, transition


class FSMUuidField(FSMFieldMixin, models.UUIDField):
    pass


class WorkRequestStatusEnum(object):
    DRAFT = "def11673-d4ab-41a6-a37f-0c6846b96001"
    DENIED = "def11673-d4ab-41a6-a37f-0c6846b96002"
    PROBLEM_SOLVED = "def11673-d4ab-41a6-a37f-0c6846b96003"
    COMPLETE = "def11673-d4ab-41a6-a37f-0c6846b96004"
    DEFERRED = "def11673-d4ab-41a6-a37f-0c6846b96005"
    NEW = "def11673-d4ab-41a6-a37f-0c6846b96006"
    ASSIGNED = "def11673-d4ab-41a6-a37f-0c6846b96007"
    IN_PROGRESS = "def11673-d4ab-41a6-a37f-0c6846b96008"
    UNSATISFACTORY_COMPLETION = "def11673-d4ab-41a6-a37f-0c6846b96009"

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
    status = FSMKeyField(WorkRequestStatus, default='new', protected=True)

    def __str__(self):
        return str(self.id)

    def save(self, *args, **kwargs):
        self._update_defaults()
        return super(WorkRequest, self).save(*args, **kwargs)

    def _update_defaults(self):
        if not self.status:
            self.status = WorkRequestStatus.objects.default()

    @transition(field=status, source='new', target='draft')
    def draft(self):
        pass
