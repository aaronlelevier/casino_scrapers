# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-04-22 19:06
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0005_auto_20160418_1450'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ticket',
            name='priority',
            field=models.ForeignKey(default='038530c4-ce6c-4724-9cfd-37a16e787001', on_delete=django.db.models.deletion.CASCADE, to='ticket.TicketPriority'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='ticket',
            name='status',
            field=models.ForeignKey(default='037530c4-ce6c-4724-9cfd-37a16e787001', on_delete=django.db.models.deletion.CASCADE, to='ticket.TicketStatus'),
            preserve_default=False,
        ),
    ]
