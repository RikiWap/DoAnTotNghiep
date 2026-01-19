package vn.backend.core.repository;

import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record;
import org.jooq.SelectConditionStep;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.util.CommonUtils;
import vn.backend.entity.data.mysql.Role;

import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.Role.ROLE;
import static vn.entity.backend.tables.User.USER;

@Repository
public class RoleRepository {
    @Autowired
    private DSLContext dslContext;

    private static List<Field<?>> getRoleFields() {
        return asList(
                ROLE.ID,
                ROLE.NAME,
                ROLE.IS_DEFAULT,
                ROLE.IS_OPERATOR
        );
    }

    /**
     * Xây dựng điều kiện where động theo các tham số lọc
     */
    private Condition getWhereCondition(Integer id, String name, Integer isDefault, Integer isOperator) {
        Condition condition = DSL.trueCondition();

        if (CommonUtils.NVL(id) > 0) {
            condition = condition.and(ROLE.ID.eq(id));
        }
        if (!CommonUtils.NVL(name).isEmpty()) {
            condition = condition.and(ROLE.NAME.likeIgnoreCase("%" + name.trim() + "%"));
        }
        if (CommonUtils.NVL(isDefault) > 0) {
            condition = condition.and(ROLE.IS_DEFAULT.eq(isDefault));
        }
        if (CommonUtils.NVL(isOperator) > 0) {
            condition = condition.and(ROLE.IS_OPERATOR.eq(isOperator));
        }
        return condition;
    }

    /**
     * Lấy danh sách role theo tiêu chí tìm kiếm
     */
    public List<Role> getRoleByCriteria(Integer id, String name, Integer isDefault, Integer isOperator, Pageable pageable) {
        Condition condition = getWhereCondition(id, name, isDefault, isOperator);

        SelectConditionStep<Record> select = dslContext
                .select(getRoleFields())
                .from(ROLE)
                .where(condition);

        select.orderBy(ROLE.ID.desc()).offset(pageable.getOffset()).limit(pageable.getLimit());
        return select.fetchInto(Role.class);
    }

    /**
     * Đếm số lượng role theo tiêu chí tìm kiếm
     */
    public Long countRoleByCriteria(Integer id, String name, Integer isDefault, Integer isOperator) {
        Condition condition = getWhereCondition(id, name, isDefault, isOperator);
        return dslContext
                .selectCount()
                .from(ROLE)
                .where(condition)
                .fetchOne(0, Long.class);
    }

    /**
     * Chèn role mới (đảm bảo chỉ có 1 is_default = 1)
     */
    public Role insertRole(Role role) {
        if (role.getIsDefault() != null && role.getIsDefault() == 1) {
            resetDefaultRole();
        }

        dslContext.insertInto(ROLE, getRoleFields())
                .values(
                        null,
                        DSL.value(role.getName()),
                        DSL.value(role.getIsDefault()),
                        DSL.value(role.getIsOperator())
                )
                .execute();
        role.setId(dslContext.lastID().intValue());
        return role;
    }

    /**
     * Cập nhật role (đảm bảo chỉ 1 default)
     */
    public Role updateRole(Role role) {
        if (role.getIsDefault() != null && role.getIsDefault() == 1) {
            resetDefaultRole();
        }

        dslContext.update(ROLE)
                .set(ROLE.NAME, role.getName())
                .set(ROLE.IS_DEFAULT, role.getIsDefault())
                .set(ROLE.IS_OPERATOR, role.getIsOperator())
                .where(ROLE.ID.eq(role.getId()))
                .execute();
        return role;
    }

    /**
     * Reset is_default = 0 cho toàn bộ role
     */
    private void resetDefaultRole() {
        dslContext.update(ROLE)
                .set(ROLE.IS_DEFAULT, 0)
                .execute();
    }

    public Role getDefaultRole() {
        return dslContext.select(getRoleFields())
                .from(ROLE)
                .where(ROLE.IS_DEFAULT.eq(1))
                .fetchOneInto(Role.class);
    }

    public Role getRoleById(Integer id) {
        return dslContext.select(getRoleFields())
                .from(ROLE)
                .where(ROLE.ID.eq(id))
                .fetchOptionalInto(Role.class)
                .orElse(new Role());
    }

    /**
     * Xóa role
     */
    public Integer deleteRole(Integer id) {
        return dslContext.deleteFrom(ROLE)
                .where(ROLE.ID.eq(id))
                .execute();
    }
}
