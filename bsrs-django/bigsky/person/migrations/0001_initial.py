# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.postgres.fields
import person.models
import django.utils.timezone
from django.conf import settings
import django.core.validators
import uuid
import django.contrib.auth.models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0001_initial'),
        ('location', '0001_initial'),
        ('order', '0001_initial'),
        ('accounting', '0001_initial'),
        ('translation', '0001_initial'),
        ('auth', '0006_require_contenttypes_0002'),
    ]

    operations = [
        migrations.CreateModel(
            name='Person',
            fields=[
                ('password', models.CharField(verbose_name='password', max_length=128)),
                ('last_login', models.DateTimeField(blank=True, verbose_name='last login', null=True)),
                ('is_superuser', models.BooleanField(default=False, verbose_name='superuser status', help_text='Designates that this user has all permissions without explicitly assigning them.')),
                ('username', models.CharField(validators=[django.core.validators.RegexValidator('^[\\w.@+-]+$', 'Enter a valid username. This value may contain only letters, numbers and @/./+/-/_ characters.', 'invalid')], max_length=30, error_messages={'unique': 'A user with that username already exists.'}, verbose_name='username', unique=True, help_text='Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only.')),
                ('first_name', models.CharField(blank=True, verbose_name='first name', max_length=30)),
                ('last_name', models.CharField(blank=True, verbose_name='last name', max_length=30)),
                ('email', models.EmailField(blank=True, verbose_name='email address', max_length=254)),
                ('is_staff', models.BooleanField(default=False, verbose_name='staff status', help_text='Designates whether the user can log into this admin site.')),
                ('is_active', models.BooleanField(default=True, verbose_name='active', help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.')),
                ('date_joined', models.DateTimeField(verbose_name='date joined', default=django.utils.timezone.now)),
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('fullname', models.CharField(blank=True, max_length=50)),
                ('auth_amount', models.DecimalField(blank=True, max_digits=15, default=0, decimal_places=4)),
                ('accept_assign', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=True)),
                ('employee_id', models.CharField(blank=True, null=True, max_length=100)),
                ('middle_initial', models.CharField(blank=True, null=True, max_length=1)),
                ('title', models.CharField(blank=True, null=True, max_length=100)),
                ('password_length', models.PositiveIntegerField(blank=True, help_text='Store the length of the current password.', null=True)),
                ('password_expire_date', models.DateField(blank=True, help_text="Date that the Person's password will expire next. Based upon the ``password_expire`` days set on the Role.", null=True)),
                ('password_one_time', models.CharField(blank=True, null=True, max_length=255)),
                ('password_change', models.TextField(help_text='Tuple of (datetime of PW change, old PW)')),
                ('proxy_status', models.CharField(blank=True, verbose_name='Out of the Office Status', null=True, max_length=100)),
                ('proxy_start_date', models.DateField(blank=True, verbose_name='Out of the Office Status Start Date', null=True, max_length=100)),
                ('proxy_end_date', models.DateField(blank=True, verbose_name='Out of the Office Status End Date', null=True, max_length=100)),
                ('auth_currency', models.ForeignKey(to='accounting.Currency', null=True, blank=True)),
                ('groups', models.ManyToManyField(related_name='user_set', to='auth.Group', blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', verbose_name='groups', related_query_name='user')),
                ('locale', models.ForeignKey(to='translation.Locale', null=True, blank=True, help_text="If the Person has not 'Locale', the Accept-Language header will be used or the Site's system setting.")),
                ('locations', models.ManyToManyField(blank=True, related_name='people', to='location.Location')),
                ('next_approver', models.ForeignKey(related_name='nextapprover', to=settings.AUTH_USER_MODEL, null=True, blank=True)),
                ('proxy_user', models.ForeignKey(related_name='coveringuser', to=settings.AUTH_USER_MODEL, null=True, blank=True)),
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
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('description', models.CharField(choices=[('active', 'active'), ('two', 'two')], default='active', max_length=100)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.CreateModel(
            name='ProxyRole',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('role_type', models.CharField(blank=True, choices=[('Internal', 'Internal'), ('Third Party', 'Third Party')], default='Internal', max_length=29)),
                ('name', models.CharField(unique=True, help_text='Will be set to the Group Name', max_length=100)),
                ('dashboad_text', models.CharField(blank=True, max_length=255)),
                ('create_all', models.BooleanField(default=False, help_text='Allow document creation for all locations')),
                ('modules', models.TextField(blank=True)),
                ('dashboad_links', models.TextField(blank=True)),
                ('tabs', models.TextField(blank=True)),
                ('password_can_change', models.BooleanField(default=True)),
                ('password_min_length', models.PositiveIntegerField(blank=True, default=6)),
                ('password_history_length', django.contrib.postgres.fields.ArrayField(blank=True, size=None, base_field=models.PositiveIntegerField(help_text='Will be NULL if password length has never been changed.'), default=[])),
                ('password_digit_required', models.BooleanField(default=False)),
                ('password_lower_char_required', models.BooleanField(default=False)),
                ('password_upper_char_required', models.BooleanField(default=False)),
                ('password_special_char_required', models.BooleanField(default=False)),
                ('password_char_types', models.CharField(help_text='Password characters allowed', max_length=100)),
                ('password_expire', models.IntegerField(blank=True, default=90, help_text="Number of days after setting password that it will expire.If '0', password will never expire.")),
                ('password_expire_alert', models.BooleanField(default=True, help_text="Does the Person want to be alerted 'pre pw expiring'. Alerts start 3 days before password expires.")),
                ('password_expired_login_count', models.IntegerField(blank=True, null=True)),
                ('proxy_set', models.BooleanField(default=False, help_text='Users in this Role can set their own proxy')),
                ('default_accept_assign', models.BooleanField(default=True)),
                ('accept_assign', models.BooleanField(default=False)),
                ('default_accept_notify', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=False)),
                ('default_auth_amount', models.DecimalField(blank=True, max_digits=15, default=0, decimal_places=4)),
                ('allow_approval', models.BooleanField(default=False)),
                ('proxy_approval_bypass', models.BooleanField(default=False)),
                ('wo_notes', models.BooleanField(default=False)),
                ('wo_edit_closeout', models.BooleanField(default=False)),
                ('wo_show_inactive', models.BooleanField(default=False)),
                ('wo_show_tkt_attach', models.BooleanField(default=False)),
                ('wo_allow_backdate', models.BooleanField(default=False)),
                ('wo_days_backdate', models.PositiveIntegerField(blank=True, null=True)),
                ('inv_options', models.CharField(choices=[('new', 'new'), ('draft', 'draft')], default='new', max_length=255)),
                ('inv_wait', models.PositiveIntegerField(blank=True, null=True)),
                ('inv_select_assign', models.CharField(choices=[('all', 'all'), ('managers', 'managers')], default='all', max_length=255)),
                ('inv_autoapprove', models.BooleanField(default=False)),
                ('inv_max_approval_amount', models.PositiveIntegerField(blank=True, default=0)),
                ('inv_max_approval_currency', models.CharField(blank=True, default='usd', max_length=25)),
                ('inv_req_attach', models.BooleanField(default=True)),
                ('inv_close_wo', models.CharField(choices=[('Do not display', 'Do not display'), ('unchecked', 'unchecked'), ('checked', 'checked')], default='Do not display', max_length=255)),
                ('msg_address', models.BooleanField(default=False, help_text='Enable Addressing')),
                ('msg_viewall', models.BooleanField(default=False)),
                ('msg_copy_email', models.BooleanField(default=False)),
                ('msg_copy_default', models.BooleanField(default=False)),
                ('msg_stored_link', models.BooleanField(default=False)),
                ('categories', models.ManyToManyField(blank=True, to='category.Category')),
                ('default_auth_currency', models.ForeignKey(to='accounting.Currency', null=True, blank=True)),
                ('group', models.OneToOneField(to='auth.Group', null=True, blank=True)),
                ('inv_wo_status', models.ForeignKey(to='order.WorkOrderStatus', null=True, blank=True)),
                ('location_level', models.ForeignKey(to='location.LocationLevel', null=True, blank=True)),
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
            field=models.ForeignKey(to='person.PersonStatus', null=True, blank=True),
        ),
        migrations.AddField(
            model_name='person',
            name='user_permissions',
            field=models.ManyToManyField(related_name='user_set', to='auth.Permission', blank=True, help_text='Specific permissions for this user.', verbose_name='user permissions', related_query_name='user'),
        ),
    ]
