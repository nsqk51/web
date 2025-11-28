package ru.nsqk.web.validation;

import jakarta.faces.application.FacesMessage;
import jakarta.faces.component.UIComponent;
import jakarta.faces.context.FacesContext;
import jakarta.faces.validator.FacesValidator;
import jakarta.faces.validator.Validator;
import jakarta.faces.validator.ValidatorException;

@FacesValidator("yValidator")
public class YValidator implements Validator<Double> {
    @Override
    public void validate(FacesContext context, UIComponent component, Double value)
            throws ValidatorException {
        if (value == null) return;

        if (value <= -5 || value >= 5) {
            throw new ValidatorException(
                    new FacesMessage(FacesMessage.SEVERITY_ERROR,
                            "Значение Y вне допустимого диапазона",
                            "Значение Y должно быть строго в диапазоне (-5; 5). " +
                                    "Введенное значение: " + value + ". "));
        }

        String valueStr = value.toString();
        if (valueStr.contains(".")) {
            int decimalPlaces = valueStr.length() - valueStr.indexOf('.') - 1;
            if (decimalPlaces > 8) {
                throw new ValidatorException(
                        new FacesMessage(FacesMessage.SEVERITY_ERROR,
                                "Слишком много знаков после запятой",
                                "Y не может содержать больше 8 знаков после запятой. " +
                                        "Текущее количество знаков: " + decimalPlaces));
            }
        }
    }
}