from django.contrib import admin
from . import models

# Register your models here.

admin.site.register(models.Notebook)
admin.site.register(models.Message)
# admin.site.register(models.Flowchart)
# admin.site.register(models.Timeline)