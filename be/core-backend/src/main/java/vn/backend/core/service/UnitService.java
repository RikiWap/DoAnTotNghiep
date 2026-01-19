package vn.backend.core.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.UnitRepository;
import vn.backend.entity.data.mysql.Unit;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j(topic = "UNIT-SERVICE")
@Service
public class UnitService {

    @Autowired
    private UnitRepository repo;

    public Page<Unit> getListUnitByCriteria(String name, Integer status, Pageable pageable) {

        CompletableFuture<List<Unit>> f1 = CompletableFuture.supplyAsync(
                () -> repo.getUnitByCriteria(name, status, pageable));

        CompletableFuture<Long> f2 = CompletableFuture.supplyAsync(
                () -> repo.countUnitByCriteria(name, status));

        List<Unit> list = f1.join();
        Long total = f2.join();

        pageable.setTotal(total);
        return new Page<>(pageable, list);
    }

    public Unit getUnitById(Integer id) {
        return repo.getUnitById(id);
    }

    public Unit upsertUnit(Unit unit) {
        if (unit.getId() == null || unit.getId() <= 0) {
            return repo.insertUnit(unit);
        }
        return repo.updateUnit(unit);
    }

    public Integer deleteUnit(Integer id) {
        return repo.deleteUnit(id);
    }

    public Integer updateUnitStatus(Integer id, Integer status) {
        return repo.updateUnitStatus(id, status);
    }
}
