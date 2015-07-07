# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0002_auto_20150707_1109'),
        ('auth', '0006_require_contenttypes_0002'),
    ]

    operations = [
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('role_type', models.CharField(default=b'location', max_length=29, choices=[(b'contractor', b'admin.role.contractor'), (b'location', b'admin.role.location')])),
                ('group', models.ForeignKey(to='auth.Group', unique=True)),
                ('location_level', models.ForeignKey(to='location.LocationLevel', null=True)),
            ],
            options={
                'ordering': ('group__name',),
                'db_table': 'role_role',
            },
        ),
    ]
