'''
Created on Jan 30, 2014

@author: tkrier
'''
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User, Group
from django.utils.encoding import python_2_unicode_compatible
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.contrib.contenttypes.fields import GenericRelation
from django.core.exceptions import ValidationError

from location.models import LocationLevel, Location
from order.models import WorkOrderStatus
from util import choices
from util import exceptions as excp
from util.models import AbstractName, MainSetting, CustomSetting, BaseModel


@python_2_unicode_compatible
class Role(BaseModel):
    # keys
    group = models.OneToOneField(Group) # each ``Group`` has a name
    location_level = models.ForeignKey(LocationLevel, null=True, blank=True)
    role_type = models.CharField(max_length=29,
                                 choices=choices.ROLE_TYPE_CHOICES,
                                 default=choices.ROLE_TYPE_CHOICES[0][0])
    # required
    
    # optional
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
    password_expire = models.PositiveIntegerField(
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
    default_auth_amount = models.BooleanField(blank=True, default=True)
    auth_amount = models.PositiveIntegerField(blank=True, null=True)
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
        db_table = 'role_role'
        ordering = ('group__name',)
        permissions = (
            ('view_role', 'can view role'),
        )

    def __str__(self):
        return self.group.name

    @property 
    def _name(self):
        return self.__name__.lower()


class ProxyRole(BaseModel):
    role = models.ForeignKey(Role)


class PersonStatus(AbstractName):
    description = models.CharField(max_length=100, choices=choices.PERSON_STATUS_CHOICES,
        default=choices.PERSON_STATUS_CHOICES[0][0])


@python_2_unicode_compatible
class Person(User):
    '''
    "pw" : password
    "ooto" : out-of-the-office
    '''
    # Keys
    role = models.ForeignKey(Role)
    status = models.ForeignKey(PersonStatus)
    location = models.ForeignKey(Location, blank=True, null=True)
    # required
    auth_amount = models.PositiveIntegerField(blank=True, default=0)
    auth_amount_currency = models.CharField(max_length=25,
                                            choices=choices.CURRENCY_CHOICES,
                                            default=choices.CURRENCY_CHOICES[0][0])
    accept_assign = models.BooleanField(default=True, blank=True)
    accept_notify = models.BooleanField(default=True, blank=True)
    # optional
    emp_number = models.CharField(max_length=100, blank=True, null=True)
    middle_initial = models.CharField(max_length=30, blank=True, null=True)
    title = models.CharField(max_length=100, blank=True, null=True)
    password_expiration = models.DateField(blank=True, null=True)
    # TODO: use django default 1x PW logic here?
    # https://github.com/django/django/blob/master/django/contrib/auth/views.py (line #214)
    password_one_time = models.CharField(max_length=255, blank=True, null=True)
    ooto_status = models.CharField("Out of the Office Status", max_length=100, blank=True, null=True)
    ooto_start_date = models.DateField("Out of the Office Status Start Date", max_length=100, blank=True, null=True)
    ooto_end_date = models.DateField("Out of the Office Status End Date", max_length=100, blank=True, null=True)
    # TODO: add logs for:
    #   pw_chage_log, login_activity, user_history
    
    # use as a normal Django Manager() to access related setting objects.
    main_settings = GenericRelation(MainSetting)
    custom_settings = GenericRelation(CustomSetting)

    class Meta:
        db_table = 'person_person'

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        if not (self.first_name or self.last_name):
            raise excp.PersonFLNameRequired
        return super(Person, self).save(*args, **kwargs)


class NextApprover(BaseModel):
    "A Person can only have one next-approver"
    person = models.OneToOneField(Person)


class CoveringUser(BaseModel):
    '''Person that covers for another Person when they are 
     out-of-the-office.'''
    person = models.OneToOneField(Person)