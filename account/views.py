from django.views.generic.edit import FormView
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.views import LoginView

from .forms import UserForm


class CheckAnonymousMixin(object):
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return HttpResponseRedirect(reverse("game:index"))
        return super(CheckAnonymousMixin, self).dispatch(request, *args, **kwargs)


class RegisterFormView(CheckAnonymousMixin, FormView):
    form_class = UserForm
    template_name = "account/register.html"

    def get_success_url(self):
        return reverse("game:index")

    def form_valid(self, form):
        form.save()
        username = form.cleaned_data.get("username")
        raw_password = form.cleaned_data.get("password1")
        user = authenticate(username=username, password=raw_password)
        login(self.request, user)
        return super(RegisterFormView, self).form_valid(form)


class LoginViewRedirect(CheckAnonymousMixin, LoginView):
    template_name = "account/login.html"

    def get_success_url(self):
        return reverse("game:index")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("game:index"))