# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import django.contrib.auth.models


class Migration(migrations.Migration):

    dependencies = [
        ('location', '__first__'),
        ('order', '0001_initial'),
        ('auth', '0006_require_contenttypes_0002'),
    ]

    operations = [
        migrations.CreateModel(
            name='CoveringUser',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.BooleanField(default=False)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='NextApprover',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.BooleanField(default=False)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Person',
            fields=[
                ('user_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('authorized_amount', models.PositiveIntegerField()),
                ('authorized_amount_currency', models.CharField(default=b'usd', max_length=25, choices=[(b'usd', b'usd'), (b'eur', b'eur'), (b'jpy', b'jpy')])),
                ('accept_assign', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=True)),
                ('employee_id', models.CharField(max_length=100, null=True, blank=True)),
                ('middle_initial', models.CharField(max_length=30, null=True, blank=True)),
                ('title', models.CharField(max_length=100, null=True, blank=True)),
                ('password_expiration', models.DateField(null=True, blank=True)),
                ('password_one_time', models.CharField(max_length=255, null=True, blank=True)),
                ('ooto_status', models.CharField(max_length=100, null=True, verbose_name=b'Out of the Office Status', blank=True)),
                ('ooto_start_date', models.DateField(max_length=100, null=True, verbose_name=b'Out of the Office Status Start Date', blank=True)),
                ('ooto_end_date', models.DateField(max_length=100, null=True, verbose_name=b'Out of the Office Status End Date', blank=True)),
                ('location', models.ForeignKey(to='location.Location')),
            ],
            options={
                'db_table': 'person_person',
            },
            bases=('auth.user',),
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='PersonStatus',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.BooleanField(default=False)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('description', models.CharField(default=b'one', max_length=100, choices=[(b'one', b'one'), (b'two', b'two')])),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ProxyRole',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.BooleanField(default=False)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.BooleanField(default=False)),
                ('role_type', models.CharField(default=b'contractor', max_length=29, choices=[(b'contractor', b'contractor'), (b'location', b'location')])),
                ('dashboad_text', models.CharField(max_length=255, blank=True)),
                ('create_all', models.BooleanField(default=False, help_text=b'Allow document creation for all locations')),
                ('modules', models.TextField(blank=True)),
                ('dashboad_links', models.TextField(blank=True)),
                ('tabs', models.TextField(blank=True)),
                ('password_min_length', models.PositiveIntegerField(default=6, blank=True)),
                ('password_history_length', models.PositiveIntegerField(help_text=b'Will be NULL if password length has never been changed.', null=True, blank=True)),
                ('password_char_types', models.CharField(help_text=b'Password characters allowed', max_length=100)),
                ('password_expire', models.PositiveIntegerField(help_text=b'Number of days after setting password that it will expire.')),
                ('password_expire_alert', models.BooleanField(default=True, help_text=b"Does the Person want to be alerted 'pre pw expiring'. Alerts start 3 days before password expires.")),
                ('proxy_set', models.BooleanField(default=False, help_text=b'Users in this Role can set their own proxy')),
                ('default_accept_assign', models.BooleanField(default=True)),
                ('accept_assign', models.BooleanField(default=False)),
                ('default_accept_notify', models.BooleanField(default=True)),
                ('accept_notify', models.BooleanField(default=False)),
                ('default_authorized_amount', models.BooleanField(default=True)),
                ('authorized_amount', models.PositiveIntegerField(null=True, blank=True)),
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
                ('group', models.OneToOneField(to='auth.Group')),
                ('inv_wo_status', models.ForeignKey(blank=True, to='order.WorkOrderStatus', null=True)),
                ('location_level', models.ForeignKey(blank=True, to='location.LocationLevel', null=True)),
            ],
            options={
                'ordering': ('group__name',),
                'db_table': 'role_role',
                'permissions': (('view_role', 'can view role'),),
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
            field=models.ForeignKey(to='person.PersonStatus'),
        ),
        migrations.AddField(
            model_name='nextapprover',
            name='person',
            field=models.OneToOneField(to='person.Person'),
        ),
        migrations.AddField(
            model_name='coveringuser',
            name='person',
            field=models.OneToOneField(to='person.Person'),
        ),
    ]
