# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone
import django.contrib.auth.models
import django.contrib.postgres.fields
import person.models
import uuid
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0001_initial'),
        ('category', '0001_initial'),
        ('auth', '0006_require_contenttypes_0002'),
    ]

    operations = [
        migrations.CreateModel(
            name='Person',
            fields=[
                ('password', models.CharField(verbose_name='password', max_length=128)),
                ('last_login', models.DateTimeField(blank=True, verbose_name='last login', null=True)),
                ('is_superuser', models.BooleanField(verbose_name='superuser status', help_text='Designates that this user has all permissions without explicitly assigning them.', default=False)),
                ('username', models.CharField(unique=True, validators=[django.core.validators.RegexValidator('^[\\w.@+-]+$', 'Enter a valid username. This value may contain only letters, numbers and @/./+/-/_ characters.', 'invalid')], max_length=30, error_messages={'unique': 'A user with that username already exists.'}, verbose_name='username', help_text='Required. 30 characters or fewer. Letters, digits and @/./+/-/_ only.')),
                ('first_name', models.CharField(blank=True, verbose_name='first name', max_length=30)),
                ('last_name', models.CharField(blank=True, verbose_name='last name', max_length=30)),
                ('email', models.EmailField(blank=True, verbose_name='email address', max_length=254)),
                ('is_staff', models.BooleanField(verbose_name='staff status', help_text='Designates whether the user can log into this admin site.', default=False)),
                ('is_active', models.BooleanField(verbose_name='active', help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', default=True)),
                ('date_joined', models.DateTimeField(verbose_name='date joined', default=django.utils.timezone.now)),
                ('id', models.UUIDField(primary_key=True, editable=False, serialize=False, default=uuid.uuid4)),
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
                ('password_change', models.DateTimeField(blank=True, help_text='DateTime of last password change', null=True)),
                ('password_history', django.contrib.postgres.fields.ArrayField(blank=True, size=5, default=[], base_field=models.CharField(max_length=254))),
                ('proxy_status', models.CharField(blank=True, verbose_name='Out of the Office Status', null=True, max_length=100)),
                ('proxy_start_date', models.DateField(blank=True, verbose_name='Out of the Office Status Start Date', null=True, max_length=100)),
                ('proxy_end_date', models.DateField(blank=True, verbose_name='Out of the Office Status End Date', null=True, max_length=100)),
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
                ('id', models.UUIDField(primary_key=True, editable=False, serialize=False, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
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
                ('id', models.UUIDField(primary_key=True, editable=False, serialize=False, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.UUIDField(primary_key=True, editable=False, serialize=False, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('role_type', models.CharField(blank=True, choices=[('Internal', 'Internal'), ('Third Party', 'Third Party')], max_length=29, default='Internal')),
                ('name', models.CharField(help_text='Will be set to the Group Name', max_length=75, unique=True)),
                ('dashboad_text', models.CharField(blank=True, max_length=255)),
                ('create_all', models.BooleanField(help_text='Allow document creation for all locations', default=False)),
                ('modules', models.TextField(blank=True)),
                ('dashboad_links', models.TextField(blank=True)),
                ('tabs', models.TextField(blank=True)),
                ('password_can_change', models.BooleanField(default=True)),
                ('password_min_length', models.PositiveIntegerField(blank=True, default=6)),
                ('password_history_length', django.contrib.postgres.fields.ArrayField(blank=True, size=None, default=[], base_field=models.PositiveIntegerField(help_text='Will be NULL if password length has never been changed.'))),
                ('password_digit_required', models.BooleanField(default=False)),
                ('password_lower_char_required', models.BooleanField(default=False)),
                ('password_upper_char_required', models.BooleanField(default=False)),
                ('password_special_char_required', models.BooleanField(default=False)),
                ('password_expire', models.IntegerField(blank=True, help_text="Number of days after setting password that it will expire.If '0', password will never expire.", default=90)),
                ('password_expire_alert', models.BooleanField(help_text="Does the Person want to be alerted 'pre pw expiring'. Alerts start 3 days before password expires.", default=True)),
                ('password_expired_login_count', models.IntegerField(blank=True, null=True)),
                ('proxy_set', models.BooleanField(help_text='Users in this Role can set their own proxy', default=False)),
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
                ('inv_options', models.CharField(choices=[('new', 'new'), ('draft', 'draft')], max_length=255, default='new')),
                ('inv_wait', models.PositiveIntegerField(blank=True, null=True)),
                ('inv_select_assign', models.CharField(choices=[('all', 'all'), ('managers', 'managers')], max_length=255, default='all')),
                ('inv_autoapprove', models.BooleanField(default=False)),
                ('inv_max_approval_amount', models.PositiveIntegerField(blank=True, default=0)),
                ('inv_max_approval_currency', models.CharField(blank=True, max_length=25, default='usd')),
                ('inv_req_attach', models.BooleanField(default=True)),
                ('inv_close_wo', models.CharField(choices=[('Do not display', 'Do not display'), ('unchecked', 'unchecked'), ('checked', 'checked')], max_length=255, default='Do not display')),
                ('msg_address', models.BooleanField(help_text='whether users in this role are allowed to change the CC field on a ticket or work order', default=False)),
                ('msg_viewall', models.BooleanField(default=False)),
                ('msg_copy_email', models.BooleanField(default=False)),
                ('msg_copy_default', models.BooleanField(default=False)),
                ('msg_stored_link', models.BooleanField(default=False)),
                ('categories', models.ManyToManyField(blank=True, to='category.Category')),
                ('default_auth_currency', models.ForeignKey(null=True, blank=True, to='accounting.Currency')),
                ('group', models.OneToOneField(null=True, blank=True, to='auth.Group')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
