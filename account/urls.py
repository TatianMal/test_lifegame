from django.urls import path
from . import views

app_name = "account"
urlpatterns = [
    path("sign_up/", views.RegisterFormView.as_view(), name="sign_up"),
    path("login/", views.LoginViewRedirect.as_view(), name="login"),
    path("logout/", views.logout_view, name="logout")
]
