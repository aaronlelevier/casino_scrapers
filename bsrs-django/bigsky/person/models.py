'''
Created on Jan 30, 2014

@author: tkrier
'''
from django.db import models, IntegrityError
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import AbstractUser, User, UserManager, Group
from django.utils.encoding import python_2_unicode_compatible
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.contrib.contenttypes.fields import GenericRelation
from django.core.exceptions import ValidationError
from django.contrib.postgres.fields import HStoreField

from accounting.models import Currency
from location.models import LocationLevel, Location
from order.models import WorkOrderStatus
from util import choices, exceptions as excp
from util.models import (AbstractName, MainSetting, CustomSetting,
    BaseModel, BaseManager)


@python_2_unicode_compatible
class Role(BaseModel):
    # keys
    group = models.OneToOneField(Group, blank=True, null=True)
    location_level = models.ForeignKey(LocationLevel, null=True, blank=True)
    role_type = models.CharField(max_length=29, blank=True,
        choices=choices.ROLE_TYPE_CHOICES, default=choices.ROLE_TYPE_CHOICES[0][0])
    # Required
    name = models.CharField(max_length=100, unique=True, help_text="Will be set to the Group Name")
    # Optional
    dashboad_text = models.CharField(max_length=255, blank=True)
    create_all = models.BooleanField(blank=True, default=False,
        help_text='Allow document creation for all locations')
    modules = models.TextField(blank=True)
    dashboad_links = models.TextField(blank=True)
    tabs = models.TextField(blank=True)
    password_min_length = models.PositiveIntegerField(blank=True, default=6)
    password_history_length = models.PositiveIntegerField(blank=True, null=True,
        help_text="Will be NULL if password length has never been changed.")
    password_char_types = models.CharField(max_length=100,
        help_text="Password characters allowed") # TODO: This field will need to be accessed when someone for 
                                                 # the role saves their PW to validate it.
    password_expire = models.PositiveIntegerField(blank=True, null=True,
        help_text="Number of days after setting password that it will expire.")
    password_expire_alert = models.BooleanField(blank=True, default=True,
        help_text="Does the Person want to be alerted 'pre pw expiring'. Alerts start 3 days before password expires.")
    proxy_set = models.BooleanField(blank=True, default=False,
        help_text="Users in this Role can set their own proxy")
    # Default Settings
    # that set the Person settings for these fields when first
    # adding a Person to a Role
    default_accept_assign = models.BooleanField(blank=True, default=True)
    accept_assign = models.BooleanField(blank=True, default=False)
    default_accept_notify = models.BooleanField(blank=True, default=True)
    accept_notify = models.BooleanField(blank=True, default=False)
    # Auth Amounts
    default_auth_amount = models.DecimalField(max_digits=15, decimal_places=4, blank=True, default=0,
        help_text="The default amount here will be eventually set by system settings.")
    default_auth_amount_currency = models.ForeignKey(Currency, blank=True, null=True,
        help_text="The default currency is 'usd'.")
    # Approvals
    allow_approval = models.BooleanField(blank=True, default=False)
    proxy_approval_bypass = models.BooleanField(blank=True, default=False)
    # Work Orders
    wo_notes = models.BooleanField(blank=True, default=False)
    wo_edit_closeout = models.BooleanField(blank=True, default=False)
    wo_show_inactive = models.BooleanField(blank=True, default=False)
    wo_show_tkt_attach = models.BooleanField(blank=True, default=False)
    wo_allow_backdate = models.BooleanField(blank=True, default=False)
    wo_days_backdate = models.PositiveIntegerField(blank=True, null=True)
    # Invoices
    inv_options = models.CharField(max_length=255, choices=choices.INVOICE_CHOICES,
        default=choices.INVOICE_CHOICES[0][0])
    inv_wo_status = models.ForeignKey(WorkOrderStatus, blank=True, null=True)
    inv_wait = models.PositiveIntegerField(blank=True, null=True)
    inv_select_assign = models.CharField(max_length=255, choices=choices.INVOICE_SELECT_ASSIGN_CHOICES,
        default=choices.INVOICE_SELECT_ASSIGN_CHOICES[0][0])
    inv_autoapprove = models.BooleanField(blank=True, default=False)
    inv_max_approval_amount = models.PositiveIntegerField(blank=True, default=0)
    inv_max_approval_currency = models.CharField(max_length=25, blank=True, default='usd')
    inv_req_attach = models.BooleanField(blank=True, default=True)
    inv_close_wo = models.CharField(max_length=255, choices=choices.CLOSE_WO_ON_APPROVAL_CHOICES,
        default=choices.CLOSE_WO_ON_APPROVAL_CHOICES[0][0])
    # Messages
    # TODO: are these "Email" or "SMS" messages, or any particular type?
    msg_address = models.BooleanField(blank=True, default=False,
        help_text="Enable Addressing")
    msg_viewall = models.BooleanField(blank=True, default=False)
    msg_copy_email = models.BooleanField(blank=True, default=False)
    msg_copy_default = models.BooleanField(blank=True, default=False)
    msg_stored_link = models.BooleanField(blank=True, default=False)

    # use as a normal Django Manager() to access related setting objects.
    main_settings = GenericRelation(MainSetting)
    custom_settings = GenericRelation(CustomSetting)

    class Meta:
        ordering = ('name',)

    def save(self, *args, **kwargs):

        if not self.group:
            try:
                self.group, created = Group.objects.get_or_create(name=self.name)
            except IntegrityError:
                raise

        if not self.default_auth_amount_currency:
            self.default_auth_amount_currency = Currency.objects.default()

        return super(Role, self).save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property 
    def _name(self):
        return self.__name__.lower()


