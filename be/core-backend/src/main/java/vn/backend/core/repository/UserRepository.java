package vn.backend.core.repository;

import org.apache.commons.lang3.StringUtils;
import org.jooq.*;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.constant.UserConstant;
import vn.backend.core.util.CommonUtils;
import vn.backend.entity.data.mysql.User;

import static org.apache.commons.lang3.StringUtils.isNotEmpty;
import static vn.entity.backend.tables.Branch.BRANCH;
import static vn.entity.backend.tables.Role.ROLE;
import static vn.entity.backend.tables.User.USER;


import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static java.util.Arrays.asList;

@Repository
public class UserRepository {
    @Autowired
    private DSLContext dslContext;

    private static List<Field<?>> getUserFields() {
        return asList(
                USER.ID,
                USER.NAME,
                USER.AVATAR,
                USER.PHONE,
                USER.PHONE_VERIFIED,
                USER.EMAIL,
                USER.FACEBOOK_ID,
                USER.GPLUS_ID,
                USER.REGIS_DATE,
                USER.FIRST_TIME,
                USER.ROLE_ID,
                USER.BRANCH_ID,
                USER.ACTIVE,
                USER.ALIAS,
                USER.CITY_NAME,
                USER.SUBDISTRICT_NAME,
                USER.GENDER
                );
    }

    /**
     * Lấy thông tin người dùng theo số điện thoại (Đăng nhập trực tiếp)
     *
     * @param phone
     * @return
     */
    public User getUserByPhone(String phone) {
        if (StringUtils.isBlank(phone)) {
            return new User();
        }

        List<Field<?>>  fields = new ArrayList<>(getUserFields());
        fields.add(USER.PASSWORD);
        fields.add(USER.PLAIN_PASSWORD);

        return  dslContext
                .select(fields)
                .from(USER)
                .where(USER.PHONE.eq(phone))
                .limit(1) //Sau trả về nhiều đê lựa chọn 1 tài khoản cụ thể
                .fetchOptionalInto(User.class)
                .orElse(new User());
    }

    public Integer deleteUser(Integer id) {
        return dslContext.deleteFrom(USER)
                .where(USER.ID.eq(id))
                .execute();
    }

    /**
     * Lấy thông tin người dùng theo số điện thoại (Đăng nhập trực tiếp)
     *
     * @param id
     * @return
     */
    public User getUserById(Integer id) {
        List<Field<?>> selectedFields = new ArrayList<>(getUserFields());
        selectedFields.add(
                        ROLE.NAME.as("role_name")
        );
        return  dslContext
                .select(getUserFields())
                .from(USER)
                .leftJoin(ROLE).on(ROLE.ID.eq(USER.ROLE_ID))
                .leftJoin(BRANCH).on(BRANCH.ID.eq(USER.BRANCH_ID))
                .where(USER.ID.eq(id))
                .fetchOptionalInto(User.class)
                .orElse(new User());
    }

    /**
     * Kiểm tra số điện thoại nhập vào đã được sử dụng bởi người dùng nào khác hay chưa
     *
     * @param userId
     * @param phone
     * @return
     */
    public Integer checkUserByPhone(Integer userId, String phone) {
        if (StringUtils.isBlank(phone)) {
            return 0;
        }

        return dslContext
                .selectCount()
                .from(USER)
                .where(
                        USER.PHONE.eq(phone)
                                .and(USER.ACTIVE.eq(UserConstant.USER_ACTIVE))
                                .and(CommonUtils.NVL(userId) > 0 ? USER.ID.notEqual(userId) : DSL.trueCondition())
                )
                .fetchOne(0, Integer.class);
    }

    /**
     * Lấy thông tin người dùng theo email (Đăng nhập trực tiếp)
     *
     * @param email
     * @return
     */
    public User getUserByEmail(String email) {
        if (StringUtils.isBlank(email)) {
            new User();
        }
        List<Field<?>>  fields = new ArrayList<>(getUserFields());

        return dslContext
                .select(fields)
                .from(USER)
                .where(USER.EMAIL.eq(email))
                .limit(1) //Sau trả về nhiều để lựa chọn lấy 1
                .fetchOptionalInto(User.class)
                .orElse(new User());
    }

    public User insertUser(User user) {
        List<Field<?>> selectedFields = new ArrayList<>(getUserFields());
        selectedFields.add(
                USER.PASSWORD
        );
        Timestamp ts = new Timestamp(new Date().getTime());
        dslContext.insertInto(USER, selectedFields)
                .values(
                        null,
                        DSL.value(user.getName()),
                        DSL.value(user.getAvatar()),
                        DSL.value(user.getPhone()),
                        DSL.value(user.getPhoneVerified()),
                        DSL.value(user.getEmail()),
                        DSL.value(user.getFacebookId()),
                        DSL.value(user.getGplusId()),
                        ts,
                        DSL.value(user.getFirstTime()),
                        DSL.value(user.getRoleId()),
                        DSL.value(user.getBranchId()),
                        1,
                        DSL.value(user.getAlias()),
                        DSL.value(user.getCityName()),
                        DSL.value(user.getSubdistrictName()),
                        DSL.value(user.getGender()),
                        DSL.value(user.getPassword())
                )
                .execute();
        user.setId(dslContext.lastID().intValue());
        return user;
    }

    public User register(User user) {
        List<Field<?>>  fields = new ArrayList<>(asList(USER.ID, USER.NAME, USER.PASSWORD, USER.PHONE, USER.EMAIL, USER.ACTIVE, USER.ROLE_ID));
        Timestamp ts = new Timestamp(new Date().getTime());
        dslContext.insertInto(USER, fields)
                .values(
                        null,
                        DSL.value(user.getName()),
                        DSL.value(user.getPassword()),
                        DSL.value(user.getPhone()),
                        DSL.value(user.getEmail()),
                        1,
                        DSL.value(user.getRoleId())
                )
                .execute();
        user.setId(dslContext.lastID().intValue());
        return user;
    }

