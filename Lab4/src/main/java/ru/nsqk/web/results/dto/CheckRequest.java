package ru.nsqk.web.results.dto;

import jakarta.validation.constraints.NotNull;

public class CheckRequest {
    @NotNull
    private Double x;

    @NotNull
    private Double y;

    @NotNull
    private Double r;

    public CheckRequest() {}

    public Double getX() { return x; }
    public void setX(Double x) { this.x = x; }

    public Double getY() { return y; }
    public void setY(Double y) { this.y = y; }

    public Double getR() { return r; }
    public void setR(Double r) { this.r = r; }
}