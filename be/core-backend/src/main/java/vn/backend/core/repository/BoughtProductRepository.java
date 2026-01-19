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
import vn.backend.entity.data.mysql.BoughtProduct;

import java.util.ArrayList;
import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.BoughtProduct.BOUGHT_PRODUCT;

@Repository
public class BoughtProductRepository {

    @Autowired
    private DSLContext dslContext;

    /* ==============================
     * Fields
     * ============================== */

    public static List<Field<?>> getBoughtProductFields() {
        List<Field<?>> fields = new ArrayList<>(getBoughtProductFieldsWithoutId());
        fields.add(BOUGHT_PRODUCT.ID);
        return fields;
    }

    public static List<Field<?>> getBoughtProductFieldsWithoutId() {
        return asList(
                BOUGHT_PRODUCT.PRODUCT_ID,
                BOUGHT_PRODUCT.UNIT_ID,
                BOUGHT_PRODUCT.PRICE,
                BOUGHT_PRODUCT.QTY,
                BOUGHT_PRODUCT.FEE,
                BOUGHT_PRODUCT.SALE_ID,
                BOUGHT_PRODUCT.NOTE,
                BOUGHT_PRODUCT.STATUS,
                BOUGHT_PRODUCT.CUSTOMER_ID,
                BOUGHT_PRODUCT.INVOICE_ID
        );
    }

    /* ==============================
     * Condition
     * ============================== */

    private Condition getWhereCondition(Integer invoiceId, Integer status) {
        Condition condition = DSL.trueCondition();

        if (invoiceId != null && invoiceId > 0) {
            condition = condition.and(BOUGHT_PRODUCT.INVOICE_ID.eq(invoiceId));
        }

        if (status != null && status > 0) {
            condition = condition.and(BOUGHT_PRODUCT.STATUS.eq(status));
        }

        return condition;
    }

    /* ==============================
     * Query
     * ============================== */

    public List<BoughtProduct> getByCriteria(
            Integer invoiceId,
            Integer status,
            Pageable pageable
    ) {
        SelectConditionStep<Record> select = dslContext
                .select(getBoughtProductFields())
                .from(BOUGHT_PRODUCT)
                .where(getWhereCondition(invoiceId, status));

        select.orderBy(BOUGHT_PRODUCT.ID.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getLimit());

        return select.fetchInto(BoughtProduct.class);
    }

    public Long countByCriteria(Integer invoiceId, Integer status) {
        return dslContext
                .selectCount()
                .from(BOUGHT_PRODUCT)
                .where(getWhereCondition(invoiceId, status))
                .fetchOne(0, Long.class);
    }

    public BoughtProduct getById(Integer id) {
        return dslContext
                .select(getBoughtProductFields())
                .from(BOUGHT_PRODUCT)
                .where(BOUGHT_PRODUCT.ID.eq(id))
                .fetchOptionalInto(BoughtProduct.class)
                .orElse(new BoughtProduct());
    }

    /* ==============================
     * Command
     * ============================== */

    public BoughtProduct insert(BoughtProduct product) {
        dslContext
                .insertInto(BOUGHT_PRODUCT, getBoughtProductFieldsWithoutId())
                .values(
                        product.getProductId(),
                        product.getUnitId(),
                        product.getPrice(),
                        product.getQty(),
                        product.getFee(),
                        product.getSaleId(),
                        product.getNote(),
                        product.getStatus(),
                        product.getCustomerId(),
                        product.getInvoiceId()
                )
                .execute();

        product.setId(dslContext.lastID().intValue());
        return product;
    }

    public BoughtProduct update(BoughtProduct product) {
        dslContext
                .update(BOUGHT_PRODUCT)
                .set(BOUGHT_PRODUCT.QTY, product.getQty())
                .set(BOUGHT_PRODUCT.PRICE, product.getPrice())
                .set(BOUGHT_PRODUCT.FEE, product.getFee())
                .set(BOUGHT_PRODUCT.NOTE, product.getNote())
                .where(BOUGHT_PRODUCT.ID.eq(product.getId()))
                .execute();

        return product;
    }

    public Integer delete(Integer id) {
        return dslContext
                .delete(BOUGHT_PRODUCT)
                .where(BOUGHT_PRODUCT.ID.eq(id))
                .execute();
    }
}
