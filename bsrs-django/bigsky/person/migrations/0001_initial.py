# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import django.contrib.auth.models
import person.models
import uuid
import django.contrib.postgres.fields
import django.utils.timezone
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0001_initial'),
        ('translation', '0001_initial'),
        ('accounting', '0001_initial'),
        ('order', '0001_initial'),
        ('auth', '0006_require_contenttypes_0002'),
        ('category', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Person',
            fields=[
                ('password', models.CharField(verbose_name='password', max_length=128)),
                ('last_login', models.DateTimeField(null=True, verbose_name='last login', blank=True)),
                ('is_superuser', models.BooleanField(verbose_name='superuser status', default=False, help_text='Designates that this user has all permissions without explicitly assigning them.')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only.', verbose_name='username', max_length=30, unique=True, validators=[django.core.validators.RegexValidator('^[\\w.@+-]+$', 'Enter a valid username. This value may contain only letters, numbers and @/./+/-/_ characters.', 'invalid')])),
                ('first_name', models.CharField(verbose_name='first name', max_length=30, blank=True)),
                ('last_name', models.CharField(verbose_name='last name', max_length=30, blank=True)),
                ('email', models.EmailField(verbose_name='email address', max_length=254, blank=True)),
                ('is_staff', models.BooleanField(verbose_name='staff status', default=False, help_text='Designates whether the user can log into this admin site.')),
                ('is_active', models.BooleanField(verbose_name='active', default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.')),
                ('date_joined', models.DateTimeField(verbose_name='date joined', default=django.utils.timezone.now)),
                ('id', models.UUIDField(editable=False, serialize=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('fullname', models.CharField(max_length=50, blank=True)),
                ('auth_amount', models.DecimalField(max_digits=15, default=0, decimal_places=4, blank=True)),
                ('accept_assign', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=True)),
                ('employee_id', models.CharField(null=True, max_length=100, blank=True)),
                ('middle_initial', models.CharField(null=True, max_length=1, blank=True)),
                ('title', models.CharField(null=True, max_length=100, blank=True)),
                ('password_length', models.PositiveIntegerField(null=True, help_text='Store the length of the current password.', blank=True)),
                ('password_expire_date', models.DateField(null=True, help_text="Date that the Person's password will expire next. Based upon the ``password_expire`` days set on the Role.", blank=True)),
                ('password_one_time', models.CharField(null=True, max_length=255, blank=True)),
                ('password_change', models.TextField(help_text='Tuple of (datetime of PW change, old PW)')),
                ('password_history', django.contrib.postgres.fields.ArrayField(default=[], base_field=models.CharField(max_length=254), blank=True, size=None)),
                ('proxy_status', models.CharField(null=True, max_length=100, verbose_name='Out of the Office Status', blank=True)),
                ('proxy_start_date', models.DateField(null=True, max_length=100, verbose_name='Out of the Office Status Start Date', blank=True)),
                ('proxy_end_date', models.DateField(null=True, max_length=100, verbose_name='Out of the Office Status End Date', blank=True)),
                ('auth_currency', models.ForeignKey(to='accounting.Currency', blank=True, null=True)),
                ('groups', models.ManyToManyField(blank=True, to='auth.Group', help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', verbose_name='groups', related_query_name='user')),
                ('locale', models.ForeignKey(help_text="If the Person has not 'Locale', the Accept-Language header will be used or the Site's system setting.", blank=True, null=True, to='translation.Locale')),
                ('locations', models.ManyToManyField(to='location.Location', related_name='people', blank=True)),
                ('next_approver', models.ForeignKey(to=settings.AUTH_USER_MODEL, related_name='nextapprover', blank=True, null=True)),
                ('proxy_user', models.ForeignKey(to=settings.AUTH_USER_MODEL, related_name='coveringuser', blank=True, null=True)),
            ],
            options={
                'ordering': ('fullname',),
            },
            managers=[
                ('objects', person.models.PersonManager()),
                ('objects_all', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='PersonStatus',
            fields=[
                ('id', models.UUIDField(editable=False, serialize=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('default', models.BooleanField(default=False)),
            ],
            options={
                'abstract': False,
                'ordering': ('name',),
            },
        ),
        migrations.CreateModel(
            name='ProxyRole',
            fields=[
                ('id', models.UUIDField(editable=False, serialize=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.UUIDField(editable=False, serialize=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('role_type', models.CharField(max_length=29, choices=[('Internal', 'Internal'), ('Third Party', 'Third Party')], default='Internal', blank=True)),
                ('name', models.CharField(max_length=100, help_text='Will be set to the Group Name', unique=True)),
                ('dashboad_text', models.CharField(max_length=255, blank=True)),
                ('create_all', models.BooleanField(default=False, help_text='Allow document creation for all locations')),
                ('modules', models.TextField(blank=True)),
                ('dashboad_links', models.TextField(blank=True)),
                ('tabs', models.TextField(blank=True)),
                ('password_can_change', models.BooleanField(default=True)),
                ('password_min_length', models.PositiveIntegerField(default=6, blank=True)),
                ('password_history_length', django.contrib.postgres.fields.ArrayField(default=[], base_field=models.PositiveIntegerField(help_text='Will be NULL if password length has never been changed.'), blank=True, size=None)),
                ('password_digit_required', models.BooleanField(default=False)),
                ('password_lower_char_required', models.BooleanField(default=False)),
                ('password_upper_char_required', models.BooleanField(default=False)),
                ('password_special_char_required', models.BooleanField(default=False)),
                ('password_char_types', models.CharField(max_length=100, help_text='Password characters allowed')),
                ('password_expire', models.IntegerField(default=90, help_text="Number of days after setting password that it will expire.If '0', password will never expire.", blank=True)),
                ('password_expire_alert', models.BooleanField(default=True, help_text="Does the Person want to be alerted 'pre pw expiring'. Alerts start 3 days before password expires.")),
                ('password_expired_login_count', models.IntegerField(null=True, blank=True)),
                ('proxy_set', models.BooleanField(default=False, help_text='Users in this Role can set their own proxy')),
                ('default_accept_assign', models.BooleanField(default=True)),
                ('accept_assign', models.BooleanField(default=False)),
                ('default_accept_notify', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=False)),
                ('default_auth_amount', models.DecimalField(max_digits=15, default=0, decimal_places=4, blank=True)),
                ('allow_approval', models.BooleanField(default=False)),
                ('proxy_approval_bypass', models.BooleanField(default=False)),
                ('wo_notes', models.BooleanField(default=False)),
                ('wo_edit_closeout', models.BooleanField(default=False)),
                ('wo_show_inactive', models.BooleanField(default=False)),
                ('wo_show_tkt_attach', models.BooleanField(default=False)),
                ('wo_allow_backdate', models.BooleanField(default=False)),
                ('wo_days_backdate', models.PositiveIntegerField(null=True, blank=True)),
                ('inv_options', models.CharField(max_length=255, choices=[('new', 'new'), ('draft', 'draft')], default='new')),
                ('inv_wait', models.PositiveIntegerField(null=True, blank=True)),
                ('inv_select_assign', models.CharField(max_length=255, choices=[('all', 'all'), ('managers', 'managers')], default='all')),
                ('inv_autoapprove', models.BooleanField(default=False)),
                ('inv_max_approval_amount', models.PositiveIntegerField(default=0, blank=True)),
                ('inv_max_approval_currency', models.CharField(max_length=25, default='usd', blank=True)),
                ('inv_req_attach', models.BooleanField(default=True)),
                ('inv_close_wo', models.CharField(max_length=255, choices=[('Do not display', 'Do not display'), ('unchecked', 'unchecked'), ('checked', 'checked')], default='Do not display')),
                ('msg_address', models.BooleanField(default=False, help_text='Enable Addressing')),
                ('msg_viewall', models.BooleanField(default=False)),
                ('msg_copy_email', models.BooleanField(default=False)),
                ('msg_copy_default', models.BooleanField(default=False)),
                ('msg_stored_link', models.BooleanField(default=False)),
                ('categories', models.ManyToManyField(to='category.Category', blank=True)),
                ('default_auth_currency', models.ForeignKey(to='accounting.Currency', blank=True, null=True)),
                ('group', models.OneToOneField(blank=True, null=True, to='auth.Group')),
                ('inv_wo_status', models.ForeignKey(to='order.WorkOrderStatus', blank=True, null=True)),
                ('location_level', models.ForeignKey(to='location.LocationLevel', blank=True, null=True)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.AddField(
            model_name='proxyrole',
            name='role',
            field=models.ForeignKey(to='person.Role'),
        ),
        migrations.AddField(
            model_name='person',
            name='role',
            field=models.ForeignKey(to='person.Role'),
        ),
        migrations.AddField(
            model_name='person',
            name='status',
            field=models.ForeignKey(to='person.PersonStatus', blank=True, null=True),
        ),
        migrations.AddField(
            model_name='person',
            name='user_permissions',
            field=models.ManyToManyField(blank=True, to='auth.Permission', help_text='Specific permissions for this user.', related_name='user_set', verbose_name='user permissions', related_query_name='user'),
        ),
    ]