class ProxyRole(BaseModel):
    '''
    A `Role` that can proxy for, or act on the behalf of, another `Role`
    '''
    role = models.ForeignKey(Role)


class PersonStatusManager(BaseManager):

    def default(self):
        obj, created = self.get_or_create(description=choices.PERSON_STATUS_CHOICES[0][0])
        return obj


class PersonStatus(AbstractName):
    description = models.CharField(max_length=100, choices=choices.PERSON_STATUS_CHOICES,
        default=choices.PERSON_STATUS_CHOICES[0][0])

    objects = PersonStatusManager()


class PersonQuerySet(models.query.QuerySet):
    pass


class PersonManager(UserManager):
    '''
    Auto exclude deleted records
    '''
    def get_queryset(self):
        return PersonQuerySet(self.model, using=self._db).filter(deleted__isnull=True)


@python_2_unicode_compatible
class Person(BaseModel, AbstractUser):
    '''
    "pw" : password
    "ooto" : out-of-the-office
    '''
    # Keys
    role = models.ForeignKey(Role)
    status = models.ForeignKey(PersonStatus, blank=True, null=True)
    location = models.ForeignKey(Location, blank=True, null=True)
    # required
    # Auth Amounts - can be defaulted by the Role
    auth_amount = models.DecimalField(max_digits=15, decimal_places=4, blank=True, default=0)
    auth_amount_currency = models.ForeignKey(Currency, blank=True, null=True)
    # TODO: currency will be a table with 5 columns, and this will 
    # be a FK on that table
    accept_assign = models.BooleanField(default=True, blank=True)
    accept_notify = models.BooleanField(default=True, blank=True)
    next_approver = models.ForeignKey("self", related_name='nextapprover', null=True)
    # optional
    employee_id = models.CharField(max_length=100, blank=True, null=True)
    middle_initial = models.CharField(max_length=1, blank=True, null=True)
    title = models.CharField(max_length=100, blank=True, null=True)
    # Passwords
    # TODO: use django default 1x PW logic here?
    # https://github.com/django/django/blob/master/django/contrib/auth/views.py (line #214)
    password_expire = models.DateField(blank=True, null=True)
    password_one_time = models.CharField(max_length=255, blank=True, null=True)
    password_change = models.TextField(help_text="Tuple of (datetime of PW change, old PW)") # was HStoreField, but not supported by model_mommy
    # Out-of-the-Office
    proxy_status = models.CharField("Out of the Office Status", max_length=100, blank=True, null=True)
    proxy_start_date = models.DateField("Out of the Office Status Start Date", max_length=100, blank=True, null=True)
    proxy_end_date = models.DateField("Out of the Office Status End Date", max_length=100, blank=True, null=True)
    proxy_user = models.ForeignKey("self", related_name='coveringuser', null=True)
    # TODO: add logs for:
    #   pw_chage_log, login_activity, user_history

    # use as a normal Django Manager() to access related setting objects.
    main_settings = GenericRelation(MainSetting)
    custom_settings = GenericRelation(CustomSetting)

    # Managers
    objects = PersonManager()
    objects_all = UserManager()

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        if not self.status:
            self.status = PersonStatus.objects.default()
        if not self.auth_amount:
            self.auth_amount = self.role.default_auth_amount
        if not self.auth_amount_currency:
            self.auth_amount_currency = Currency.objects.default()
        return super(Person, self).save(*args, **kwargs)
