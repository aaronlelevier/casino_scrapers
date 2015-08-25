# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0006_auto_20150825_1614'),
    ]

    operations = [
        migrations.RenameField(
            model_name='translation',
            old_name='language',
            new_name='locale',
        ),
    ]
