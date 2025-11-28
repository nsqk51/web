package ru.nsqk.web.model; // Убедитесь, что пакет правильный

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Named;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Named("timeBean")
@RequestScoped
public class TimeBean implements Serializable {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");

    public String getCurrentTime() {
        return LocalDateTime.now().format(FORMATTER);
    }
}