    /**
     * Cập nhật thông tin người dùng (Admin thực hiện)
     *
     * @param user
     * @return
     */
    public User updateUser(User user) {
        LocalDateTime ts = LocalDateTime.now();

        dslContext.update(USER)
                .set(USER.NAME, user.getName())
                .set(USER.AVATAR, user.getAvatar())
                .set(USER.PHONE, user.getPhone())
                .set(USER.PHONE_VERIFIED, user.getPhoneVerified())
                .set(USER.EMAIL, user.getEmail())
                .set(USER.FACEBOOK_ID, user.getFacebookId())
                .set(USER.GPLUS_ID, user.getGplusId())
                .set(USER.FIRST_TIME, user.getFirstTime())
                .set(USER.ROLE_ID, user.getRoleId())
                .set(USER.BRANCH_ID, user.getBranchId())
                .set(USER.PASSWORD, user.getPassword())
                .set(USER.UPDATED_AT, ts)
                .where(USER.ID.eq(user.getId()))
                .execute();
        return user;
    }

    public User updatePass(User user) {
        dslContext.update(USER)
                .set(USER.PASSWORD, user.getPassword())
                .where(USER.ID.eq(user.getId()))
                .execute();
        return user;
    }

    /**
     * Cập nhật thông tin người dùng (Người dùng tự thực hiện)
     *
     * @param user
     * @return
     */
    public User updateInfo(User user) {
        LocalDateTime ts = LocalDateTime.now();

        dslContext.update(USER)
                .set(USER.NAME, user.getName())
                .set(USER.AVATAR, user.getAvatar())
                .set(USER.PHONE, user.getPhone())
                .set(USER.EMAIL, user.getEmail())
                .set(USER.GENDER, user.getGender())
                .set(USER.ALIAS, user.getAlias())
                .set(USER.SUBDISTRICT_NAME, user.getSubdistrictName())
                .set(USER.CITY_NAME, user.getCityName())
                .set(USER.UPDATED_AT, ts)
                .where(USER.ID.eq(user.getId()))
                .execute();
        return user;
    }

    private Condition getWhereCondition(List<Integer> lstUserId, String query) {
        Condition condition = DSL.trueCondition();

        if (lstUserId != null && !lstUserId.isEmpty()) {
            condition = condition.and(USER.ID.in(lstUserId));
        }

        if (isNotEmpty(query)) {
            query = query.trim().toLowerCase();
            condition = condition.and(
                    DSL.lower(USER.NAME) .like(DSL.val("%" + query.trim().toLowerCase() + "%"))
                            .or(USER.PHONE.likeRegex(query))
                            .or(DSL.lower(USER.EMAIL) .like(DSL.val("%" + query.trim().toLowerCase() + "%")))
            );
        }

        return condition;
    }

    /**
     * Lấy thông tin người dùng dựa vào ID (mặc định sẽ không được phép lấy thông tin nhạy cảm)
     *
     * @param id
     * @return
     */
    public User getUserByUserId(Integer id, Boolean hasSensitiveInfo) {
        List<Field<?>> lstFields = new ArrayList<>(asList(USER.ID, USER.NAME, USER.AVATAR,
                USER.EMAIL, USER.FIRST_TIME, USER.ROLE_ID, USER.GENDER, USER.PHONE));
        if (hasSensitiveInfo) {
            lstFields.addAll(asList(USER.PHONE_VERIFIED, USER.PASSWORD, USER.FACEBOOK_ID,
                    USER.GPLUS_ID, USER.REGIS_DATE));
        }

        return dslContext
                .select(lstFields)
                .from(USER)
                .where(USER.ID.eq(id).and(USER.ACTIVE.eq(1))) //Chỉ lấy với tài khoản còn hoạt động
                .fetchOptionalInto(User.class)
                .orElse(null);
    }

    /**
     * Tìm kiếm người dùng trong select box
     *
     * @return
     */
    public List<User> getUserByCriteria(List<Integer> lstUserId, String query,
                                        Pageable pageable) {
        Condition condition = this.getWhereCondition(lstUserId, query);

        List<Field<?>> lstFields = new ArrayList<>(getUserFields());

        lstFields.addAll(
                asList(
                        ROLE.NAME.as("role_name"),
                        BRANCH.NAME.as("branch_name"))
        );

        SelectConditionStep<Record> select = dslContext
                .select(lstFields)
                .from(USER)
                .leftJoin(ROLE).on(ROLE.ID.eq(USER.ROLE_ID))
                .leftJoin(BRANCH).on(BRANCH.ID.eq(USER.BRANCH_ID))
                .where(condition);

        //Ngày đăng ký
        select.orderBy(USER.UPDATED_AT.desc()).offset(pageable.getOffset()).limit(pageable.getLimit());
        return select.fetchInto(User.class);
    }

    public Long countUserByCriteria(List<Integer> lstUserId, String query) {
        Condition condition = this.getWhereCondition(lstUserId, query);
        return dslContext
                .selectCount()
                .from(USER)
                .where(condition)
                .fetchOne(0, Long.class);
    }

    public Integer updateUserStatus(Integer id, Integer active) {
        if (CommonUtils.NVL(id) <= 0) return 0;
        return dslContext.update(USER)
                .set(USER.ACTIVE, CommonUtils.NVL(active))
                .where(USER.ID.eq(id))
                .execute();
    }
}
