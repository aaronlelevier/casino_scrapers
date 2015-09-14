# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.postgres.fields
import django.contrib.auth.models
import django.utils.timezone
from django.conf import settings
import django.core.validators
import person.models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0001_initial'),
        ('order', '0001_initial'),
        ('auth', '0006_require_contenttypes_0002'),
        ('location', '0001_initial'),
        ('accounting', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Person',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(null=True, verbose_name='last login', blank=True)),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, max_length=30, validators=[django.core.validators.RegexValidator('^[\\w.@+-]+$', 'Enter a valid username. This value may contain only letters, numbers and @/./+/-/_ characters.', 'invalid')], help_text='Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only.', unique=True, verbose_name='username')),
                ('first_name', models.CharField(max_length=30, verbose_name='first name', blank=True)),
                ('last_name', models.CharField(max_length=30, verbose_name='last name', blank=True)),
                ('email', models.EmailField(max_length=254, verbose_name='email address', blank=True)),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('name', models.CharField(max_length=50, blank=True)),
                ('auth_amount', models.DecimalField(default=0, max_digits=15, decimal_places=4, blank=True)),
                ('accept_assign', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=True)),
                ('employee_id', models.CharField(max_length=100, null=True, blank=True)),
                ('middle_initial', models.CharField(max_length=1, null=True, blank=True)),
                ('title', models.CharField(max_length=100, null=True, blank=True)),
                ('password_length', models.PositiveIntegerField(help_text=b'Store the length of the current password.', null=True, blank=True)),
                ('password_expire_date', models.DateField(help_text=b"Date that the Person's password will expire next. Based upon the ``password_expire`` days set on the Role.", null=True, blank=True)),
                ('password_one_time', models.CharField(max_length=255, null=True, blank=True)),
                ('password_change', models.TextField(help_text=b'Tuple of (datetime of PW change, old PW)')),
                ('proxy_status', models.CharField(max_length=100, null=True, verbose_name=b'Out of the Office Status', blank=True)),
                ('proxy_start_date', models.DateField(max_length=100, null=True, verbose_name=b'Out of the Office Status Start Date', blank=True)),
                ('proxy_end_date', models.DateField(max_length=100, null=True, verbose_name=b'Out of the Office Status End Date', blank=True)),
                ('auth_currency', models.ForeignKey(blank=True, to='accounting.Currency', null=True)),
                ('groups', models.ManyToManyField(related_query_name='user', related_name='user_set', to='auth.Group', blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', verbose_name='groups')),
                ('locale', models.ForeignKey(blank=True, to='translation.Locale', help_text=b"If the Person has not 'Locale', the Accept-Language header will be used or the Site's system setting.", null=True)),
                ('locations', models.ManyToManyField(related_name='people', to='location.Location', blank=True)),
                ('next_approver', models.ForeignKey(related_name='nextapprover', blank=True, to=settings.AUTH_USER_MODEL, null=True)),
                ('proxy_user', models.ForeignKey(related_name='coveringuser', blank=True, to=settings.AUTH_USER_MODEL, null=True)),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
            managers=[
                ('objects', person.models.PersonManager()),
                ('objects_all', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='PersonStatus',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('description', models.CharField(default=b'active', max_length=100, choices=[(b'active', b'active'), (b'two', b'two')])),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ProxyRole',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('role_type', models.CharField(default=b'Internal', max_length=29, blank=True, choices=[(b'Internal', b'Internal'), (b'Third Party', b'Third Party')])),
                ('name', models.CharField(help_text=b'Will be set to the Group Name', unique=True, max_length=100)),
                ('dashboad_text', models.CharField(max_length=255, blank=True)),
                ('create_all', models.BooleanField(default=False, help_text=b'Allow document creation for all locations')),
                ('modules', models.TextField(blank=True)),
                ('dashboad_links', models.TextField(blank=True)),
                ('tabs', models.TextField(blank=True)),
                ('password_can_change', models.BooleanField(default=True)),
                ('password_min_length', models.PositiveIntegerField(default=6, blank=True)),
                ('password_history_length', django.contrib.postgres.fields.ArrayField(default=[], size=None, base_field=models.PositiveIntegerField(help_text=b'Will be NULL if password length has never been changed.'), blank=True)),
                ('password_digit_required', models.BooleanField(default=False)),
                ('password_lower_char_required', models.BooleanField(default=False)),
                ('password_upper_char_required', models.BooleanField(default=False)),
                ('password_special_char_required', models.BooleanField(default=False)),
                ('password_char_types', models.CharField(help_text=b'Password characters allowed', max_length=100)),
                ('password_expire', models.IntegerField(default=90, help_text=b"Number of days after setting password that it will expire.If '0', password will never expire.", blank=True)),
                ('password_expire_alert', models.BooleanField(default=True, help_text=b"Does the Person want to be alerted 'pre pw expiring'. Alerts start 3 days before password expires.")),
                ('password_expired_login_count', models.IntegerField(null=True, blank=True)),
                ('proxy_set', models.BooleanField(default=False, help_text=b'Users in this Role can set their own proxy')),
                ('default_accept_assign', models.BooleanField(default=True)),
                ('accept_assign', models.BooleanField(default=False)),
                ('default_accept_notify', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=False)),
                ('default_auth_amount', models.DecimalField(default=0, max_digits=15, decimal_places=4, blank=True)),
                ('allow_approval', models.BooleanField(default=False)),
                ('proxy_approval_bypass', models.BooleanField(default=False)),
                ('wo_notes', models.BooleanField(default=False)),
                ('wo_edit_closeout', models.BooleanField(default=False)),
                ('wo_show_inactive', models.BooleanField(default=False)),
                ('wo_show_tkt_attach', models.BooleanField(default=False)),
                ('wo_allow_backdate', models.BooleanField(default=False)),
                ('wo_days_backdate', models.PositiveIntegerField(null=True, blank=True)),
                ('inv_options', models.CharField(default=b'new', max_length=255, choices=[(b'new', b'new'), (b'draft', b'draft')])),
                ('inv_wait', models.PositiveIntegerField(null=True, blank=True)),
                ('inv_select_assign', models.CharField(default=b'all', max_length=255, choices=[(b'all', b'all'), (b'managers', b'managers')])),
                ('inv_autoapprove', models.BooleanField(default=False)),
                ('inv_max_approval_amount', models.PositiveIntegerField(default=0, blank=True)),
                ('inv_max_approval_currency', models.CharField(default=b'usd', max_length=25, blank=True)),
                ('inv_req_attach', models.BooleanField(default=True)),
                ('inv_close_wo', models.CharField(default=b'Do not display', max_length=255, choices=[(b'Do not display', b'Do not display'), (b'unchecked', b'unchecked'), (b'checked', b'checked')])),
                ('msg_address', models.BooleanField(default=False, help_text=b'Enable Addressing')),
                ('msg_viewall', models.BooleanField(default=False)),
                ('msg_copy_email', models.BooleanField(default=False)),
                ('msg_copy_default', models.BooleanField(default=False)),
                ('msg_stored_link', models.BooleanField(default=False)),
                ('default_auth_currency', models.ForeignKey(blank=True, to='accounting.Currency', null=True)),
                ('group', models.OneToOneField(null=True, blank=True, to='auth.Group')),
                ('inv_wo_status', models.ForeignKey(blank=True, to='order.WorkOrderStatus', null=True)),
                ('location_level', models.ForeignKey(blank=True, to='location.LocationLevel', null=True)),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
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
            field=models.ForeignKey(blank=True, to='person.PersonStatus', null=True),
        ),
        migrations.AddField(
            model_name='person',
            name='user_permissions',
            field=models.ManyToManyField(related_query_name='user', related_name='user_set', to='auth.Permission', blank=True, help_text='Specific permissions for this user.', verbose_name='user permissions'),
        ),
    ]
