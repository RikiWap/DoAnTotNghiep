package vn.backend.core.repository;

import org.apache.commons.lang3.StringUtils;
import org.jooq.*;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.entity.data.mysql.Product;

import java.util.ArrayList;
import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.Product.PRODUCT;
import static vn.entity.backend.tables.CategoryItem.CATEGORY_ITEM;
import static vn.entity.backend.tables.Unit.UNIT;

@Repository
public class ProductRepository {

    @Autowired
    private DSLContext dslContext;

    private static List<Field<?>> getProductFields() {
        return asList(
                PRODUCT.ID,
                PRODUCT.NAME,
                PRODUCT.CATEGORY_ID,
                PRODUCT.CONTENT,
                PRODUCT.CODE,
                PRODUCT.AVATAR,
                PRODUCT.PRICE,
                PRODUCT.DISCOUNT,
                PRODUCT.DISCOUNT_UNIT,
                PRODUCT.POSITION,
                PRODUCT.STATUS,
                PRODUCT.UNIT_ID,
                PRODUCT.TYPE,
                PRODUCT.EXPIRED_PERIOD
        );
    }

    private Condition getWhereCondition(String keyword, Integer categoryId, Integer status, Integer type) {
        Condition condition = DSL.trueCondition();

        if (!StringUtils.isBlank(keyword)) {
            condition = condition.and(
                    DSL.lower(PRODUCT.NAME).like("%" + keyword.trim().toLowerCase() + "%")
            );
        }

        if (categoryId != null && categoryId > 0) {
            condition = condition.and(PRODUCT.CATEGORY_ID.eq(categoryId));
        }

        if (status != null && status >= 0) {
            condition = condition.and(PRODUCT.STATUS.eq(status));
        }

        if (type != null && type > 0) {
            condition = condition.and(PRODUCT.TYPE.eq(type));
        }

        return condition;
    }

    public List<Product> getProductByCriteria(String keyword,
                                              Integer categoryId,
                                              Integer status,
                                              Integer type,
                                              Pageable pageable) {

        var c = CATEGORY_ITEM.as("c");
        var u = UNIT.as("u");

        List<Field<?>> fields = new ArrayList<>(getProductFields());
        fields.add(c.NAME.as("categoryName"));
        fields.add(u.NAME.as("unitName"));

        Condition condition = getWhereCondition(keyword, categoryId, status, type);

        SelectConditionStep<Record> select = dslContext
                .select(fields)
                .from(PRODUCT)
                .leftJoin(c).on(c.ID.eq(PRODUCT.CATEGORY_ID))
                .leftJoin(u).on(u.ID.eq(PRODUCT.UNIT_ID))
                .where(condition);

        select.orderBy(PRODUCT.POSITION.asc(), PRODUCT.ID.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getLimit());

        return select.fetchInto(Product.class);
    }

    public Long countProductByCriteria(String keyword, Integer categoryId, Integer status, Integer type) {
        Condition condition = getWhereCondition(keyword, categoryId, status, type);

        return dslContext
                .selectCount()
                .from(PRODUCT)
                .where(condition)
                .fetchOne(0, Long.class);
    }

    public Product getProductById(Integer id) {
        var c = CATEGORY_ITEM.as("c");
        var u = UNIT.as("u");

        List<Field<?>> fields = new ArrayList<>(getProductFields());
        fields.add(c.NAME.as("categoryName"));
        fields.add(u.NAME.as("unitName"));

        return dslContext
                .select(fields)
                .from(PRODUCT)
                .leftJoin(c).on(c.ID.eq(PRODUCT.CATEGORY_ID))
                .leftJoin(u).on(u.ID.eq(PRODUCT.UNIT_ID))
                .where(PRODUCT.ID.eq(id))
                .fetchOptionalInto(Product.class)
                .orElse(new Product());
    }

    public Product insertProduct(Product product) {
        dslContext.insertInto(PRODUCT)
                .set(PRODUCT.NAME, product.getName())
                .set(PRODUCT.CATEGORY_ID, product.getCategoryId())
                .set(PRODUCT.CONTENT, product.getContent())
                .set(PRODUCT.CODE, product.getCode())
                .set(PRODUCT.AVATAR, product.getAvatar())
                .set(PRODUCT.PRICE, product.getPrice())
                .set(PRODUCT.DISCOUNT, product.getDiscount())
                .set(PRODUCT.DISCOUNT_UNIT, product.getDiscountUnit())
                .set(PRODUCT.POSITION, product.getPosition())
                .set(PRODUCT.STATUS, product.getStatus())
                .set(PRODUCT.UNIT_ID, product.getUnitId())
                .set(PRODUCT.TYPE, product.getType())
                .set(PRODUCT.EXPIRED_PERIOD, product.getExpiredPeriod())
                .execute();

        product.setId(dslContext.lastID().intValue());
        return product;
    }

    public Product updateProduct(Product product) {
        dslContext.update(PRODUCT)
                .set(PRODUCT.NAME, product.getName())
                .set(PRODUCT.CATEGORY_ID, product.getCategoryId())
                .set(PRODUCT.CONTENT, product.getContent())
                .set(PRODUCT.CODE, product.getCode())
                .set(PRODUCT.AVATAR, product.getAvatar())
                .set(PRODUCT.PRICE, product.getPrice())
                .set(PRODUCT.DISCOUNT, product.getDiscount())
                .set(PRODUCT.DISCOUNT_UNIT, product.getDiscountUnit())
                .set(PRODUCT.POSITION, product.getPosition())
                .set(PRODUCT.STATUS, product.getStatus())
                .set(PRODUCT.UNIT_ID, product.getUnitId())
                .set(PRODUCT.TYPE, product.getType())
                .set(PRODUCT.EXPIRED_PERIOD, product.getExpiredPeriod())
                .where(PRODUCT.ID.eq(product.getId()))
                .execute();
        return product;
    }

    public Integer deleteProduct(Integer id) {
        return dslContext
                .delete(PRODUCT)
                .where(PRODUCT.ID.eq(id))
                .execute();
    }
}
