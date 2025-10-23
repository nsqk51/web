package ru.nsqk.web.stats;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.servlet.http.HttpServletRequest;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.LongAdder;
import java.util.stream.Collectors;

@ApplicationScoped
public class HeaderStatsService {

    private final ConcurrentHashMap<String, LongAdder> counts = new ConcurrentHashMap<>();

    public void recordHeaders(HttpServletRequest req) {
        Enumeration<String> names = req.getHeaderNames();
        if (names == null) return;

        // Защитимся от повторов одного и того же имени в одном запросе
        Set<String> seen = new HashSet<>();
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            if (name == null) continue;
            String key = name.toLowerCase(Locale.ROOT).trim();
            if (key.isEmpty()) continue;
            if (seen.add(key)) {
                counts.computeIfAbsent(key, k -> new LongAdder()).increment();
            }
        }
    }

    public List<StatItem> snapshotSorted() {
        return counts.entrySet().stream()
                .map(e -> new StatItem(e.getKey(), e.getValue().sum()))
                .sorted(Comparator.comparingLong(StatItem::getCount).reversed()
                        .thenComparing(StatItem::getName))
                .collect(Collectors.toUnmodifiableList());
    }

    public void reset() {
        counts.clear();
    }
}