# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid
from django.conf import settings
import person.models
import django.utils.timezone
import django.contrib.auth.models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('order', '0001_initial'),
        ('accounting', '0001_initial'),
        ('location', '0001_initial'),
        ('auth', '0006_require_contenttypes_0002'),
        ('translation', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Person',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(null=True, blank=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(help_text='Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only.', verbose_name='username', validators=[django.core.validators.RegexValidator('^[\\w.@+-]+$', 'Enter a valid username. This value may contain only letters, numbers and @/./+/-/_ characters.', 'invalid')], max_length=30, unique=True, error_messages={'unique': 'A user with that username already exists.'})),
                ('first_name', models.CharField(max_length=30, blank=True, verbose_name='first name')),
                ('last_name', models.CharField(max_length=30, blank=True, verbose_name='last name')),
                ('email', models.EmailField(max_length=254, blank=True, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('id', models.UUIDField(primary_key=True, serialize=False, editable=False, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.')),
                ('auth_amount', models.DecimalField(max_digits=15, decimal_places=4, blank=True, default=0)),
                ('accept_assign', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=True)),
                ('employee_id', models.CharField(null=True, max_length=100, blank=True)),
                ('middle_initial', models.CharField(null=True, max_length=1, blank=True)),
                ('title', models.CharField(null=True, max_length=100, blank=True)),
                ('password_expire', models.DateField(null=True, blank=True)),
                ('password_one_time', models.CharField(null=True, max_length=255, blank=True)),
                ('password_change', models.TextField(help_text='Tuple of (datetime of PW change, old PW)')),
                ('proxy_status', models.CharField(null=True, max_length=100, blank=True, verbose_name='Out of the Office Status')),
                ('proxy_start_date', models.DateField(null=True, max_length=100, blank=True, verbose_name='Out of the Office Status Start Date')),
                ('proxy_end_date', models.DateField(null=True, max_length=100, blank=True, verbose_name='Out of the Office Status End Date')),
                ('auth_currency', models.ForeignKey(null=True, blank=True, to='accounting.Currency')),
                ('groups', models.ManyToManyField(to='auth.Group', blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', verbose_name='groups', related_query_name='user', related_name='user_set')),
                ('locale', models.ForeignKey(to='translation.Locale', null=True, blank=True, help_text="If the Person has not 'Locale', the Accept-Language header will be used or the Site's system setting.")),
                ('locations', models.ManyToManyField(blank=True, to='location.Location', related_name='people')),
                ('next_approver', models.ForeignKey(null=True, blank=True, to=settings.AUTH_USER_MODEL, related_name='nextapprover')),
                ('proxy_user', models.ForeignKey(null=True, blank=True, to=settings.AUTH_USER_MODEL, related_name='coveringuser')),
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
                ('id', models.UUIDField(primary_key=True, serialize=False, editable=False, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.CharField(choices=[('active', 'active'), ('two', 'two')], max_length=100, default='active')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ProxyRole',
            fields=[
                ('id', models.UUIDField(primary_key=True, serialize=False, editable=False, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.')),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.UUIDField(primary_key=True, serialize=False, editable=False, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.')),
                ('role_type', models.CharField(choices=[('Internal', 'Internal'), ('Third Party', 'Third Party')], max_length=29, blank=True, default='Internal')),
                ('name', models.CharField(max_length=100, help_text='Will be set to the Group Name', unique=True)),
                ('dashboad_text', models.CharField(max_length=255, blank=True)),
                ('create_all', models.BooleanField(help_text='Allow document creation for all locations', default=False)),
                ('modules', models.TextField(blank=True)),
                ('dashboad_links', models.TextField(blank=True)),
                ('tabs', models.TextField(blank=True)),
                ('password_min_length', models.PositiveIntegerField(blank=True, default=6)),
                ('password_history_length', models.PositiveIntegerField(null=True, blank=True, help_text='Will be NULL if password length has never been changed.')),
                ('password_char_types', models.CharField(max_length=100, help_text='Password characters allowed')),
                ('password_expire', models.PositiveIntegerField(null=True, blank=True, help_text='Number of days after setting password that it will expire.')),
                ('password_expire_alert', models.BooleanField(help_text="Does the Person want to be alerted 'pre pw expiring'. Alerts start 3 days before password expires.", default=True)),
                ('proxy_set', models.BooleanField(help_text='Users in this Role can set their own proxy', default=False)),
                ('default_accept_assign', models.BooleanField(default=True)),
                ('accept_assign', models.BooleanField(default=False)),
                ('default_accept_notify', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=False)),
                ('default_auth_amount', models.DecimalField(max_digits=15, decimal_places=4, blank=True, default=0)),
                ('allow_approval', models.BooleanField(default=False)),
                ('proxy_approval_bypass', models.BooleanField(default=False)),
                ('wo_notes', models.BooleanField(default=False)),
                ('wo_edit_closeout', models.BooleanField(default=False)),
                ('wo_show_inactive', models.BooleanField(default=False)),
                ('wo_show_tkt_attach', models.BooleanField(default=False)),
                ('wo_allow_backdate', models.BooleanField(default=False)),
                ('wo_days_backdate', models.PositiveIntegerField(null=True, blank=True)),
                ('inv_options', models.CharField(choices=[('new', 'new'), ('draft', 'draft')], max_length=255, default='new')),
                ('inv_wait', models.PositiveIntegerField(null=True, blank=True)),
                ('inv_select_assign', models.CharField(choices=[('all', 'all'), ('managers', 'managers')], max_length=255, default='all')),
                ('inv_autoapprove', models.BooleanField(default=False)),
                ('inv_max_approval_amount', models.PositiveIntegerField(blank=True, default=0)),
                ('inv_max_approval_currency', models.CharField(max_length=25, blank=True, default='usd')),
                ('inv_req_attach', models.BooleanField(default=True)),
                ('inv_close_wo', models.CharField(choices=[('Do not display', 'Do not display'), ('unchecked', 'unchecked'), ('checked', 'checked')], max_length=255, default='Do not display')),
                ('msg_address', models.BooleanField(help_text='Enable Addressing', default=False)),
                ('msg_viewall', models.BooleanField(default=False)),
                ('msg_copy_email', models.BooleanField(default=False)),
                ('msg_copy_default', models.BooleanField(default=False)),
                ('msg_stored_link', models.BooleanField(default=False)),
                ('default_auth_currency', models.ForeignKey(null=True, blank=True, to='accounting.Currency')),
                ('group', models.OneToOneField(null=True, blank=True, to='auth.Group')),
                ('inv_wo_status', models.ForeignKey(null=True, blank=True, to='order.WorkOrderStatus')),
                ('location_level', models.ForeignKey(null=True, blank=True, to='location.LocationLevel')),
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
            field=models.ForeignKey(null=True, blank=True, to='person.PersonStatus'),
        ),
        migrations.AddField(
            model_name='person',
            name='user_permissions',
            field=models.ManyToManyField(to='auth.Permission', blank=True, help_text='Specific permissions for this user.', verbose_name='user permissions', related_query_name='user', related_name='user_set'),
        ),
    ]
