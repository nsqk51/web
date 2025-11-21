package ru.nsqk.web.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "lab3_results")
public class HitResult implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double x;
    private Double y;
    private Double r;
    private boolean hit;
    private String serverTime;
    private long execTimeNs;

    public HitResult() {}

    public void checkHit() {
        if (x == null || y == null || r == null) {
            this.hit = false;
            return;
        }

        // 1 четверть: четверть окружности радиуса R
        boolean q1 = (x >= 0 && y >= 0 && (x*x + y*y <= r*r));

        // 3 четверть: треугольник (-R/2,0), (0,0), (0,-R/2)
        boolean q3 = (x >= -r/2 && x <= 0) &&
                (y <= 0 && y >= -r/2) &&
                (y >= -x - r/2);

        // 4 четверть: прямоугольник (0,0)-(R,0)-(R,-R/2)-(0,-R/2)
        boolean q4 = (x >= 0 && x <= r) &&
                (y <= 0 && y >= -r/2);

        this.hit = q1 || q3 || q4;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getX() { return x; }
    public void setX(Double x) { this.x = x; }

    public Double getY() { return y; }
    public void setY(Double y) { this.y = y; }

    public Double getR() { return r; }
    public void setR(Double r) { this.r = r; }

    public boolean isHit() { return hit; }
    public void setHit(boolean hit) { this.hit = hit; }

    public String getServerTime() { return serverTime; }
    public void setServerTime(String time) { this.serverTime = time; }

    public long getExecTimeNs() { return execTimeNs; }
    public void setExecTimeNs(long time) { this.execTimeNs = time; }

    public String getFormattedServerTime() {
        if (this.serverTime == null) return "";
        try {
            return ZonedDateTime.parse(this.serverTime)
                    .format(DateTimeFormatter.ofPattern("HH:mm:ss dd.MM.yy"));
        } catch (Exception e) {
            return "";
        }
    }
}