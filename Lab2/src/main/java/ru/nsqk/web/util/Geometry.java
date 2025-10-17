package ru.nsqk.web.util;

public final class Geometry {

    private Geometry() {}

    // I четверть: четверть окружности радиуса R (x>=0, y>=0, x^2+y^2<=R^2)
    // III четверть: треугольник с (0,0), (-R/2,0), (0,-R)
    // IV четверть: прямоугольник (0,0)-(R/2,0)-(R/2,-R)-(0,-R)
    public static boolean isHit(double x, double y, double r) {
        boolean inCircle = x >= 0 && y >= 0 && (x*x + y*y) <= r*r;

        boolean inTriangle = (x <= 0 && x >= -r/2) && (y <= 0 && y >= -r)
                // внутри треугольника выше гипотенузы y = -2x - r
                && (y >= -2*x - r);

        boolean inRect = (x >= 0 && x <= r/2) && (y <= 0 && y >= -r);

        return inCircle || inTriangle || inRect;
    }
}