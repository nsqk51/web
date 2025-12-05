package ru.nsqk.web.model;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.faces.application.FacesMessage;
import jakarta.faces.context.FacesContext;
import jakarta.inject.Named;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.transaction.Transactional;

import java.io.Serializable;
import java.lang.reflect.Method;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Named("resultsManager")
@ApplicationScoped
public class ResultsManager implements Serializable {

    @PersistenceContext
    private EntityManager entityManager;

    private HitResult newResult;
    private List<HitResult> results;

    private Double graphX;
    private Double graphY;
    private String graphTags;

    private String filterQuery;

    private int currentPage = 0;
    private static final int RESULTS_PER_PAGE = 10;

    @PostConstruct
    public void init() {
        newResult = new HitResult();
        newResult.setR(1.0);
        loadResults();
    }

    private void loadResults() {
        try {
            TypedQuery<HitResult> query = entityManager.createQuery(
                    "SELECT h FROM HitResult h ORDER BY h.id DESC", HitResult.class);
            results = new ArrayList<>(query.getResultList());
        } catch (Exception e) {
            System.err.println("Ошибка загрузки результатов: " + e.getMessage());
            e.printStackTrace();
            results = new ArrayList<>();
        }
    }

    public double getScale() {
        double r = (newResult != null && newResult.getR() != null) ? newResult.getR() : 1.0;
        if (r <= 0) return 40.0;
        double maxRadiusPx = 120.0;
        double scale = Math.min(40.0, maxRadiusPx / r);
        return scale;
    }

    @Transactional
    public void addResultFromForm() {
        if (newResult == null) return;

        try {
            Method getTagsString = newResult.getClass().getMethod("getTagsString");
            Method setTags = newResult.getClass().getMethod("setTags", List.class);
            Object ts = getTagsString.invoke(newResult);
            if (ts instanceof String && ((String) ts).trim().length() > 0) {
                List<String> parsed = parseTagsString((String) ts);
                setTags.invoke(newResult, parsed);
            }
        } catch (NoSuchMethodException ignored) {

        } catch (Exception e) {
            System.err.println("Ошибка: не удалось получить тэги: " + e.getMessage());
        }

        processAndSave(newResult);
    }

