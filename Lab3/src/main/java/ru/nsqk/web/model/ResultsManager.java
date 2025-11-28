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
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Named("resultsManager")
@ApplicationScoped
public class ResultsManager implements Serializable {

    @PersistenceContext
    private EntityManager entityManager;

    private HitResult newResult;
    private List<HitResult> results;

    // Для клика по графику
    private Double graphX;
    private Double graphY;

    // Для пагинации
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
            System.err.println("Ошибка загрузки результатов из БД: " + e.getMessage());
            e.printStackTrace();
            results = new ArrayList<>();
        }
    }

    @Transactional
    public void addResultFromForm() {
        System.out.println("=== addResultFromForm вызван ===");

        if (newResult.getR() == null) {
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_WARN,
                            "Предупреждение",
                            "Выберите значение R, нажав на одну из кнопок (1, 2, 3, 4, 5)"));
            return;
        }

        if (newResult.getX() == null) {
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_WARN,
                            "Предупреждение",
                            "Выберите значение X из выпадающего списка"));
            return;
        }

        if (newResult.getY() == null) {
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_WARN,
                            "Предупреждение",
                            "Введите значение Y в диапазоне (-5; 5)"));
            return;
        }

        processAndSave(newResult);
    }

    @Transactional
    public void addResultFromGraph() {
        System.out.println("=== addResultFromGraph вызван ===");
        System.out.println("graphX=" + graphX + ", graphY=" + graphY + ", R=" + newResult.getR());

        if (newResult.getR() == null) {
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_WARN,
                            "Предупреждение",
                            "Сначала выберите значение R!"));
            return;
        }

        if (graphX == null || graphY == null) {
            System.err.println("Не все параметры для клика по графику установлены!");
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR,
                            "Ошибка",
                            "Не удалось определить координаты точки!"));
            return;
        }

        HitResult graphHit = new HitResult();
        graphHit.setX(graphX);
        graphHit.setY(graphY);
        graphHit.setR(newResult.getR());

        processAndSave(graphHit);

        // Очищаем временные значения
        graphX = null;
        graphY = null;
    }

    private void processAndSave(HitResult hit) {
        System.out.println("=== processAndSave начат ===");

        long startTime = System.nanoTime();
        hit.checkHit();
        hit.setServerTime(ZonedDateTime.now().format(DateTimeFormatter.ISO_ZONED_DATE_TIME));
        hit.setExecTimeNs(System.nanoTime() - startTime);

        System.out.println("Результат проверки: " + hit.isHit());

        try {
            entityManager.persist(hit);
            entityManager.flush();

            System.out.println("Точка сохранена в БД с ID=" + hit.getId());

            results.add(0, hit);

            String resultText = hit.isHit() ?
                    "Попадание! Точка находится в области" :
                    "Промах! Точка вне области";
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_INFO,
                            "Результат проверки",
                            resultText + " (X=" + String.format("%.2f", hit.getX()) +
                                    ", Y=" + String.format("%.2f", hit.getY()) +
                                    ", R=" + hit.getR() + ")"));

            System.out.println("Точка добавлена в список. Всего точек: " + results.size());

            // Сброс пагинации на первую страницу
            currentPage = 0;
        } catch (Exception e) {
            System.err.println("Ошибка при сохранении в БД: " + e.getMessage());
            e.printStackTrace();
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR,
                            "Ошибка",
                            "Не удалось сохранить результат в базе данных!"));
        }

        Double currentR = hit.getR();
        newResult = new HitResult();
        newResult.setR(currentR);

        System.out.println("=== processAndSave завершён ===");
    }

    @Transactional
    public void clearResults() {
        try {
            entityManager.createQuery("DELETE FROM HitResult").executeUpdate();
            results.clear();
            currentPage = 0;
            System.out.println("Все результаты удалены");
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_INFO,
                            "Успех",
                            "Все результаты успешно удалены!"));
        } catch (Exception e) {
            System.err.println("Ошибка при очистке результатов: " + e.getMessage());
            e.printStackTrace();
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR,
                            "Ошибка",
                            "Не удалось очистить результаты!"));
        }
    }

    // Пагинация
    public List<HitResult> getPaginatedResults() {
        if (results == null || results.isEmpty()) {
            return new ArrayList<>();
        }

        int start = currentPage * RESULTS_PER_PAGE;
        int end = Math.min(start + RESULTS_PER_PAGE, results.size());

        if (start >= results.size()) {
            currentPage = 0;
            start = 0;
            end = Math.min(RESULTS_PER_PAGE, results.size());
        }

        return results.subList(start, end);
    }

    public int getTotalPages() {
        if (results == null || results.isEmpty()) {
            return 0;
        }
        return (int) Math.ceil((double) results.size() / RESULTS_PER_PAGE);
    }

    public void nextPage() {
        if (currentPage < getTotalPages() - 1) {
            currentPage++;
        }
    }

    public void previousPage() {
        if (currentPage > 0) {
            currentPage--;
        }
    }

    public HitResult getNewResult() {
        return newResult;
    }

    public void setNewResult(HitResult newResult) {
        this.newResult = newResult;
    }

    public List<HitResult> getResults() {
        return results;
    }

    public Double getGraphX() {
        return graphX;
    }

    public void setGraphX(Double graphX) {
        this.graphX = graphX;
    }

    public Double getGraphY() {
        return graphY;
    }

    public void setGraphY(Double graphY) {
        this.graphY = graphY;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }
}