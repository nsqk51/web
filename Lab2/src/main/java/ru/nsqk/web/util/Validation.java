package ru.nsqk.web.util;

import java.util.HashSet;
import java.util.Set;

public final class Validation {
    private Validation(){}

    private static final Set<Double> ALLOWED_R = new HashSet<>();
    static {
        ALLOWED_R.add(1.0);
        ALLOWED_R.add(1.5);
        ALLOWED_R.add(2.0);
        ALLOWED_R.add(2.5);
        ALLOWED_R.add(3.0);
    }

    // Валидация для формы (с диапазонами)
    public static double parseX(String s) throws IllegalArgumentException {
        double x = parseDecimal(s, "X");
        if (!(x > -5 && x < 5)) throw new IllegalArgumentException("X вне диапазона (-5; 5)");
        return x;
    }
    public static double parseY(String s) throws IllegalArgumentException {
        double y = parseDecimal(s, "Y");
        if (!(y > -3 && y < 5)) throw new IllegalArgumentException("Y должен быть в интервале (-3; 5), границы не включаются");
        return y;
    }

    // Валидация для клика (без диапазонов)
    public static double parseXFree(String s) throws IllegalArgumentException {
        return parseDecimal(s, "X");
    }
    public static double parseYFree(String s) throws IllegalArgumentException {
        return parseDecimal(s, "Y");
    }

    public static double[] parseR(String[] values) throws IllegalArgumentException {
        if (values == null || values.length == 0) {
            throw new IllegalArgumentException("Выберите хотя бы один R");
        }
        return java.util.Arrays.stream(values).map(String::trim).mapToDouble(v -> {
            double r = parseDecimal(v, "R");
            if (!ALLOWED_R.contains(r)) {
                throw new IllegalArgumentException("Недопустимое значение R: " + v);
            }
            return r;
        }).toArray();
    }

    private static double parseDecimal(String s, String name) {
        if (s == null || s.isBlank()) throw new IllegalArgumentException(name + " не задан");
        String t = s.trim().replace(',', '.');
        if (t.endsWith(".")) throw new IllegalArgumentException(name + " некорректен");
        if (t.matches(".*[eE].*")) throw new IllegalArgumentException("Не используйте экспоненциальную форму для " + name);
        try {
            double d = Double.parseDouble(t);
            if (!Double.isFinite(d)) throw new IllegalArgumentException(name + " некорректен");
            return d;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(name + " некорректен");
        }
    }
}