    @Transactional
    public void addResultFromGraph() {
        Double x = graphX;
        Double y = graphY;
        if (x == null || y == null) {
            Map<String, String> params = FacesContext.getCurrentInstance().getExternalContext().getRequestParameterMap();
            try {
                String xs = params.get("x");
                String ys = params.get("y");
                if (xs != null && ys != null) {
                    x = Double.parseDouble(xs);
                    y = Double.parseDouble(ys);
                } else {
                    FacesContext.getCurrentInstance().addMessage(null,
                            new FacesMessage(FacesMessage.SEVERITY_ERROR, "Ошибка", "Не удалось получить координаты клика."));
                    return;
                }
            } catch (NumberFormatException ex) {
                FacesContext.getCurrentInstance().addMessage(null,
                        new FacesMessage(FacesMessage.SEVERITY_ERROR, "Ошибка", "Некорректные координаты клика."));
                return;
            }
        }

        if (newResult == null || newResult.getR() == null) {
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_WARN, "Предупреждение", "Сначала выберите значение R."));
            return;
        }

        HitResult hit = new HitResult();
        hit.setX(x);
        hit.setY(y);
        hit.setR(newResult.getR());
        try {
            Method setTags = hit.getClass().getMethod("setTags", List.class);
            setTags.invoke(hit, new ArrayList<String>());
        } catch (NoSuchMethodException ignored) {
        } catch (Exception e) {
            // ignore
        }

        processAndSave(hit);

        graphX = null;
        graphY = null;
        graphTags = null;
    }

    private void processAndSave(HitResult hit) {
        long start = System.nanoTime();
        hit.checkHit();
        hit.setServerTime(ZonedDateTime.now().format(DateTimeFormatter.ISO_ZONED_DATE_TIME));
        hit.setExecTimeNs(System.nanoTime() - start);

        try {
            entityManager.persist(hit);
            entityManager.flush();
            if (results == null) results = new ArrayList<>();
            results.add(0, hit);
            // сброс пагинации на первую страницу чтобы пользователь видел новую точку
            currentPage = 0;
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(hit.isHit() ? FacesMessage.SEVERITY_INFO : FacesMessage.SEVERITY_ERROR,
                            "Результат проверки",
                            hit.isHit() ? "Попадание" : "Промах"));
        } catch (Exception e) {
            System.err.println("Ошибка сохранения: " + e.getMessage());
            e.printStackTrace();
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, "Ошибка", "Не удалось сохранить результат."));
        }

        Double keepR = hit.getR();
        newResult = new HitResult();
        newResult.setR(keepR);
    }

    @Transactional
    public void clearResults() {
        try {
            entityManager.createQuery("DELETE FROM HitResult").executeUpdate();
            if (results != null) results.clear();
            currentPage = 0;
        } catch (Exception e) {
            System.err.println("Ошибка очистки: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private List<String> parseTagsString(String src) {
        if (src == null) return new ArrayList<>();
        return Arrays.stream(src.split("[,;]"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    public List<HitResult> getFilteredResults() {
        if (results == null) return new ArrayList<>();
        if (filterQuery == null || filterQuery.trim().isEmpty()) return results;

        List<String> filters = parseTagsString(filterQuery).stream()
                .map(s -> s.toLowerCase(Locale.ROOT))
                .collect(Collectors.toList());
        if (filters.isEmpty()) return results;

        return results.stream().filter(hr -> {
            try {
                Method m = hr.getClass().getMethod("getTags");
                Object tagsObj = m.invoke(hr);
                if (!(tagsObj instanceof List)) return false;
                @SuppressWarnings("unchecked")
                List<String> tags = (List<String>) tagsObj;
                if (tags == null || tags.isEmpty()) return false;
                Set<String> lower = tags.stream().map(s -> s.toLowerCase(Locale.ROOT)).collect(Collectors.toSet());
                for (String f : filters) if (lower.contains(f)) return true;
                return false;
            } catch (NoSuchMethodException nsme) {
                try {
                    Method mj = hr.getClass().getMethod("getTagsJoined");
                    Object joined = mj.invoke(hr);
                    if (joined instanceof String) {
                        String joinedStr = ((String) joined).toLowerCase(Locale.ROOT);
                        for (String f : filters) if (joinedStr.contains(f)) return true;
                    }
                } catch (Exception ex) {
                    return false;
                }
                return false;
            } catch (Exception e) {
                return false;
            }
        }).collect(Collectors.toList());
    }

    public void applyFilter() {
        currentPage = 0;
    }

    public void clearFilter() {
        filterQuery = null;
        currentPage = 0;
    }


    public List<HitResult> getPaginatedResults() {
        List<HitResult> base = getFilteredResults();
        if (base == null || base.isEmpty()) return new ArrayList<>();
        int start = currentPage * RESULTS_PER_PAGE;
        if (start >= base.size()) { currentPage = 0; start = 0; }
        int end = Math.min(start + RESULTS_PER_PAGE, base.size());
        return new ArrayList<>(base.subList(start, end));
    }

    public int getTotalPages() {
        List<HitResult> base = getFilteredResults();
        if (base == null || base.isEmpty()) return 0;
        return (int) Math.ceil((double) base.size() / RESULTS_PER_PAGE);
    }

    public void nextPage() { if (currentPage < getTotalPages() - 1) currentPage++; }
    public void previousPage() { if (currentPage > 0) currentPage--; }


    public HitResult getNewResult() { return newResult; }
    public void setNewResult(HitResult newResult) { this.newResult = newResult; }

    public List<HitResult> getResults() { return results; }

    public Double getGraphX() { return graphX; }
    public void setGraphX(Double graphX) { this.graphX = graphX; }

    public Double getGraphY() { return graphY; }
    public void setGraphY(Double graphY) { this.graphY = graphY; }

    public String getGraphTags() { return graphTags; }
    public void setGraphTags(String graphTags) { this.graphTags = graphTags; }

    public String getFilterQuery() { return filterQuery; }
    public void setFilterQuery(String filterQuery) { this.filterQuery = filterQuery; }

    public int getCurrentPage() { return currentPage; }
    public void setCurrentPage(int currentPage) { this.currentPage = currentPage; }
}