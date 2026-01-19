package vn.backend.core.repository;

import lombok.RequiredArgsConstructor;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.UpdateConditionStep;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.entity.data.mysql.CallHistory;

import java.util.ArrayList;
import java.util.List;

import static org.jooq.impl.DSL.*;
import static vn.entity.backend.tables.CallHistory.CALL_HISTORY;
import static vn.entity.backend.tables.Customer.CUSTOMER;

@Repository
@RequiredArgsConstructor
public class CallHistoryRepository {

    private final DSLContext dsl;

    private List<org.jooq.Field<?>> getFields() {
        return List.of(
                CALL_HISTORY.ID,
                CALL_HISTORY.USER_ID,
                CALL_HISTORY.CUSTOMER_ID,
                CALL_HISTORY.CALL_TYPE,
                CALL_HISTORY.OUTCOME,
                CALL_HISTORY.INTEREST_LEVEL,
                CALL_HISTORY.DURATION,
                CALL_HISTORY.NOTE,
                CALL_HISTORY.STATUS,
                CALL_HISTORY.CREATED_TIME
        );
    }

    private Condition where(
            Integer userId,
            Integer customerId,
            Integer callType,
            Integer status) {

        Condition condition = noCondition();

        if (userId != null) {
            condition = condition.and(CALL_HISTORY.USER_ID.eq(userId));
        }
        if (customerId != null) {
            condition = condition.and(CALL_HISTORY.CUSTOMER_ID.eq(customerId));
        }
        if (callType != null) {
            condition = condition.and(CALL_HISTORY.CALL_TYPE.eq(callType));
        }
        if (status != null) {
            condition = condition.and(CALL_HISTORY.STATUS.eq(status));
        }
        return condition;
    }

    public List<CallHistory> getByCriteria(
            Integer userId,
            Integer customerId,
            Integer callType,
            Integer status,
            Pageable pageable) {

        List<Field<?>> selectedFields = new ArrayList<>(getFields());
        // Thêm 2 cột join
        selectedFields.add(CUSTOMER.NAME.as("customer_name)"));

        return dsl.select(selectedFields)
                .from(CALL_HISTORY)
                .leftJoin(CUSTOMER).on(CALL_HISTORY.CUSTOMER_ID.eq(CUSTOMER.ID))
                .where(where(userId, customerId, callType, status))
                .orderBy(CALL_HISTORY.CREATED_TIME.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getLimit())
                .fetchInto(CallHistory.class);
    }

    public Long countByCriteria(
            Integer userId,
            Integer customerId,
            Integer callType,
            Integer status) {

        return dsl.selectCount()
                .from(CALL_HISTORY)
                .where(where(userId, customerId, callType, status))
                .fetchOne(0, Long.class);
    }

    public CallHistory insert(CallHistory callHistory) {
        return dsl.insertInto(CALL_HISTORY)
                .set(CALL_HISTORY.USER_ID, callHistory.getUserId())
                .set(CALL_HISTORY.CUSTOMER_ID, callHistory.getCustomerId())
                .set(CALL_HISTORY.CALL_TYPE, callHistory.getCallType())
                .set(CALL_HISTORY.OUTCOME, callHistory.getOutcome())
                .set(CALL_HISTORY.INTEREST_LEVEL, callHistory.getInterestLevel())
                .set(CALL_HISTORY.DURATION, callHistory.getDuration())
                .set(CALL_HISTORY.NOTE, callHistory.getNote())
                .set(CALL_HISTORY.STATUS, callHistory.getStatus())
                .returning()
                .fetchOne()
                .into(CallHistory.class);
    }

    public CallHistory update(CallHistory callHistory) {
        UpdateConditionStep<?> update =
                dsl.update(CALL_HISTORY)
                        .set(CALL_HISTORY.USER_ID, callHistory.getUserId())
                        .set(CALL_HISTORY.CUSTOMER_ID, callHistory.getCustomerId())
                        .set(CALL_HISTORY.CALL_TYPE, callHistory.getCallType())
                        .set(CALL_HISTORY.OUTCOME, callHistory.getOutcome())
                        .set(CALL_HISTORY.INTEREST_LEVEL, callHistory.getInterestLevel())
                        .set(CALL_HISTORY.DURATION, callHistory.getDuration())
                        .set(CALL_HISTORY.NOTE, callHistory.getNote())
                        .set(CALL_HISTORY.STATUS, callHistory.getStatus())
                        .where(CALL_HISTORY.ID.eq(callHistory.getId()));
        update .execute();
        return callHistory;
    }

    public Integer updateStatus(Integer id, Integer status) {
        return dsl.update(CALL_HISTORY)
                .set(CALL_HISTORY.STATUS, status)
                .where(CALL_HISTORY.ID.eq(id))
                .execute();
    }

    public Integer delete(Integer id) {
        return dsl.deleteFrom(CALL_HISTORY)
                .where(CALL_HISTORY.ID.eq(id))
                .execute();
    }
}
