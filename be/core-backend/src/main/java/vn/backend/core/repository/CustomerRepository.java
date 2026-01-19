package vn.backend.core.repository;

import org.apache.commons.lang3.StringUtils;
import org.jooq.*;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.entity.data.mysql.Customer;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.Customer.CUSTOMER;
import static vn.entity.backend.tables.User.USER;

@Repository
public class CustomerRepository {
    @Autowired
    private DSLContext dslContext;

    private static List<Field<?>> getCustomerFields() {
        return asList(
                CUSTOMER.ID,
                CUSTOMER.NAME,
                CUSTOMER.AVATAR,
                CUSTOMER.GENDER,
                CUSTOMER.AGE,
                CUSTOMER.ADDRESS,
                CUSTOMER.PHONE,
                CUSTOMER.EMAIL,
                CUSTOMER.BIRTHDAY,
                CUSTOMER.HEIGHT,
                CUSTOMER.WEIGHT,
                CUSTOMER.USER_ID,
                CUSTOMER.CREATOR_ID,
                CUSTOMER.NOTE,
                CUSTOMER.CREATED_TIME,
                CUSTOMER.UPDATED_TIME,
                CUSTOMER.LATEST_CONTACT,
                CUSTOMER.SOURCE_ID
        );
    }

    private Condition getWhereCondition(String keyword) {
        Condition condition = DSL.trueCondition();

        if (!StringUtils.isBlank(keyword)) {
            Condition keywordCondition =
                    DSL.lower(CUSTOMER.NAME).like("%" + keyword.trim().toLowerCase() + "%")
                            .or(DSL.lower(CUSTOMER.EMAIL).like("%" + keyword.trim().toLowerCase() + "%"))
                            .or(DSL.lower(CUSTOMER.PHONE).like("%" + keyword.trim().toLowerCase() + "%"));

            condition = condition.and(keywordCondition);
        }

        return condition;
    }
    public List<Customer> getCustomerByCriteria(String keyword, Pageable pageable) {
        var u1 = USER.as("u1");
        var u2 = USER.as("u2");

        // Các cột từ bảng chính
        List<Field<?>> selectedFields = new ArrayList<>(getCustomerFields());
        // Thêm 2 cột join
        selectedFields.add(u1.NAME.as("userName"));
        selectedFields.add(u2.NAME.as("creatorName"));


        Condition condition = getWhereCondition(keyword);
        SelectConditionStep<Record> select = dslContext
                .select(selectedFields)
                .from(CUSTOMER)
                .leftJoin(u1).on(u1.ID.eq(CUSTOMER.USER_ID))
                .leftJoin(u2).on(u2.ID.eq(CUSTOMER.CREATOR_ID))
                .where(condition);

        select.orderBy(CUSTOMER.UPDATED_TIME.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getLimit());

        return select.fetchInto(Customer.class);
    }

    public Long countCustomerByCriteria(String keyword) {
        Condition condition = getWhereCondition(keyword);

        return dslContext
                .selectCount()
                .from(CUSTOMER)
                .where(condition)
                .fetchOne(0, Long.class);
    }

    public Customer getCustomerById(Integer id) {
        var u1 = USER.as("u1");
        var u2 = USER.as("u2");

        // Các cột từ bảng chính
        List<Field<?>> selectedFields = new ArrayList<>(getCustomerFields());
        // Thêm 2 cột join
        selectedFields.add(u1.NAME.as("userName"));
        selectedFields.add(u2.NAME.as("creatorName"));

        return dslContext
                .select(selectedFields)
                .from(CUSTOMER)
                .leftJoin(u1).on(u1.ID.eq(CUSTOMER.USER_ID))
                .leftJoin(u2).on(u2.ID.eq(CUSTOMER.CREATOR_ID))
                .where(CUSTOMER.ID.eq(id))
                .fetchOptionalInto(Customer.class)
                .orElse(new Customer());
    }

    public Customer insertCustomer(Customer customer) {
        LocalDateTime now = LocalDateTime.now();
        dslContext.insertInto(CUSTOMER)
                .set(CUSTOMER.NAME, customer.getName())
                .set(CUSTOMER.AVATAR, customer.getAvatar())
                .set(CUSTOMER.GENDER, customer.getGender())
                .set(CUSTOMER.AGE, customer.getAge())
                .set(CUSTOMER.ADDRESS, customer.getAddress())
                .set(CUSTOMER.PHONE, customer.getPhone())
                .set(CUSTOMER.EMAIL, customer.getEmail())
                .set(CUSTOMER.BIRTHDAY, customer.getBirthday())
                .set(CUSTOMER.HEIGHT, customer.getHeight())
                .set(CUSTOMER.WEIGHT, customer.getWeight())
                .set(CUSTOMER.USER_ID, customer.getUserId())
                .set(CUSTOMER.CREATOR_ID, customer.getCreatorId())
                .set(CUSTOMER.NOTE, customer.getNote())
                .set(CUSTOMER.CREATED_TIME, now)
                .set(CUSTOMER.UPDATED_TIME, now)
                .set(CUSTOMER.SOURCE_ID, customer.getSourceId())
                .execute();
        customer.setId(dslContext.lastID().intValue());
        return customer;
    }

    public Customer updateCustomer(Customer customer) {
        LocalDateTime now = LocalDateTime.now();
        dslContext.update(CUSTOMER)
                .set(CUSTOMER.NAME, customer.getName())
                .set(CUSTOMER.AVATAR, customer.getAvatar())
                .set(CUSTOMER.GENDER, customer.getGender())
                .set(CUSTOMER.AGE, customer.getAge())
                .set(CUSTOMER.ADDRESS, customer.getAddress())
                .set(CUSTOMER.PHONE, customer.getPhone())
                .set(CUSTOMER.EMAIL, customer.getEmail())
                .set(CUSTOMER.BIRTHDAY, customer.getBirthday())
                .set(CUSTOMER.HEIGHT, customer.getHeight())
                .set(CUSTOMER.WEIGHT, customer.getWeight())
                .set(CUSTOMER.USER_ID, customer.getUserId())
                .set(CUSTOMER.NOTE, customer.getNote())
                .set(CUSTOMER.UPDATED_TIME, now)
                .set(CUSTOMER.SOURCE_ID, customer.getSourceId())
                .where(CUSTOMER.ID.eq(customer.getId()))
                .execute();
        return customer;
    }

    public Integer deleteCustomer(Integer id) {
        return dslContext
                .delete(CUSTOMER)
                .where(CUSTOMER.ID.eq(id))
                .execute();
    }
}
