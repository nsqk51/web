package ru.nsqk.web.results;

import jakarta.persistence.*;

@Entity
@Table(name = "hit_results")
public class HitResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double x;
    private Double y;
    private Double r;

    private boolean hit;

    @Column(length = 64)
    private String serverTime;

    private long execTimeNs;

    public HitResult() {}

    public void checkHit() {
        if (x == null || y == null || r == null || r <= 0) {
            this.hit = false;
            return;
        }

        boolean q1Triangle = (x >= 0 && y >= 0 && y <= (-x + r));
        boolean q2Square = (x <= 0 && y >= 0 && x >= -r && y <= r);
        boolean q3QuarterCircle = (x <= 0 && y <= 0 && (x * x + y * y <= r * r));

        this.hit = q1Triangle || q2Square || q3QuarterCircle;
    }

    // технический id (для БД)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    // требуемые поля
    public Double getX() { return x; }
    public void setX(Double x) { this.x = x; }

    public Double getY() { return y; }
    public void setY(Double y) { this.y = y; }

    public Double getR() { return r; }
    public void setR(Double r) { this.r = r; }

    public boolean isHit() { return hit; }
    public void setHit(boolean hit) { this.hit = hit; }

    public String getServerTime() { return serverTime; }
    public void setServerTime(String serverTime) { this.serverTime = serverTime; }

    public long getExecTimeNs() { return execTimeNs; }
    public void setExecTimeNs(long execTimeNs) { this.execTimeNs = execTimeNs; }
}