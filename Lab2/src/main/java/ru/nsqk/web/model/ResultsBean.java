package ru.nsqk.web.model;

import jakarta.enterprise.context.SessionScoped;
import jakarta.inject.Named;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Named("resultsBean")
@SessionScoped
public class ResultsBean implements Serializable {

    private final List<HitResult> results = new ArrayList<>();

    public List<HitResult> getAll() {
        return Collections.unmodifiableList(results);
    }

    public void add(HitResult r) {
        results.add(r);
    }

    public void addAll(List<HitResult> list) {
        results.addAll(list);
    }

    public void clear() {
        results.clear();
    }
}