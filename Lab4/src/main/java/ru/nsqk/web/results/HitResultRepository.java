// HitResultRepository.java
package ru.nsqk.web.results;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.nsqk.web.user.User;

import java.util.List;

public interface HitResultRepository extends JpaRepository<HitResult, Long> {

    // ДОБАВИТЬ ЭТОТ МЕТОД
    List<HitResult> findAllByUserOrderByIdDesc(User user);
}