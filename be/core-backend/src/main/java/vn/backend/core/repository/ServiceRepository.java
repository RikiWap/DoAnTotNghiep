package vn.backend.core.repository;

import org.apache.commons.lang3.StringUtils;
import org.jooq.*;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.entity.data.mysql.ServiceItem;

import java.util.ArrayList;
import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.Service.SERVICE;
import static vn.entity.backend.tables.CategoryItem.CATEGORY_ITEM;

@Repository
public class ServiceRepository {

    @Autowired
    private DSLContext dslContext;

    private static List<Field<?>> getServiceFields() {
        return asList(
                SERVICE.ID,
                SERVICE.CATEGORY_ID,
                SERVICE.AVATAR,
                SERVICE.NAME,
                SERVICE.CODE,
                SERVICE.INTRO,
                SERVICE.COST,
                SERVICE.PRICE,
                SERVICE.DISCOUNT,
                SERVICE.PRICE_VARIATION,
                SERVICE.TOTAL_TIME,
                SERVICE.IS_COMBO,
                SERVICE.CREATED_TIME,
                SERVICE.FEATURED,
                SERVICE.TREATMENT_NUM,
                SERVICE.PARENT_ID
        );
    }

    private Condition getWhereCondition(
            String keyword,
            Integer categoryId,
            Integer isCombo,
            Integer featured
    ) {
        Condition cond = DSL.trueCondition();

        if (!StringUtils.isBlank(keyword)) {
            String k = "%" + keyword.trim().toLowerCase() + "%";
            cond = cond.and(DSL.lower(SERVICE.NAME).like(k));
        }

        if (categoryId != null && categoryId > 0) {
            cond = cond.and(SERVICE.CATEGORY_ID.eq(categoryId));
        }

        if (isCombo != null && isCombo >= 0) {
            cond = cond.and(SERVICE.IS_COMBO.eq(isCombo));
        }

        if (featured != null && featured >= 0) {
            cond = cond.and(SERVICE.FEATURED.eq(featured));
        }

        return cond;
    }

    public List<ServiceItem> getServiceByCriteria(
            String keyword,
            Integer categoryId,
            Integer isCombo,
            Integer featured,
            Pageable pageable) {

        var c = CATEGORY_ITEM.as("c");

        List<Field<?>> fields = new ArrayList<>(getServiceFields());
        fields.add(c.NAME.as("categoryName"));

        Condition cond = getWhereCondition(keyword, categoryId, isCombo, featured);

        SelectConditionStep<Record> select = dslContext
                .select(fields)
                .from(SERVICE)
                .leftJoin(c).on(c.ID.eq(SERVICE.CATEGORY_ID))
                .where(cond);

        select.orderBy(SERVICE.CREATED_TIME.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getLimit());

        return select.fetchInto(ServiceItem.class);
    }

    public Long countServiceByCriteria(String keyword, Integer categoryId, Integer isCombo, Integer featured) {
        return dslContext
                .selectCount()
                .from(SERVICE)
                .where(getWhereCondition(keyword, categoryId, isCombo, featured))
                .fetchOne(0, Long.class);
    }

    public ServiceItem getServiceById(Integer id) {
        var c = CATEGORY_ITEM.as("c");

        List<Field<?>> fields = new ArrayList<>(getServiceFields());
        fields.add(c.NAME.as("categoryName"));

        return dslContext
                .select(fields)
                .from(SERVICE)
                .leftJoin(c).on(c.ID.eq(SERVICE.CATEGORY_ID))
                .where(SERVICE.ID.eq(id))
                .fetchOptionalInto(ServiceItem.class)
                .orElse(new ServiceItem());
    }

    public ServiceItem insertService(ServiceItem service) {
        dslContext.insertInto(SERVICE)
                .set(SERVICE.CATEGORY_ID, service.getCategoryId())
                .set(SERVICE.AVATAR, service.getAvatar())
                .set(SERVICE.NAME, service.getName())
                .set(SERVICE.CODE, service.getCode())
                .set(SERVICE.INTRO, service.getIntro())
                .set(SERVICE.COST, service.getCost())
                .set(SERVICE.PRICE, service.getPrice())
                .set(SERVICE.DISCOUNT, service.getDiscount())
                .set(SERVICE.PRICE_VARIATION, service.getPriceVariation())
                .set(SERVICE.TOTAL_TIME, service.getTotalTime())
                .set(SERVICE.IS_COMBO, service.getIsCombo())
                .set(SERVICE.FEATURED, service.getFeatured())
                .set(SERVICE.TREATMENT_NUM, service.getTreatmentNum())
                .set(SERVICE.PARENT_ID, service.getParentId())
                .execute();

        service.setId(dslContext.lastID().intValue());
        return service;
    }

    public ServiceItem updateService(ServiceItem service) {
        dslContext.update(SERVICE)
                .set(SERVICE.CATEGORY_ID, service.getCategoryId())
                .set(SERVICE.AVATAR, service.getAvatar())
                .set(SERVICE.NAME, service.getName())
                .set(SERVICE.CODE, service.getCode())
                .set(SERVICE.INTRO, service.getIntro())
                .set(SERVICE.COST, service.getCost())
                .set(SERVICE.PRICE, service.getPrice())
                .set(SERVICE.DISCOUNT, service.getDiscount())
                .set(SERVICE.PRICE_VARIATION, service.getPriceVariation())
                .set(SERVICE.TOTAL_TIME, service.getTotalTime())
                .set(SERVICE.IS_COMBO, service.getIsCombo())
                .set(SERVICE.FEATURED, service.getFeatured())
                .set(SERVICE.TREATMENT_NUM, service.getTreatmentNum())
                .set(SERVICE.PARENT_ID, service.getParentId())
                .where(SERVICE.ID.eq(service.getId()))
                .execute();
        return service;
    }

    public Integer deleteService(Integer id) {
        return dslContext
                .delete(SERVICE)
                .where(SERVICE.ID.eq(id))
                .execute();
    }
}
