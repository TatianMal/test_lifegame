from django.forms import ModelForm, NumberInput

from .models import Game, MIN_VALUE, MAX_VALUE_CELL, MAX_VALUE_GEN, MAX_VALUE_ROUND


class CreateGameForm(ModelForm):

    class Meta:
        model = Game
        fields = ["count_round", "count_cell", "count_generation"]
        widgets = {
            "count_round": NumberInput(attrs={
                "type": "range",
                "step": "1",
                "min": MIN_VALUE,
                "max": MAX_VALUE_GEN,
                'oninput': "showVal(this, this.value)",
            }),
            "count_cell": NumberInput(attrs={
                "type": "range",
                "step": "1",
                "min":  MIN_VALUE,
                "max": MAX_VALUE_CELL,
                'oninput': "showVal(this, this.value)",
            }),
            "count_generation": NumberInput(attrs={
                "type": "range",
                "step": "1",
                "min":  MIN_VALUE,
                "max": MAX_VALUE_ROUND,
                'oninput': "showVal(this, this.value)",
            }),
        }