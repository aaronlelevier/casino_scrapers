# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='person',
            old_name='password_lenth',
            new_name='password_length',
        ),
    ]
