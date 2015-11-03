# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid
import django.utils.timezone
import person.models
import django.contrib.auth.models
from django.conf import settings
import django.contrib.postgres.fields
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0001_initial'),
        ('category', '0001_initial'),
        ('auth', '0006_require_contenttypes_0002'),
        ('location', '0001_initial'),
        ('accounting', '0001_initial'),
        ('order', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Person',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(help_text='Designates that this user has all permissions without explicitly assigning them.', default=False, verbose_name='superuser status')),
                ('username', models.CharField(max_length=30, unique=True, validators=[django.core.validators.RegexValidator('^[\\w.@+-]+$', 'Enter a valid username. This value may contain only letters, numbers and @/./+/-/_ characters.', 'invalid')], help_text='Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only.', error_messages={'unique': 'A user with that username already exists.'}, verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=30, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=30, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(help_text='Designates whether the user can log into this admin site.', default=False, verbose_name='staff status')),
                ('is_active', models.BooleanField(help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', default=True, verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('fullname', models.CharField(blank=True, max_length=50)),
                ('auth_amount', models.DecimalField(blank=True, decimal_places=4, default=0, max_digits=15)),
                ('accept_assign', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=True)),
                ('employee_id', models.CharField(blank=True, max_length=100, null=True)),
                ('middle_initial', models.CharField(blank=True, max_length=1, null=True)),
                ('title', models.CharField(blank=True, max_length=100, null=True)),
                ('password_length', models.PositiveIntegerField(help_text='Store the length of the current password.', blank=True, null=True)),
                ('password_expire_date', models.DateField(help_text="Date that the Person's password will expire next. Based upon the ``password_expire`` days set on the Role.", blank=True, null=True)),
                ('password_one_time', models.CharField(blank=True, max_length=255, null=True)),
                ('password_change', models.DateTimeField(help_text='DateTime of last password change', blank=True, null=True)),
                ('password_history', django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=254), blank=True, size=5, default=[])),
                ('proxy_status', models.CharField(blank=True, max_length=100, null=True, verbose_name='Out of the Office Status')),
                ('proxy_start_date', models.DateField(blank=True, max_length=100, null=True, verbose_name='Out of the Office Status Start Date')),
                ('proxy_end_date', models.DateField(blank=True, max_length=100, null=True, verbose_name='Out of the Office Status End Date')),
                ('auth_currency', models.ForeignKey(blank=True, to='accounting.Currency', null=True)),
                ('groups', models.ManyToManyField(related_query_name='user', blank=True, related_name='user_set', to='auth.Group', help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', verbose_name='groups')),
                ('locale', models.ForeignKey(blank=True, help_text="If the Person has not 'Locale', the Accept-Language header will be used or the Site's system setting.", to='translation.Locale', null=True)),
                ('locations', models.ManyToManyField(related_name='people', blank=True, to='location.Location')),
                ('next_approver', models.ForeignKey(related_name='nextapprover', blank=True, to=settings.AUTH_USER_MODEL, null=True)),
                ('proxy_user', models.ForeignKey(related_name='coveringuser', blank=True, to=settings.AUTH_USER_MODEL, null=True)),
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
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
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
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('role_type', models.CharField(blank=True, max_length=29, choices=[('Internal', 'Internal'), ('Third Party', 'Third Party')], default='Internal')),
                ('name', models.CharField(help_text='Will be set to the Group Name', max_length=100, unique=True)),
                ('dashboad_text', models.CharField(blank=True, max_length=255)),
                ('create_all', models.BooleanField(help_text='Allow document creation for all locations', default=False)),
                ('modules', models.TextField(blank=True)),
                ('dashboad_links', models.TextField(blank=True)),
                ('tabs', models.TextField(blank=True)),
                ('password_can_change', models.BooleanField(default=True)),
                ('password_min_length', models.PositiveIntegerField(blank=True, default=6)),
                ('password_history_length', django.contrib.postgres.fields.ArrayField(base_field=models.PositiveIntegerField(help_text='Will be NULL if password length has never been changed.'), blank=True, size=None, default=[])),
                ('password_digit_required', models.BooleanField(default=False)),
                ('password_lower_char_required', models.BooleanField(default=False)),
                ('password_upper_char_required', models.BooleanField(default=False)),
                ('password_special_char_required', models.BooleanField(default=False)),
                ('password_expire', models.IntegerField(help_text="Number of days after setting password that it will expire.If '0', password will never expire.", blank=True, default=90)),
                ('password_expire_alert', models.BooleanField(help_text="Does the Person want to be alerted 'pre pw expiring'. Alerts start 3 days before password expires.", default=True)),
                ('password_expired_login_count', models.IntegerField(blank=True, null=True)),
                ('proxy_set', models.BooleanField(help_text='Users in this Role can set their own proxy', default=False)),
                ('default_accept_assign', models.BooleanField(default=True)),
                ('accept_assign', models.BooleanField(default=False)),
                ('default_accept_notify', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=False)),
                ('default_auth_amount', models.DecimalField(blank=True, decimal_places=4, default=0, max_digits=15)),
                ('allow_approval', models.BooleanField(default=False)),
                ('proxy_approval_bypass', models.BooleanField(default=False)),
                ('wo_notes', models.BooleanField(default=False)),
                ('wo_edit_closeout', models.BooleanField(default=False)),
                ('wo_show_inactive', models.BooleanField(default=False)),
                ('wo_show_tkt_attach', models.BooleanField(default=False)),
                ('wo_allow_backdate', models.BooleanField(default=False)),
                ('wo_days_backdate', models.PositiveIntegerField(blank=True, null=True)),
                ('inv_options', models.CharField(max_length=255, choices=[('new', 'new'), ('draft', 'draft')], default='new')),
                ('inv_wait', models.PositiveIntegerField(blank=True, null=True)),
                ('inv_select_assign', models.CharField(max_length=255, choices=[('all', 'all'), ('managers', 'managers')], default='all')),
                ('inv_autoapprove', models.BooleanField(default=False)),
                ('inv_max_approval_amount', models.PositiveIntegerField(blank=True, default=0)),
                ('inv_max_approval_currency', models.CharField(blank=True, max_length=25, default='usd')),
                ('inv_req_attach', models.BooleanField(default=True)),
                ('inv_close_wo', models.CharField(max_length=255, choices=[('Do not display', 'Do not display'), ('unchecked', 'unchecked'), ('checked', 'checked')], default='Do not display')),
                ('msg_address', models.BooleanField(help_text='whether users in this role are allowed to change the CC field on a ticket or work order', default=False)),
                ('msg_viewall', models.BooleanField(default=False)),
                ('msg_copy_email', models.BooleanField(default=False)),
                ('msg_copy_default', models.BooleanField(default=False)),
                ('msg_stored_link', models.BooleanField(default=False)),
                ('categories', models.ManyToManyField(blank=True, to='category.Category')),
                ('default_auth_currency', models.ForeignKey(blank=True, to='accounting.Currency', null=True)),
                ('group', models.OneToOneField(blank=True, to='auth.Group', null=True)),
                ('inv_wo_status', models.ForeignKey(blank=True, to='order.WorkOrderStatus', null=True)),
                ('location_level', models.ForeignKey(blank=True, to='location.LocationLevel', null=True)),
            ],
            options={
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
            field=models.ManyToManyField(related_query_name='user', blank=True, related_name='user_set', to='auth.Permission', help_text='Specific permissions for this user.', verbose_name='user permissions'),
        ),
    ]
