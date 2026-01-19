package vn.backend.core.repository;

import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.entity.data.mysql.BoughtService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.BoughtService.BOUGHT_SERVICE;

@Repository
public class BoughtServiceRepository {

    @Autowired
    private DSLContext dslContext;

    /* ==============================
     * Fields
     * ============================== */

    public static List<Field<?>> getBoughtServiceFields() {
        List<Field<?>> fields = new ArrayList<>(getBoughtServiceFieldsWithoutId());
        fields.add(BOUGHT_SERVICE.ID);
        return fields;
    }

    public static List<Field<?>> getBoughtServiceFieldsWithoutId() {
        return asList(
                BOUGHT_SERVICE.SERVICE_ID,
                BOUGHT_SERVICE.SERVICE_NUMBER,
                BOUGHT_SERVICE.TREATMENT_NUM,
                BOUGHT_SERVICE.QTY,
                BOUGHT_SERVICE.NOTE,
                BOUGHT_SERVICE.PRICE,
                BOUGHT_SERVICE.DISCOUNT,
                BOUGHT_SERVICE.DISCOUNT_UNIT,
                BOUGHT_SERVICE.PRICE_VARIATION_ID,
                BOUGHT_SERVICE.FEE,
                BOUGHT_SERVICE.SALE_ID,
                BOUGHT_SERVICE.UPDATED_TIME,
                BOUGHT_SERVICE.STATUS,
                BOUGHT_SERVICE.CUSTOMER_ID,
                BOUGHT_SERVICE.INVOICE_ID
        );
    }

    /* ==============================
     * Condition
     * ============================== */

    private Condition getWhereCondition(Integer invoiceId, Integer status) {
        Condition condition = DSL.trueCondition();

        if (invoiceId != null && invoiceId > 0) {
            condition = condition.and(BOUGHT_SERVICE.INVOICE_ID.eq(invoiceId));
        }

        if (status != null && status > 0) {
            condition = condition.and(BOUGHT_SERVICE.STATUS.eq(status));
        }

        return condition;
    }

    /* ==============================
     * Query
     * ============================== */

    public List<BoughtService> getByCriteria(
            Integer invoiceId,
            Integer status,
            Pageable pageable
    ) {
        SelectConditionStep<Record> select = dslContext
                .select(getBoughtServiceFields())
                .from(BOUGHT_SERVICE)
                .where(getWhereCondition(invoiceId, status));

        select.orderBy(BOUGHT_SERVICE.ID.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getLimit());

        return select.fetchInto(BoughtService.class);
    }

    public Long countByCriteria(Integer invoiceId, Integer status) {
        return dslContext
                .selectCount()
                .from(BOUGHT_SERVICE)
                .where(getWhereCondition(invoiceId, status))
                .fetchOne(0, Long.class);
    }

    public BoughtService getById(Integer id) {
        return dslContext
                .select(getBoughtServiceFields())
                .from(BOUGHT_SERVICE)
                .where(BOUGHT_SERVICE.ID.eq(id))
                .fetchOptionalInto(BoughtService.class)
                .orElse(new BoughtService());
    }

    /* ==============================
     * Command
     * ============================== */

    public BoughtService insert(BoughtService service) {
        dslContext
                .insertInto(BOUGHT_SERVICE, getBoughtServiceFieldsWithoutId())
                .values(
                        service.getServiceId(),
                        service.getServiceNumber(),
                        service.getTreatmentNum(),
                        service.getQty(),
                        service.getNote(),
                        service.getPrice(),
                        service.getDiscount(),
                        service.getDiscountUnit(),
                        service.getPriceVariationId(),
                        service.getFee(),
                        service.getSaleId(),
                        LocalDateTime.now(),
                        service.getStatus(),
                        service.getCustomerId(),
                        service.getInvoiceId()
                )
                .execute();

        service.setId(dslContext.lastID().intValue());
        return service;
    }

    public BoughtService update(BoughtService service) {
        dslContext
                .update(BOUGHT_SERVICE)
                .set(BOUGHT_SERVICE.TREATMENT_NUM, service.getTreatmentNum())
                .set(BOUGHT_SERVICE.QTY, service.getQty())
                .set(BOUGHT_SERVICE.PRICE, service.getPrice())
                .set(BOUGHT_SERVICE.FEE, service.getFee())
                .set(BOUGHT_SERVICE.NOTE, service.getNote())
                .set(BOUGHT_SERVICE.UPDATED_TIME, LocalDateTime.now())
                .where(BOUGHT_SERVICE.ID.eq(service.getId()))
                .execute();

        return service;
    }

    public Integer delete(Integer id) {
        return dslContext
                .delete(BOUGHT_SERVICE)
                .where(BOUGHT_SERVICE.ID.eq(id))
                .execute();
    }
}
