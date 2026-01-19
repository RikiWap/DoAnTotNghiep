package vn.backend.core.repository;

import org.apache.commons.lang3.StringUtils;
import org.jooq.*;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.constant.InvoiceConstant;
import vn.backend.core.util.CommonUtils;
import vn.backend.entity.data.mysql.Invoice;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.BoughtProduct.BOUGHT_PRODUCT;
import static vn.entity.backend.tables.BoughtService.BOUGHT_SERVICE;
import static vn.entity.backend.tables.Customer.CUSTOMER;
import static vn.entity.backend.tables.Invoice.INVOICE;
import static vn.entity.backend.tables.User.USER;

@Repository
public class InvoiceRepository {

    @Autowired
    private DSLContext dslContext;

    // ==========================
    //   FIELDS
    // ==========================

    private static List<Field<?>> getFields() {
        return asList(
                INVOICE.ID,
                INVOICE.INVOICE_CODE,
                INVOICE.INVOICE_TYPE,
                INVOICE.AMOUNT,
                INVOICE.DISCOUNT,
                INVOICE.VAT_AMOUNT,
                INVOICE.FEE,
                INVOICE.AMOUNT_CARD,
                INVOICE.PAID,
                INVOICE.DEBT,
                INVOICE.PAYMENT_TYPE,
                INVOICE.STATUS,
                INVOICE.STATUS_TEMP,
                INVOICE.RECEIPT_IMAGE,
                INVOICE.RECEIPT_DATE,
                INVOICE.CREATED_TIME,
                INVOICE.UPDATED_TIME,
                INVOICE.USER_ID,
                INVOICE.CUSTOMER_ID,
                INVOICE.BRANCH_ID
        );
    }

    private Condition getWhereCondition(String keyword, Integer customerId, Integer status) {
        Condition condition = DSL.trueCondition();

        if (!StringUtils.isBlank(keyword)) {
            String kw = "%" + keyword.trim().toLowerCase() + "%";

            condition = condition.and(
                    DSL.lower(INVOICE.INVOICE_CODE).like(kw)
                            .or(DSL.lower(INVOICE.INVOICE_TYPE).like(kw))
            );
        }

        if (CommonUtils.NVL(customerId) > 0) {
            condition = condition.and(INVOICE.CUSTOMER_ID.eq(customerId));
        }

        if (CommonUtils.NVL(status) > 0) {
            condition = condition.and(INVOICE.STATUS.eq(status));
        }

        return condition;
    }

    public Double calculateDraftAmount(Integer invoiceId) {
        Double productTotal = dslContext
                .select(DSL.coalesce(DSL.sum(BOUGHT_PRODUCT.FEE), 0.0))
                .from(BOUGHT_PRODUCT)
                .where(
                        BOUGHT_PRODUCT.INVOICE_ID.eq(invoiceId)
                                .and(BOUGHT_PRODUCT.STATUS.eq(1))
                )
                .fetchOne(0, Double.class);

        Double serviceTotal = dslContext
                .select(DSL.coalesce(DSL.sum(BOUGHT_SERVICE.FEE), 0.0))
                .from(BOUGHT_SERVICE)
                .where(
                        BOUGHT_SERVICE.INVOICE_ID.eq(invoiceId)
                                .and(BOUGHT_SERVICE.STATUS.eq(1))
                )
                .fetchOne(0, Double.class);

        return CommonUtils.NVL(productTotal) + CommonUtils.NVL(serviceTotal);
    }


    // ==========================
    //   CRUD LIST
    // ==========================

    public List<Invoice> getInvoiceByCriteria(String keyword, Integer customerId, Integer status, Pageable pageable) {

        var u = USER.as("u");
        var c = CUSTOMER.as("c");

        List<Field<?>> selected = new ArrayList<>(getFields());
        selected.add(c.NAME.as("customerName"));
        selected.add(u.NAME.as("userName"));

        Condition condition = getWhereCondition(keyword, customerId, status);

        SelectConditionStep<Record> select = dslContext
                .select(selected)
                .from(INVOICE)
                .leftJoin(c).on(c.ID.eq(INVOICE.CUSTOMER_ID))
                .leftJoin(u).on(u.ID.eq(INVOICE.USER_ID))
                .where(condition);

        select.orderBy(INVOICE.RECEIPT_DATE.desc().nullsLast())
                .offset(pageable.getOffset())
                .limit(pageable.getLimit());

        return select.fetchInto(Invoice.class);
    }

    public Long countInvoiceByCriteria(String keyword, Integer customerId, Integer status) {
        Condition condition = getWhereCondition(keyword, customerId, status);

        return dslContext
                .selectCount()
                .from(INVOICE)
                .where(condition)
                .fetchOne(0, Long.class);
    }

    // ==========================
    //  CRUD: GET ONE
    // ==========================

    public Invoice getInvoiceById(Integer id) {

        var u = USER.as("u");
        var c = CUSTOMER.as("c");

        List<Field<?>> selected = new ArrayList<>(getFields());
        selected.add(c.NAME.as("customerName"));
        selected.add(u.NAME.as("userName"));

        return dslContext
                .select(selected)
                .from(INVOICE)
                .leftJoin(c).on(c.ID.eq(INVOICE.CUSTOMER_ID))
                .leftJoin(u).on(u.ID.eq(INVOICE.USER_ID))
                .where(INVOICE.ID.eq(id))
                .fetchOptionalInto(Invoice.class)
                .orElse(null);
    }

