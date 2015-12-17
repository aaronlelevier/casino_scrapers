# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0007_remove_ticket_attachments'),
    ]

    operations = [
        migrations.AddField(
            model_name='ticket',
            name='category_names',
            field=models.CharField(max_length=254, blank=True, help_text="Denormalized field that stores Category names ordered by 'level'."),
        ),
    ]
