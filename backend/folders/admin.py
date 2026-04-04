from django.contrib import admin
from . import models 
# Register your models here.

class AutoAdmin(admin.ModelAdmin):
    def __init__(self, model, admin_site):
        self.list_display = [f.name for f in model._meta.fields]
        super().__init__(model, admin_site)


admin.site.register(models.Folder, AutoAdmin)
admin.site.register(models.File, AutoAdmin)