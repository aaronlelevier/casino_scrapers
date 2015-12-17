# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0008_ticket_category_names'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ticket',
            name='category_names',
        ),
    ]
