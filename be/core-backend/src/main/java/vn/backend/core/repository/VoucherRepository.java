package vn.backend.core.repository;

import org.apache.commons.lang3.StringUtils;
import org.jooq.*;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.util.CommonUtils;
import vn.backend.entity.data.mysql.Voucher;

import java.util.ArrayList;
import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.InvoiceVoucher.INVOICE_VOUCHER;
import static vn.entity.backend.tables.Voucher.VOUCHER;
import static vn.entity.backend.tables.Branch.BRANCH;

@Repository
public class VoucherRepository {

    @Autowired
    private DSLContext dsl;

    private static List<Field<?>> getFields() {
        return asList(
                VOUCHER.ID,
                VOUCHER.CODE,
                VOUCHER.NAME,
                VOUCHER.DISCOUNT_TYPE,
                VOUCHER.DISCOUNT_VALUE,
                VOUCHER.MAX_DISCOUNT,
                VOUCHER.MIN_INVOICE_AMOUNT,
                VOUCHER.TOTAL_QUANTITY,
                VOUCHER.START_DATE,
                VOUCHER.END_DATE,
                VOUCHER.PER_USER_LIMIT,
                VOUCHER.STATUS,
                VOUCHER.BRANCH_ID,
                VOUCHER.DESCRIPTION,
                VOUCHER.CREATED_AT,
                VOUCHER.UPDATED_AT
        );
    }

    private Condition where(String keyword, Integer status, Integer branchId) {
        Condition c = DSL.trueCondition();

        if (StringUtils.isNotBlank(keyword)) {
            String kw = "%" + keyword.toLowerCase() + "%";
            c = c.and(
                    DSL.lower(VOUCHER.CODE).like(kw)
                            .or(DSL.lower(VOUCHER.NAME).like(kw))
            );
        }

        if (CommonUtils.NVL(status) > 0) {
            c = c.and(VOUCHER.STATUS.eq(status));
        }

        if (CommonUtils.NVL(branchId) > 0) {
            c = c.and(VOUCHER.BRANCH_ID.eq(branchId));
        }

        return c;
    }

    // ==========================
    // LIST
    // ==========================

    public List<Voucher> getByCriteria(
            String keyword,
            Integer status,
            Integer branchId,
            Pageable pageable) {

        List<Field<?>> fields = new ArrayList<>(getFields());
        fields.add(BRANCH.NAME.as("branch_name"));
        fields.add(
                DSL.selectCount()
                        .from(INVOICE_VOUCHER)
                        .where(INVOICE_VOUCHER.VOUCHER_ID.eq(VOUCHER.ID))
                        .asField("usage_quantity")
        );

        return dsl.select(fields)
                .from(VOUCHER)
                .leftJoin(BRANCH).on(BRANCH.ID.eq(VOUCHER.BRANCH_ID))
                .where(where(keyword, status, branchId))
                .orderBy(VOUCHER.CREATED_AT.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getLimit())
                .fetchInto(Voucher.class);
    }


    public Long countByCriteria(String keyword, Integer status, Integer branchId) {
        return dsl.selectCount()
                .from(VOUCHER)
                .where(where(keyword, status, branchId))
                .fetchOne(0, Long.class);
    }

    // ==========================
    // GET ONE
    // ==========================

    public Voucher getById(Integer id) {
        return dsl.select(getFields())
                .from(VOUCHER)
                .where(VOUCHER.ID.eq(id))
                .fetchOptionalInto(Voucher.class)
                .orElse(null);
    }

    public Voucher getByCode(String code) {
        return dsl.select(getFields())
                .from(VOUCHER)
                .where(VOUCHER.CODE.eq(code))
                .fetchOptionalInto(Voucher.class)
                .orElse(null);
    }

    // ==========================
    // INSERT
    // ==========================

    public Voucher insert(Voucher v) {
        dsl.insertInto(VOUCHER)
                .set(VOUCHER.CODE, v.getCode())
                .set(VOUCHER.NAME, v.getName())
                .set(VOUCHER.DISCOUNT_TYPE, v.getDiscountType())
                .set(VOUCHER.DISCOUNT_VALUE, v.getDiscountValue())
                .set(VOUCHER.MAX_DISCOUNT, v.getMaxDiscount())
                .set(VOUCHER.MIN_INVOICE_AMOUNT, v.getMinInvoiceAmount())
                .set(VOUCHER.TOTAL_QUANTITY, v.getTotalQuantity())
                .set(VOUCHER.START_DATE, v.getStartDate())
                .set(VOUCHER.END_DATE, v.getEndDate())
                .set(VOUCHER.PER_USER_LIMIT, v.getPerUserLimit())
                .set(VOUCHER.STATUS, v.getStatus())
                .set(VOUCHER.BRANCH_ID, v.getBranchId())
                .set(VOUCHER.DESCRIPTION, v.getDescription())
                .execute();

        v.setId(dsl.lastID().intValue());
        return v;
    }

    // ==========================
    // UPDATE
    // ==========================

    public Voucher update(Voucher v) {
        dsl.update(VOUCHER)
                .set(VOUCHER.NAME, v.getName())
                .set(VOUCHER.DISCOUNT_TYPE, v.getDiscountType())
                .set(VOUCHER.DISCOUNT_VALUE, v.getDiscountValue())
                .set(VOUCHER.MAX_DISCOUNT, v.getMaxDiscount())
                .set(VOUCHER.MIN_INVOICE_AMOUNT, v.getMinInvoiceAmount())
                .set(VOUCHER.TOTAL_QUANTITY, v.getTotalQuantity())
                .set(VOUCHER.START_DATE, v.getStartDate())
                .set(VOUCHER.END_DATE, v.getEndDate())
                .set(VOUCHER.PER_USER_LIMIT, v.getPerUserLimit())
                .set(VOUCHER.STATUS, v.getStatus())
                .set(VOUCHER.BRANCH_ID, v.getBranchId())
                .set(VOUCHER.DESCRIPTION, v.getDescription())
                .where(VOUCHER.ID.eq(v.getId()))
                .execute();

        return v;
    }

    public Integer delete(Integer id) {
        return dsl.delete(VOUCHER)
                .where(VOUCHER.ID.eq(id))
                .execute();
    }
}
