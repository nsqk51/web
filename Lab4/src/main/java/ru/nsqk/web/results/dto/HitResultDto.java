package ru.nsqk.web.results.dto;

public class HitResultDto {
    private Double x;
    private Double y;
    private Double r;
    private boolean hit;
    private String serverTime;
    private long execTimeNs;

    public HitResultDto() {}

    public HitResultDto(Double x, Double y, Double r, boolean hit, String serverTime, long execTimeNs) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.hit = hit;
        this.serverTime = serverTime;
        this.execTimeNs = execTimeNs;
    }

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