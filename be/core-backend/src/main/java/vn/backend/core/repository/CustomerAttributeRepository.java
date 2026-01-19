package vn.backend.core.repository;

import org.apache.commons.lang3.StringUtils;
import org.jooq.*;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.util.CommonUtils;
import vn.backend.entity.data.mysql.CustomerAttribute;

import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.CustomerAttribute.CUSTOMER_ATTRIBUTE;

@Repository
public class CustomerAttributeRepository {

    @Autowired
    private DSLContext dslContext;

    private static List<Field<?>> getCustomerAttributeFields() {
        return asList(
                CUSTOMER_ATTRIBUTE.ID,
                CUSTOMER_ATTRIBUTE.NAME,
                CUSTOMER_ATTRIBUTE.FIELD_NAME,
                CUSTOMER_ATTRIBUTE.REQUIRED,
                CUSTOMER_ATTRIBUTE.READONLY,
                CUSTOMER_ATTRIBUTE.UNIQUED,
                CUSTOMER_ATTRIBUTE.DATATYPE,
                CUSTOMER_ATTRIBUTE.ATTRIBUTES,
                CUSTOMER_ATTRIBUTE.POSITION,
                CUSTOMER_ATTRIBUTE.PARENT_ID,
                CUSTOMER_ATTRIBUTE.CREATED_AT
        );
    }

    private Condition getWhereCondition(Integer isParent, String name, String dataType) {
        Condition condition = DSL.trueCondition();

        if (!StringUtils.isBlank(name)) {
            condition = condition.and(DSL.lower(CUSTOMER_ATTRIBUTE.NAME)
                    .like(DSL.val("%" + name.trim().toLowerCase() + "%")));
        }

        if (!StringUtils.isBlank(dataType)) {
            condition = condition.and(CUSTOMER_ATTRIBUTE.DATATYPE.eq(dataType));
        }

        if (CommonUtils.NVL(isParent) == 1) {
            condition = condition.and(CUSTOMER_ATTRIBUTE.PARENT_ID.eq(0));
        }

        if (CommonUtils.NVL(isParent) == 2) {
            condition = condition.and(CUSTOMER_ATTRIBUTE.PARENT_ID.greaterThan(0));
        }

        return condition;
    }

    public List<CustomerAttribute> getCustomerAttributeByCriteria(
            Integer isParent,
            String name,
            String dataType,
            Pageable pageable) {

        Condition condition = getWhereCondition(isParent, name, dataType);

        // Tạo alias cho bảng cha
        Table<?> parent = CUSTOMER_ATTRIBUTE.as("parent");

        // SELECT thêm parent_name
        SelectConditionStep<Record> select = dslContext
                .select(getCustomerAttributeFields())
                .select(parent.field("name", String.class).as("parent_name"))
                .from(CUSTOMER_ATTRIBUTE)
                .leftJoin(parent)
                .on(CUSTOMER_ATTRIBUTE.PARENT_ID.eq(parent.field("id", Integer.class)))
                .where(condition);

        select.orderBy(CUSTOMER_ATTRIBUTE.POSITION.asc())
                .offset(pageable.getOffset())
                .limit(pageable.getLimit());

        return select.fetchInto(CustomerAttribute.class);
    }

    public Long countCustomerAttributeByCriteria(Integer isParent, String name, String dataType) {
        Condition condition = getWhereCondition(isParent, name, dataType);
        return dslContext
                .selectCount()
                .from(CUSTOMER_ATTRIBUTE)
                .where(condition)
                .fetchOne(0, Long.class);
    }

    public CustomerAttribute getCustomerAttributeById(Integer id) {
        return dslContext
                .select(getCustomerAttributeFields())
                .from(CUSTOMER_ATTRIBUTE)
                .where(CUSTOMER_ATTRIBUTE.ID.eq(id))
                .fetchOptionalInto(CustomerAttribute.class)
                .orElse(null);
    }

    public CustomerAttribute insertCustomerAttribute(CustomerAttribute attr) {
        dslContext.insertInto(CUSTOMER_ATTRIBUTE)
                .set(CUSTOMER_ATTRIBUTE.NAME, attr.getName())
                .set(CUSTOMER_ATTRIBUTE.FIELD_NAME, attr.getFieldName())
                .set(CUSTOMER_ATTRIBUTE.REQUIRED, attr.getRequired())
                .set(CUSTOMER_ATTRIBUTE.READONLY, attr.getReadonly())
                .set(CUSTOMER_ATTRIBUTE.UNIQUED, attr.getUniqued())
                .set(CUSTOMER_ATTRIBUTE.DATATYPE, attr.getDatatype())
                .set(CUSTOMER_ATTRIBUTE.ATTRIBUTES, CommonUtils.getJSON(attr.getAttributes()))
                .set(CUSTOMER_ATTRIBUTE.POSITION, attr.getPosition())
                .set(CUSTOMER_ATTRIBUTE.PARENT_ID, attr.getParentId())
                .execute();
        attr.setId(dslContext.lastID().intValue());
        return attr;
    }

    public CustomerAttribute updateCustomerAttribute(CustomerAttribute attr) {
        dslContext.update(CUSTOMER_ATTRIBUTE)
                .set(CUSTOMER_ATTRIBUTE.NAME, attr.getName())
                .set(CUSTOMER_ATTRIBUTE.FIELD_NAME, attr.getFieldName())
                .set(CUSTOMER_ATTRIBUTE.REQUIRED, attr.getRequired())
                .set(CUSTOMER_ATTRIBUTE.READONLY, attr.getReadonly())
                .set(CUSTOMER_ATTRIBUTE.UNIQUED, attr.getUniqued())
                .set(CUSTOMER_ATTRIBUTE.DATATYPE, attr.getDatatype())
                .set(CUSTOMER_ATTRIBUTE.ATTRIBUTES, CommonUtils.getJSON(attr.getAttributes()))
                .set(CUSTOMER_ATTRIBUTE.POSITION, attr.getPosition())
                .set(CUSTOMER_ATTRIBUTE.PARENT_ID, attr.getParentId())
                .where(CUSTOMER_ATTRIBUTE.ID.eq(attr.getId()))
                .execute();
        return attr;
    }

    public Integer deleteCustomerAttribute(Integer id) {
        return dslContext
                .delete(CUSTOMER_ATTRIBUTE)
                .where(CUSTOMER_ATTRIBUTE.ID.eq(id))
                .execute();
    }

    private Condition getWhereCondition(Integer id, String fieldName) {
        Condition condition = DSL.trueCondition();

        if (!CommonUtils.NVL(fieldName).isEmpty()) {
            condition = condition.and(CUSTOMER_ATTRIBUTE.FIELD_NAME.likeRegex(fieldName));
        }

        if (CommonUtils.NVL(id) > 0) {
            condition = condition.and(CUSTOMER_ATTRIBUTE.ID.notEqual(id));
        }
        return condition;
    }

    public CustomerAttribute checkDuplicatedByFieldName(Integer id, String fieldName) {
        return dslContext
                .select()
                .from(CUSTOMER_ATTRIBUTE)
                .where(getWhereCondition(id, fieldName))
                .limit(1)
                .fetchOptionalInto(CustomerAttribute.class)
                .orElse(new CustomerAttribute());
    }
}
