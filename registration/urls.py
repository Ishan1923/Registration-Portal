from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/register/', views.create_registration, name='create_registration'),
    path('api/registrations/', views.list_registrations, name='list_registrations'),
    path('api/stats/', views.registration_stats, name='registration_stats'),
]