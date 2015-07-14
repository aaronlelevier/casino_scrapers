# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_auto_20150714_0911'),
    ]

    operations = [
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
        migrations.AddField(
            model_name='role',
            name='accept_assign',
            field=models.BooleanField(default=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='role',
            name='accept_notify',
            field=models.BooleanField(default=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='role',
            name='allow_approval',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='authorized_amount',
            field=models.PositiveIntegerField(default=1, blank=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='role',
            name='create_all',
            field=models.BooleanField(default=False, help_text=b'Allow document creation for all locations'),
        ),
        migrations.AddField(
            model_name='role',
            name='created',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 14, 22, 20, 10, 412359, tzinfo=utc), auto_now_add=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='role',
            name='dashboad_links',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='role',
            name='dashboad_text',
            field=models.CharField(max_length=255, blank=True),
        ),
        migrations.AddField(
            model_name='role',
            name='default_accept_assign',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='role',
            name='default_accept_notify',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='role',
            name='default_authorized_amount',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='role',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='inv_options',
            field=models.CharField(default=b'new', max_length=255, choices=[(b'new', b'new'), (b'draft', b'draft')]),
        ),
        migrations.AddField(
            model_name='role',
            name='modified',
            field=models.DateTimeField(default=datetime.datetime(2015, 7, 14, 22, 20, 19, 252120, tzinfo=utc), auto_now=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='role',
            name='modules',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='role',
            name='password_char_types',
            field=models.CharField(default=1, help_text=b'Password characters allowed', max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='role',
            name='password_expire',
            field=models.PositiveIntegerField(default=1, help_text=b'Number of days after setting password that it will expire.'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='role',
            name='password_expire_alert',
            field=models.BooleanField(default=True, help_text=b"Does the Person want to be alerted 'pre pw expiring'. Alerts start 3 days before password expires."),
        ),
        migrations.AddField(
            model_name='role',
            name='password_history_length',
            field=models.PositiveIntegerField(help_text=b'Will be NULL if password length has never been changed.', null=True, blank=True),
        ),
        migrations.AddField(
            model_name='role',
            name='password_min_length',
            field=models.PositiveIntegerField(default=6, blank=True),
        ),
        migrations.AddField(
            model_name='role',
            name='proxy_approval_bypass',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='proxy_set',
            field=models.BooleanField(default=False, help_text=b'Users in this Role can set their own proxy'),
        ),
        migrations.AddField(
            model_name='role',
            name='tabs',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='role',
            name='wo_allow_backdate',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='wo_days_backdate',
            field=models.PositiveIntegerField(default=1, blank=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='role',
            name='wo_edit_closeout',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='wo_notes',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='wo_show_inactive',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='role',
            name='wo_show_tkt_attach',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='role',
            name='role_type',
            field=models.CharField(default=b'contractor', max_length=29, choices=[(b'contractor', b'contractor'), (b'location', b'location')]),
        ),
        migrations.AddField(
            model_name='proxyrole',
            name='role',
            field=models.ForeignKey(to='person.Role'),
        ),
    ]
