# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import person.models
import uuid
import django.utils.timezone
from django.conf import settings
import django.core.validators
import django.contrib.auth.models
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0001_initial'),
        ('auth', '0006_require_contenttypes_0002'),
        ('translation', '0001_initial'),
        ('location', '0001_initial'),
        ('order', '0001_initial'),
        ('accounting', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Person',
            fields=[
                ('password', models.CharField(verbose_name='password', max_length=128)),
                ('last_login', models.DateTimeField(null=True, verbose_name='last login', blank=True)),
                ('is_superuser', models.BooleanField(verbose_name='superuser status', default=False, help_text='Designates that this user has all permissions without explicitly assigning them.')),
                ('username', models.CharField(unique=True, max_length=30, error_messages={'unique': 'A user with that username already exists.'}, verbose_name='username', help_text='Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only.', validators=[django.core.validators.RegexValidator('^[\\w.@+-]+$', 'Enter a valid username. This value may contain only letters, numbers and @/./+/-/_ characters.', 'invalid')])),
                ('first_name', models.CharField(verbose_name='first name', max_length=30, blank=True)),
                ('last_name', models.CharField(verbose_name='last name', max_length=30, blank=True)),
                ('email', models.EmailField(verbose_name='email address', max_length=254, blank=True)),
                ('is_staff', models.BooleanField(verbose_name='staff status', default=False, help_text='Designates whether the user can log into this admin site.')),
                ('is_active', models.BooleanField(verbose_name='active', default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.')),
                ('date_joined', models.DateTimeField(verbose_name='date joined', default=django.utils.timezone.now)),
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('fullname', models.CharField(max_length=50, blank=True)),
                ('auth_amount', models.DecimalField(decimal_places=4, default=0, blank=True, max_digits=15)),
                ('accept_assign', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=True)),
                ('employee_id', models.CharField(null=True, max_length=100, blank=True)),
                ('middle_initial', models.CharField(null=True, max_length=1, blank=True)),
                ('title', models.CharField(null=True, max_length=100, blank=True)),
                ('password_length', models.PositiveIntegerField(null=True, help_text='Store the length of the current password.', blank=True)),
                ('password_expire_date', models.DateField(null=True, help_text="Date that the Person's password will expire next. Based upon the ``password_expire`` days set on the Role.", blank=True)),
                ('password_one_time', models.CharField(null=True, max_length=255, blank=True)),
                ('password_change', models.TextField(help_text='Tuple of (datetime of PW change, old PW)')),
                ('password_history', django.contrib.postgres.fields.ArrayField(size=None, default=[], blank=True, base_field=models.CharField(max_length=254))),
                ('proxy_status', models.CharField(null=True, verbose_name='Out of the Office Status', max_length=100, blank=True)),
                ('proxy_start_date', models.DateField(null=True, verbose_name='Out of the Office Status Start Date', max_length=100, blank=True)),
                ('proxy_end_date', models.DateField(null=True, verbose_name='Out of the Office Status End Date', max_length=100, blank=True)),
                ('auth_currency', models.ForeignKey(null=True, blank=True, to='accounting.Currency')),
                ('groups', models.ManyToManyField(related_name='user_set', blank=True, to='auth.Group', verbose_name='groups', related_query_name='user', help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.')),
                ('locale', models.ForeignKey(null=True, help_text="If the Person has not 'Locale', the Accept-Language header will be used or the Site's system setting.", blank=True, to='translation.Locale')),
                ('locations', models.ManyToManyField(related_name='people', to='location.Location', blank=True)),
                ('next_approver', models.ForeignKey(null=True, blank=True, related_name='nextapprover', to=settings.AUTH_USER_MODEL)),
                ('proxy_user', models.ForeignKey(null=True, blank=True, related_name='coveringuser', to=settings.AUTH_USER_MODEL)),
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
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('description', models.CharField(default='active', max_length=100, choices=[('active', 'active'), ('two', 'two')])),
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
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('role_type', models.CharField(default='Internal', max_length=29, blank=True, choices=[('Internal', 'Internal'), ('Third Party', 'Third Party')])),
                ('name', models.CharField(unique=True, help_text='Will be set to the Group Name', max_length=100)),
                ('dashboad_text', models.CharField(max_length=255, blank=True)),
                ('create_all', models.BooleanField(default=False, help_text='Allow document creation for all locations')),
                ('modules', models.TextField(blank=True)),
                ('dashboad_links', models.TextField(blank=True)),
                ('tabs', models.TextField(blank=True)),
                ('password_can_change', models.BooleanField(default=True)),
                ('password_min_length', models.PositiveIntegerField(default=6, blank=True)),
                ('password_history_length', django.contrib.postgres.fields.ArrayField(size=None, default=[], blank=True, base_field=models.PositiveIntegerField(help_text='Will be NULL if password length has never been changed.'))),
                ('password_digit_required', models.BooleanField(default=False)),
                ('password_lower_char_required', models.BooleanField(default=False)),
                ('password_upper_char_required', models.BooleanField(default=False)),
                ('password_special_char_required', models.BooleanField(default=False)),
                ('password_char_types', models.CharField(help_text='Password characters allowed', max_length=100)),
                ('password_expire', models.IntegerField(default=90, help_text="Number of days after setting password that it will expire.If '0', password will never expire.", blank=True)),
                ('password_expire_alert', models.BooleanField(default=True, help_text="Does the Person want to be alerted 'pre pw expiring'. Alerts start 3 days before password expires.")),
                ('password_expired_login_count', models.IntegerField(null=True, blank=True)),
                ('proxy_set', models.BooleanField(default=False, help_text='Users in this Role can set their own proxy')),
                ('default_accept_assign', models.BooleanField(default=True)),
                ('accept_assign', models.BooleanField(default=False)),
                ('default_accept_notify', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=False)),
                ('default_auth_amount', models.DecimalField(decimal_places=4, default=0, blank=True, max_digits=15)),
                ('allow_approval', models.BooleanField(default=False)),
                ('proxy_approval_bypass', models.BooleanField(default=False)),
                ('wo_notes', models.BooleanField(default=False)),
                ('wo_edit_closeout', models.BooleanField(default=False)),
                ('wo_show_inactive', models.BooleanField(default=False)),
                ('wo_show_tkt_attach', models.BooleanField(default=False)),
                ('wo_allow_backdate', models.BooleanField(default=False)),
                ('wo_days_backdate', models.PositiveIntegerField(null=True, blank=True)),
                ('inv_options', models.CharField(default='new', max_length=255, choices=[('new', 'new'), ('draft', 'draft')])),
                ('inv_wait', models.PositiveIntegerField(null=True, blank=True)),
                ('inv_select_assign', models.CharField(default='all', max_length=255, choices=[('all', 'all'), ('managers', 'managers')])),
                ('inv_autoapprove', models.BooleanField(default=False)),
                ('inv_max_approval_amount', models.PositiveIntegerField(default=0, blank=True)),
                ('inv_max_approval_currency', models.CharField(default='usd', max_length=25, blank=True)),
                ('inv_req_attach', models.BooleanField(default=True)),
                ('inv_close_wo', models.CharField(default='Do not display', max_length=255, choices=[('Do not display', 'Do not display'), ('unchecked', 'unchecked'), ('checked', 'checked')])),
                ('msg_address', models.BooleanField(default=False, help_text='Enable Addressing')),
                ('msg_viewall', models.BooleanField(default=False)),
                ('msg_copy_email', models.BooleanField(default=False)),
                ('msg_copy_default', models.BooleanField(default=False)),
                ('msg_stored_link', models.BooleanField(default=False)),
                ('categories', models.ManyToManyField(to='category.Category', blank=True)),
                ('default_auth_currency', models.ForeignKey(null=True, blank=True, to='accounting.Currency')),
                ('group', models.OneToOneField(null=True, blank=True, to='auth.Group')),
                ('inv_wo_status', models.ForeignKey(null=True, blank=True, to='order.WorkOrderStatus')),
                ('location_level', models.ForeignKey(null=True, blank=True, to='location.LocationLevel')),
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
            field=models.ForeignKey(null=True, blank=True, to='person.PersonStatus'),
        ),
        migrations.AddField(
            model_name='person',
            name='user_permissions',
            field=models.ManyToManyField(related_name='user_set', blank=True, to='auth.Permission', verbose_name='user permissions', related_query_name='user', help_text='Specific permissions for this user.'),
        ),
    ]
