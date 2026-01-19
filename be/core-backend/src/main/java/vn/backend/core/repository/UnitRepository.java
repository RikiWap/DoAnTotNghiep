package vn.backend.core.repository;

import org.apache.commons.lang3.StringUtils;
import org.jooq.*;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.util.CommonUtils;
import vn.backend.entity.data.mysql.Unit;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.Unit.UNIT;

@Repository
public class UnitRepository {

    @Autowired
    private DSLContext dsl;

    private static List<Field<?>> getUnitFields() {
        return asList(
                UNIT.ID,
                UNIT.NAME,
                UNIT.STATUS,
                UNIT.POSITION,
                UNIT.CREATED_TIME,
                UNIT.UPDATED_TIME
        );
    }

    private Condition getWhereCondition(String name, Integer status) {
        Condition condition = DSL.trueCondition();

        if (StringUtils.isNotBlank(name)) {
            condition = condition.and(DSL.lower(UNIT.NAME)
                    .like("%" + name.trim().toLowerCase() + "%"));
        }

        if (CommonUtils.NVL(status) >  0) {
            condition = condition.and(UNIT.STATUS.eq(status));
        }

        return condition;
    }

    public List<Unit> getUnitByCriteria(String name, Integer status, Pageable pageable) {
        Condition condition = getWhereCondition(name, status);
        SelectConditionStep<?> select =  dsl.select(getUnitFields())
                .from(UNIT)
                .where(condition);
        return select
                .orderBy(UNIT.POSITION.asc(), UNIT.ID.asc())
                .limit(pageable.getLimit())
                .offset(pageable.getOffset())
                .fetchInto(Unit.class);
    }

    public Long countUnitByCriteria(String name, Integer status) {
        Condition condition = getWhereCondition(name, status);

        return dsl.selectCount()
                .from(UNIT)
                .where(condition)
                .fetchOne(0, Long.class);
    }

    public Unit getUnitById(Integer id) {
        return dsl.select(getUnitFields())
                .from(UNIT)
                .where(UNIT.ID.eq(id))
                .fetchOptionalInto(Unit.class)
                .orElse(null);
    }

    public Unit insertUnit(Unit unit) {
        LocalDateTime now = LocalDateTime.now();

        dsl.insertInto(UNIT,
                        UNIT.NAME,
                        UNIT.STATUS,
                        UNIT.POSITION,
                        UNIT.CREATED_TIME,
                        UNIT.UPDATED_TIME)
                .values(
                        unit.getName(),
                        CommonUtils.NVL(unit.getStatus(), 1),
                        CommonUtils.NVL(unit.getPosition(), 0),
                        now,
                        now
                )
                .execute();

        unit.setId(dsl.lastID().intValue());
        unit.setCreatedTime(now);
        unit.setUpdatedTime(now);

        return unit;
    }

    public Unit updateUnit(Unit unit) {
        LocalDateTime now = LocalDateTime.now();

        dsl.update(UNIT)
                .set(UNIT.NAME, unit.getName())
                .set(UNIT.STATUS, CommonUtils.NVL(unit.getStatus(), 1))
                .set(UNIT.POSITION, CommonUtils.NVL(unit.getPosition(), 0))
                .set(UNIT.UPDATED_TIME, now)
                .where(UNIT.ID.eq(unit.getId()))
                .execute();

        unit.setUpdatedTime(now);
        return unit;
    }

    public Integer deleteUnit(Integer id) {
        return dsl.delete(UNIT)
                .where(UNIT.ID.eq(id))
                .execute();
    }

    public Integer updateUnitStatus(Integer id, Integer status) {
        return dsl.update(UNIT)
                .set(UNIT.STATUS, status)
                .where(UNIT.ID.eq(id))
                .execute();
    }
}
