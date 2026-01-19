package vn.backend.core.repository;

import org.jooq.DSLContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import static vn.entity.backend.tables.InvoiceVoucher.INVOICE_VOUCHER;

@Repository
public class InvoiceVoucherRepository {

    @Autowired
    private DSLContext dsl;

    public Integer insert(Integer invoiceId, Integer voucherId, Double discountAmount) {

        return dsl.insertInto(INVOICE_VOUCHER)
                .set(INVOICE_VOUCHER.INVOICE_ID, invoiceId)
                .set(INVOICE_VOUCHER.VOUCHER_ID, voucherId)
                .set(INVOICE_VOUCHER.DISCOUNT_AMOUNT, discountAmount)
                .execute();
    }

    public boolean existsByInvoice(Integer invoiceId) {
        return dsl.fetchExists(
                dsl.selectOne()
                        .from(INVOICE_VOUCHER)
                        .where(INVOICE_VOUCHER.INVOICE_ID.eq(invoiceId))
        );
    }

    public Integer countTotalUsed(Integer voucherId) {
        return dsl.selectCount()
                .from(INVOICE_VOUCHER)
                .where(INVOICE_VOUCHER.VOUCHER_ID.eq(voucherId))
                .fetchOne(0, Integer.class);
    }
}
