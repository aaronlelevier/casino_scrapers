# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0011_auto_20150915_0925'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='person',
            options={'ordering': ('fullname',)},
        ),
    ]