    // Lấy hóa đơn nháp của khách hàng
    public Invoice getDraftInvoice(Integer customerId) {
        return dslContext
                .select(getFields())
                .from(INVOICE)
                .where(INVOICE.CUSTOMER_ID.eq(customerId))
                .and(INVOICE.STATUS.eq(InvoiceConstant.STATUS_DRAFT))
                .fetchOptionalInto(Invoice.class)
                .orElse(null);
    }

    // ==========================
    //  INSERT
    // ==========================

    public Integer updateInvoiceAmount(Integer invoiceId, Double amount) {
        return dslContext.update(INVOICE)
                .set(INVOICE.AMOUNT, CommonUtils.NVL(amount))
                .where(INVOICE.ID.eq(invoiceId))
                .execute();
    }

    public Invoice insertInvoice(Invoice invoice) {
        LocalDateTime now = LocalDateTime.now();

        dslContext.insertInto(INVOICE)
                .set(INVOICE.INVOICE_CODE, invoice.getInvoiceCode())
                .set(INVOICE.INVOICE_TYPE, invoice.getInvoiceType())
                .set(INVOICE.AMOUNT, invoice.getAmount())
                .set(INVOICE.DISCOUNT, invoice.getDiscount())
                .set(INVOICE.VAT_AMOUNT, invoice.getVatAmount())
                .set(INVOICE.FEE, invoice.getFee())
                .set(INVOICE.AMOUNT_CARD, invoice.getAmountCard())
                .set(INVOICE.PAID, invoice.getPaid())
                .set(INVOICE.DEBT, invoice.getDebt())
                .set(INVOICE.PAYMENT_TYPE, invoice.getPaymentType())
                .set(INVOICE.STATUS, invoice.getStatus())
                .set(INVOICE.STATUS_TEMP, invoice.getStatusTemp())
                .set(INVOICE.RECEIPT_IMAGE, invoice.getReceiptImage())
                .set(INVOICE.RECEIPT_DATE, invoice.getReceiptDate())
                .set(INVOICE.CREATED_TIME, now)
                .set(INVOICE.UPDATED_TIME, now)
                .set(INVOICE.USER_ID, invoice.getUserId())
                .set(INVOICE.CUSTOMER_ID, invoice.getCustomerId())
                .set(INVOICE.BRANCH_ID, invoice.getBranchId())
                .execute();

        invoice.setId(dslContext.lastID().intValue());
        return invoice;
    }

    public Invoice insertDraftInvoice(Integer customerId, Integer userId, Integer branchId) {
        LocalDateTime now = LocalDateTime.now();

        dslContext.insertInto(INVOICE)
                .set(INVOICE.INVOICE_CODE, CommonUtils.nextCode("INV"))
                .set(INVOICE.INVOICE_TYPE, "SALE")
                .set(INVOICE.AMOUNT, 0D)
                .set(INVOICE.DISCOUNT, 0D)
                .set(INVOICE.FEE, 0D)
                .set(INVOICE.PAYMENT_TYPE, 0)
                .set(INVOICE.STATUS, InvoiceConstant.STATUS_DRAFT)
                .set(INVOICE.CREATED_TIME, now)
                .set(INVOICE.UPDATED_TIME, now)
                .set(INVOICE.USER_ID, userId)
                .set(INVOICE.CUSTOMER_ID, customerId)
                .set(INVOICE.BRANCH_ID, branchId)
                .execute();

        Integer id = dslContext.lastID().intValue();

        return getInvoiceById(id);
    }

    // ==========================
    //  UPDATE
    // ==========================

    public Invoice updateInvoice(Invoice invoice) {
        LocalDateTime now = LocalDateTime.now();

        dslContext.update(INVOICE)
                .set(INVOICE.INVOICE_CODE, invoice.getInvoiceCode())
                .set(INVOICE.INVOICE_TYPE, invoice.getInvoiceType())
                .set(INVOICE.AMOUNT, invoice.getAmount())
                .set(INVOICE.DISCOUNT, invoice.getDiscount())
                .set(INVOICE.VAT_AMOUNT, invoice.getVatAmount())
                .set(INVOICE.FEE, invoice.getFee())
                .set(INVOICE.AMOUNT_CARD, invoice.getAmountCard())
                .set(INVOICE.PAID, invoice.getPaid())
                .set(INVOICE.DEBT, invoice.getDebt())
                .set(INVOICE.PAYMENT_TYPE, invoice.getPaymentType())
                .set(INVOICE.STATUS, invoice.getStatus())
                .set(INVOICE.STATUS_TEMP, invoice.getStatusTemp())
                .set(INVOICE.RECEIPT_IMAGE, invoice.getReceiptImage())
                .set(INVOICE.RECEIPT_DATE, invoice.getReceiptDate())
                .set(INVOICE.UPDATED_TIME, now)
                .set(INVOICE.USER_ID, invoice.getUserId())
                .set(INVOICE.CUSTOMER_ID, invoice.getCustomerId())
                .set(INVOICE.BRANCH_ID, invoice.getBranchId())
                .where(INVOICE.ID.eq(invoice.getId()))
                .execute();

        return invoice;
    }

    public Integer updateStatus(Integer id, Integer status) {
        UpdateConditionStep<?> update = dslContext.update(INVOICE)
                .set(INVOICE.STATUS, status)
                .where(INVOICE.ID.eq(id));
        return update
                .execute();
    }

    // ==========================
    //  DELETE
    // ==========================

    public Integer deleteInvoice(Integer id) {
        return dslContext
                .delete(INVOICE)
                .where(INVOICE.ID.eq(id))
                .execute();
    }
}
