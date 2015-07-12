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
            name='Person',
            fields=[
                ('user_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('title', models.CharField(max_length=100, blank=True)),
                ('emp_number', models.CharField(max_length=100, blank=True)),
                ('auth_amount', models.DecimalField(null=True, max_digits=15, decimal_places=4)),
                ('middle_initial', models.CharField(max_length=30, blank=True)),
                ('accept_assign', models.BooleanField(default=False)),
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
                ('name', models.CharField(unique=True, max_length=100)),
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
            field=models.ForeignKey(blank=True, to='person.Role', null=True),
        ),
        migrations.AddField(
            model_name='person',
            name='status',
            field=models.ForeignKey(blank=True, to='person.PersonStatus', null=True),
        ),
    ]
