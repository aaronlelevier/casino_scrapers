# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_auto_20150709_1102'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='role',
            options={'ordering': ('group__name',), 'permissions': (('view_role', 'can view role'),)},
        ),
        migrations.AlterField(
            model_name='role',
            name='role_type',
            field=models.CharField(default=b'location', max_length=29, choices=[(b'contractor', b'contractor'), (b'location', b'location')]),
        ),
    ]
