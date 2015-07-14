# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings
import django.contrib.auth.models


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0006_require_contenttypes_0002'),
        ('location', '0001_initial'),
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
                ('location', models.ManyToManyField(to='location.Location')),
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
            name='Role',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('role_type', models.CharField(default=b'location', max_length=29, choices=[(b'contractor', b'contractor'), (b'location', b'location')])),
                ('group', models.OneToOneField(to='auth.Group')),
                ('location_level', models.ForeignKey(blank=True, to='location.LocationLevel', null=True)),
            ],
            options={
                'ordering': ('group__name',),
                'db_table': 'role_role',
                'permissions': (('view_role', 'can view role'),),
            },
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
