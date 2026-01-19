package vn.backend.core.repository;

import org.jooq.DSLContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import static vn.entity.backend.tables.CustomerVoucherUsage.CUSTOMER_VOUCHER_USAGE;

@Repository
public class CustomerVoucherUsageRepository {

    @Autowired
    private DSLContext dsl;

    public Integer getUsedCount(Integer voucherId, Integer customerId) {
        return dsl.select(CUSTOMER_VOUCHER_USAGE.USED_COUNT)
                .from(CUSTOMER_VOUCHER_USAGE)
                .where(
                        CUSTOMER_VOUCHER_USAGE.VOUCHER_ID.eq(voucherId)
                                .and(CUSTOMER_VOUCHER_USAGE.CUSTOMER_ID.eq(customerId))
                )
                .fetchOptionalInto(Integer.class)
                .orElse(0);
    }

    public void increaseUsage(Integer voucherId, Integer customerId) {

        boolean exists = dsl.fetchExists(
                dsl.selectOne()
                        .from(CUSTOMER_VOUCHER_USAGE)
                        .where(
                                CUSTOMER_VOUCHER_USAGE.VOUCHER_ID.eq(voucherId)
                                        .and(CUSTOMER_VOUCHER_USAGE.CUSTOMER_ID.eq(customerId))
                        )
        );

        if (exists) {
            dsl.update(CUSTOMER_VOUCHER_USAGE)
                    .set(CUSTOMER_VOUCHER_USAGE.USED_COUNT,
                            CUSTOMER_VOUCHER_USAGE.USED_COUNT.plus(1))
                    .where(
                            CUSTOMER_VOUCHER_USAGE.VOUCHER_ID.eq(voucherId)
                                    .and(CUSTOMER_VOUCHER_USAGE.CUSTOMER_ID.eq(customerId))
                    )
                    .execute();
        } else {
            dsl.insertInto(CUSTOMER_VOUCHER_USAGE)
                    .set(CUSTOMER_VOUCHER_USAGE.VOUCHER_ID, voucherId)
                    .set(CUSTOMER_VOUCHER_USAGE.CUSTOMER_ID, customerId)
                    .set(CUSTOMER_VOUCHER_USAGE.USED_COUNT, 1)
                    .execute();
        }
    }
}
