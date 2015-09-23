# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0012_auto_20150923_1027'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='personstatus',
            options={'ordering': ('id',)},
        ),
    ]
