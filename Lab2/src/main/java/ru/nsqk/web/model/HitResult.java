package ru.nsqk.web.model;

import java.io.Serializable;

public class HitResult implements Serializable {
    private double x;
    private double y;
    private double r;
    private boolean hit;
    private String clientTime;
    private long execTimeNs;

    public HitResult() {}

    public HitResult(double x, double y, double r, boolean hit, String clientTime, long execTimeNs) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.hit = hit;
        this.clientTime = clientTime;
        this.execTimeNs = execTimeNs;
    }

    public double getX() { return x; }
    public double getY() { return y; }
    public double getR() { return r; }
    public boolean isHit() { return hit; }
    public String getClientTime() { return clientTime; }
    public long getExecTimeNs() { return execTimeNs; }

    public void setX(double x) { this.x = x; }
    public void setY(double y) { this.y = y; }
    public void setR(double r) { this.r = r; }
    public void setHit(boolean hit) { this.hit = hit; }
    public void setClientTime(String clientTime) { this.clientTime = clientTime; }
    public void setExecTimeNs(long execTimeNs) { this.execTimeNs = execTimeNs; }
}