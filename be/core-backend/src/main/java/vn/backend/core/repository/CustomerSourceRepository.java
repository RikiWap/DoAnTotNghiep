package vn.backend.core.repository;

import lombok.RequiredArgsConstructor;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.entity.data.mysql.CustomerSource;

import java.util.List;

import static org.jooq.impl.DSL.*;
import static vn.entity.backend.tables.CustomerSource.CUSTOMER_SOURCE;

@Repository
@RequiredArgsConstructor
public class CustomerSourceRepository {

    private final DSLContext dsl;

    private Condition where(String name, Integer status) {
        Condition condition = noCondition();

        if (name != null && !name.isBlank()) {
            condition = condition.and(CUSTOMER_SOURCE.NAME.likeIgnoreCase("%" + name + "%"));
        }
        if (status != null) {
            condition = condition.and(CUSTOMER_SOURCE.STATUS.eq(status));
        }
        return condition;
    }

    public List<CustomerSource> getByCriteria(
            String name,
            Integer status,
            Pageable pageable) {

        return dsl.selectFrom(CUSTOMER_SOURCE)
                .where(where(name, status))
                .orderBy(CUSTOMER_SOURCE.CREATED_TIME.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getLimit())
                .fetchInto(CustomerSource.class);
    }

    public Long countByCriteria(String name, Integer status) {
        return dsl.selectCount()
                .from(CUSTOMER_SOURCE)
                .where(where(name, status))
                .fetchOne(0, Long.class);
    }

    public CustomerSource insert(CustomerSource source) {
        return dsl.insertInto(CUSTOMER_SOURCE)
                .set(CUSTOMER_SOURCE.NAME, source.getName())
                .set(CUSTOMER_SOURCE.STATUS, source.getStatus())
                .returning()
                .fetchOne()
                .into(CustomerSource.class);
    }

    public CustomerSource update(CustomerSource source) {
        dsl.update(CUSTOMER_SOURCE)
                .set(CUSTOMER_SOURCE.NAME, source.getName())
                .set(CUSTOMER_SOURCE.STATUS, source.getStatus())
                .where(CUSTOMER_SOURCE.ID.eq(source.getId()))
                .execute();
        return source;
    }

    public Integer updateStatus(Integer id, Integer status) {
        return dsl.update(CUSTOMER_SOURCE)
                .set(CUSTOMER_SOURCE.STATUS, status)
                .where(CUSTOMER_SOURCE.ID.eq(id))
                .execute();
    }

    public Integer delete(Integer id) {
        return dsl.deleteFrom(CUSTOMER_SOURCE)
                .where(CUSTOMER_SOURCE.ID.eq(id))
                .execute();
    }
}
