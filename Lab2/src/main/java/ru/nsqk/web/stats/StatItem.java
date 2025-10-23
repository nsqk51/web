package ru.nsqk.web.stats;

public class StatItem {
    private final String name;
    private final long count;

    public StatItem(String name, long count) {
        this.name = name;
        this.count = count;
    }
    public String getName() { return name; }
    public long getCount() { return count; }
}