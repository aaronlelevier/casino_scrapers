# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
        migrations.AlterField(
            model_name='person',
            name='locale',
            field=models.ForeignKey(null=True, blank=True, to='translation.Locale', help_text="If the Person has not 'Locale', the Accept-Language header will be used or the Site's system setting."),
        ),
        migrations.AlterField(
            model_name='person',
            name='password_change',
            field=models.TextField(help_text='Tuple of (datetime of PW change, old PW)'),
        ),
        migrations.AlterField(
            model_name='person',
            name='password_expire_date',
            field=models.DateField(null=True, blank=True, help_text="Date that the Person's password will expire next. Based upon the ``password_expire`` days set on the Role."),
        ),
        migrations.AlterField(
            model_name='person',
            name='password_length',
            field=models.PositiveIntegerField(null=True, blank=True, help_text='Store the length of the current password.'),
        ),
        migrations.AlterField(
            model_name='person',
            name='proxy_end_date',
            field=models.DateField(null=True, verbose_name='Out of the Office Status End Date', blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='person',
            name='proxy_start_date',
            field=models.DateField(null=True, verbose_name='Out of the Office Status Start Date', blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='person',
            name='proxy_status',
            field=models.CharField(null=True, verbose_name='Out of the Office Status', blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='personstatus',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
        migrations.AlterField(
            model_name='personstatus',
            name='description',
            field=models.CharField(default='active', max_length=100, choices=[('active', 'active'), ('two', 'two')]),
        ),
        migrations.AlterField(
            model_name='proxyrole',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
        migrations.AlterField(
            model_name='role',
            name='create_all',
            field=models.BooleanField(help_text='Allow document creation for all locations', default=False),
        ),
        migrations.AlterField(
            model_name='role',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
        migrations.AlterField(
            model_name='role',
            name='inv_close_wo',
            field=models.CharField(default='Do not display', max_length=255, choices=[('Do not display', 'Do not display'), ('unchecked', 'unchecked'), ('checked', 'checked')]),
        ),
        migrations.AlterField(
            model_name='role',
            name='inv_max_approval_currency',
            field=models.CharField(blank=True, default='usd', max_length=25),
        ),
        migrations.AlterField(
            model_name='role',
            name='inv_options',
            field=models.CharField(default='new', max_length=255, choices=[('new', 'new'), ('draft', 'draft')]),
        ),
        migrations.AlterField(
            model_name='role',
            name='inv_select_assign',
            field=models.CharField(default='all', max_length=255, choices=[('all', 'all'), ('managers', 'managers')]),
        ),
        migrations.AlterField(
            model_name='role',
            name='msg_address',
            field=models.BooleanField(help_text='Enable Addressing', default=False),
        ),
        migrations.AlterField(
            model_name='role',
            name='name',
            field=models.CharField(unique=True, help_text='Will be set to the Group Name', max_length=100),
        ),
        migrations.AlterField(
            model_name='role',
            name='password_char_types',
            field=models.CharField(help_text='Password characters allowed', max_length=100),
        ),
        migrations.AlterField(
            model_name='role',
            name='password_expire',
            field=models.IntegerField(blank=True, help_text="Number of days after setting password that it will expire.If '0', password will never expire.", default=90),
        ),
        migrations.AlterField(
            model_name='role',
            name='password_expire_alert',
            field=models.BooleanField(help_text="Does the Person want to be alerted 'pre pw expiring'. Alerts start 3 days before password expires.", default=True),
        ),
        migrations.AlterField(
            model_name='role',
            name='password_history_length',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.PositiveIntegerField(help_text='Will be NULL if password length has never been changed.'), size=None, blank=True, default=[]),
        ),
        migrations.AlterField(
            model_name='role',
            name='proxy_set',
            field=models.BooleanField(help_text='Users in this Role can set their own proxy', default=False),
        ),
        migrations.AlterField(
            model_name='role',
            name='role_type',
            field=models.CharField(blank=True, default='Internal', max_length=29, choices=[('Internal', 'Internal'), ('Third Party', 'Third Party')]),
        ),
    ]
