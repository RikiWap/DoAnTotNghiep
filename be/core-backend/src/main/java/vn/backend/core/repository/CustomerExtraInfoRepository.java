package vn.backend.core.repository;

import org.jooq.*;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.entity.data.mysql.CustomerExtraInfo;
import vn.entity.backend.tables.records.CustomerExtraInfoRecord;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.CustomerExtraInfo.CUSTOMER_EXTRA_INFO;
import static vn.entity.backend.tables.CustomerAttribute.CUSTOMER_ATTRIBUTE;
import static vn.entity.backend.tables.Customer.CUSTOMER;

@Repository
public class CustomerExtraInfoRepository {

    @Autowired
    private DSLContext dslContext;

    private static List<Field<?>> getCustomerExtraInfoFields() {
        return asList(
                CUSTOMER_EXTRA_INFO.ID,
                CUSTOMER_EXTRA_INFO.ATTRIBUTE_ID,
                CUSTOMER_EXTRA_INFO.CUSTOMER_ID,
                CUSTOMER_EXTRA_INFO.ATTRIBUTE_VALUE
        );
    }

    /**
     * Lấy tất cả thông tin bổ sung của 1 khách hàng
     */
    public List<CustomerExtraInfo> getCustomerExtraInfoByCustomerId(Integer customerId) {
        List<Field<?>> selectedFields = new ArrayList<>(getCustomerExtraInfoFields());
        selectedFields.addAll(asList(
                CUSTOMER_ATTRIBUTE.DATATYPE.as("datatype"),
                CUSTOMER_ATTRIBUTE.NAME.as("attribute_name"),
                CUSTOMER_ATTRIBUTE.ATTRIBUTES
        ));

        return dslContext
                .select(selectedFields)
                .from(CUSTOMER_EXTRA_INFO)
                .join(CUSTOMER_ATTRIBUTE)
                .on(CUSTOMER_EXTRA_INFO.ATTRIBUTE_ID.eq(CUSTOMER_ATTRIBUTE.ID))
                .where(CUSTOMER_EXTRA_INFO.CUSTOMER_ID.eq(customerId))
                .orderBy(CUSTOMER_EXTRA_INFO.ATTRIBUTE_ID.asc())
                .fetchInto(CustomerExtraInfo.class);
    }

    /**
     * Lấy danh sách extra info cho nhiều khách hàng
     */
    public List<CustomerExtraInfo> getCustomerExtraInfoByCustomerIds(List<Integer> customerIds) {
        if (customerIds == null || customerIds.isEmpty()) return new ArrayList<>();

        List<Field<?>> selectedFields = new ArrayList<>(getCustomerExtraInfoFields());
        selectedFields.addAll(asList(
                CUSTOMER_ATTRIBUTE.DATATYPE.as("datatype"),
                CUSTOMER_ATTRIBUTE.FIELD_NAME.as("field_name"),
                CUSTOMER_ATTRIBUTE.NAME.as("attribute_name"),
                CUSTOMER_ATTRIBUTE.ATTRIBUTES
        ));

        return dslContext
                .select(selectedFields)
                .from(CUSTOMER_EXTRA_INFO)
                .join(CUSTOMER_ATTRIBUTE)
                .on(CUSTOMER_EXTRA_INFO.ATTRIBUTE_ID.eq(CUSTOMER_ATTRIBUTE.ID))
                .where(CUSTOMER_EXTRA_INFO.CUSTOMER_ID.in(customerIds))
                .orderBy(CUSTOMER_EXTRA_INFO.ATTRIBUTE_ID.asc())
                .fetchInto(CustomerExtraInfo.class);
    }

    /**
     * Thêm mới 1 lô thông tin
     */
    public List<CustomerExtraInfo> insertBatchCustomerExtraInfo(List<CustomerExtraInfo> list, Integer customerId) {
        if (list == null || list.isEmpty()) return new ArrayList<>();

        InsertValuesStep3<CustomerExtraInfoRecord, Integer, Integer, String> step =
                dslContext.insertInto(
                        CUSTOMER_EXTRA_INFO,
                        CUSTOMER_EXTRA_INFO.ATTRIBUTE_ID,
                        CUSTOMER_EXTRA_INFO.CUSTOMER_ID,
                        CUSTOMER_EXTRA_INFO.ATTRIBUTE_VALUE
                );

        for (CustomerExtraInfo info : list) {
            step = step.values(
                    DSL.value(info.getAttributeId()),
                    DSL.value(customerId),
                    DSL.value(info.getAttributeValue())
            );
        }

        return step.returning().fetch().into(CustomerExtraInfo.class);
    }

    /**
     * Cập nhật batch
     */
    public List<CustomerExtraInfo> updateBatchCustomerExtraInfo(List<CustomerExtraInfo> list) {
        if (list == null || list.isEmpty()) return new ArrayList<>();

        List<UpdateConditionStep<?>> updates = list.stream()
                .map(info -> dslContext.update(CUSTOMER_EXTRA_INFO)
                        .set(CUSTOMER_EXTRA_INFO.ATTRIBUTE_ID, info.getAttributeId())
                        .set(CUSTOMER_EXTRA_INFO.CUSTOMER_ID, info.getCustomerId())
                        .set(CUSTOMER_EXTRA_INFO.ATTRIBUTE_VALUE, info.getAttributeValue())
                        .where(CUSTOMER_EXTRA_INFO.ID.eq(info.getId())))
                .collect(Collectors.toList());

        dslContext.batch(updates).execute();
        return list;
    }

    /**
     * Xóa theo danh sách attributeId
     */
    public Integer deleteCustomerExtraInfos(List<CustomerExtraInfo> list, Integer customerId) {
        if (list == null || list.isEmpty()) return 0;

        List<Integer> attributeIds = list.stream()
                .map(CustomerExtraInfo::getAttributeId)
                .collect(Collectors.toList());

        return dslContext
                .delete(CUSTOMER_EXTRA_INFO)
                .where(CUSTOMER_EXTRA_INFO.CUSTOMER_ID.eq(customerId)
                        .and(CUSTOMER_EXTRA_INFO.ATTRIBUTE_ID.in(attributeIds)))
                .execute();
    }

    public Integer deleteCustomerExtraInfoByAttributeId(Integer attributeId) {
        return dslContext
                .delete(CUSTOMER_EXTRA_INFO)
                .where(CUSTOMER_EXTRA_INFO.ATTRIBUTE_ID.eq(attributeId))
                .execute();
    }
}
