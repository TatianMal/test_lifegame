from django.urls import path
from . import views

app_name = 'posts'
urlpatterns = [
    path('', views.GamesList.as_view(), name='index'),  # get with filter
    # path('create_game/', views.PostList.as_view(published=False), name='create_game'),
]
