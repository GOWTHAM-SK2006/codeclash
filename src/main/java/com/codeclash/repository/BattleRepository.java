package com.codeclash.repository;

import com.codeclash.entity.Battle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BattleRepository extends JpaRepository<Battle, Long> {
    List<Battle> findByStatus(String status);

    long countByWinnerId(Long winnerId);
}
