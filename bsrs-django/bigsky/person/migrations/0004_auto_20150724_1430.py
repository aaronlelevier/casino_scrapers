# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0003_auto_20150724_1353'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='password_change',
            field=models.TextField(help_text=b'Tuple of (datetime of PW change, old PW)'),
        ),
    ]
