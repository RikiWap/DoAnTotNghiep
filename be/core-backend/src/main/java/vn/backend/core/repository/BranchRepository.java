package vn.backend.core.repository;

import org.jooq.*;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.util.CommonUtils;
import vn.backend.entity.data.mysql.Branch;

import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.Branch.BRANCH;

@Repository
public class BranchRepository {

    @Autowired
    private DSLContext dslContext;

    private static List<Field<?>> getBranchFields() {
        return asList(
                BRANCH.ID,
                BRANCH.PARENT_ID,
                BRANCH.AVATAR,
                BRANCH.NAME,
                BRANCH.ADDRESS,
                BRANCH.WEBSITE,
                BRANCH.DESCRIPTION,
                BRANCH.FOUNDING_YEAR,
                BRANCH.FOUNDING_MONTH,
                BRANCH.FOUNDING_DAY,
                BRANCH.PHONE,
                BRANCH.EMAIL,
                BRANCH.OWNER_ID,
                BRANCH.CREATED_TIME,
                BRANCH.STATUS
        );
    }

    private Condition getWhereCondition(Integer id, String name, Integer status) {
        Condition condition = DSL.trueCondition();

        if (CommonUtils.NVL(id) > 0) {
            condition = condition.and(BRANCH.ID.eq(id));
        }

        if (!CommonUtils.NVL(name).isEmpty()) {
            condition = condition.and(BRANCH.NAME.likeIgnoreCase("%" + name.trim() + "%"));
        }

        if (CommonUtils.NVL(status) > 0) {
            condition = condition.and(BRANCH.STATUS.eq(status));
        }

        return condition;
    }

    public List<Branch> getBranchByCriteria(Integer id, String name, Integer status, Pageable pageable) {
        Condition condition = getWhereCondition(id, name, status);

        SelectConditionStep<?> select = dslContext
                .select(getBranchFields())
                .from(BRANCH)
                .where(condition);

        select.orderBy(BRANCH.CREATED_TIME.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getLimit());

        return select.fetchInto(Branch.class);
    }

    public Long countBranchByCriteria(Integer id, String name, Integer status) {
        Condition condition = getWhereCondition(id, name, status);
        return dslContext.selectCount()
                .from(BRANCH)
                .where(condition)
                .fetchOne(0, Long.class);
    }

    public Branch insertBranch(Branch branch) {
        dslContext.insertInto(BRANCH, getBranchFields())
                .values(
                        null,
                        DSL.value(branch.getParentId()),
                        DSL.value(branch.getAvatar()),
                        DSL.value(branch.getName()),
                        DSL.value(branch.getAddress()),
                        DSL.value(branch.getWebsite()),
                        DSL.value(branch.getDescription()),
                        DSL.value(branch.getFoundingYear()),
                        DSL.value(branch.getFoundingMonth()),
                        DSL.value(branch.getFoundingDay()),
                        DSL.value(branch.getPhone()),
                        DSL.value(branch.getEmail()),
                        DSL.value(branch.getOwnerId()),
                        DSL.currentTimestamp(),
                        DSL.value(branch.getStatus())
                )
                .execute();
        branch.setId(dslContext.lastID().intValue());
        return branch;
    }

    public Branch updateBranch(Branch branch) {
        dslContext.update(BRANCH)
                .set(BRANCH.PARENT_ID, branch.getParentId())
                .set(BRANCH.AVATAR, branch.getAvatar())
                .set(BRANCH.NAME, branch.getName())
                .set(BRANCH.ADDRESS, branch.getAddress())
                .set(BRANCH.WEBSITE, branch.getWebsite())
                .set(BRANCH.DESCRIPTION, branch.getDescription())
                .set(BRANCH.FOUNDING_YEAR, branch.getFoundingYear())
                .set(BRANCH.FOUNDING_MONTH, branch.getFoundingMonth())
                .set(BRANCH.FOUNDING_DAY, branch.getFoundingDay())
                .set(BRANCH.PHONE, branch.getPhone())
                .set(BRANCH.EMAIL, branch.getEmail())
                .set(BRANCH.OWNER_ID, branch.getOwnerId())
                .set(BRANCH.STATUS, branch.getStatus())
                .where(BRANCH.ID.eq(branch.getId()))
                .execute();
        return branch;
    }

    public Integer deleteBranch(Integer id) {
        return dslContext.deleteFrom(BRANCH)
                .where(BRANCH.ID.eq(id))
                .execute();
    }

    public Integer updateBranchStatus(Integer id, Integer status) {
        if (CommonUtils.NVL(id) <= 0) {
            return 0;
        }

        return dslContext.update(BRANCH)
                .set(BRANCH.STATUS, CommonUtils.NVL(status))
                .where(BRANCH.ID.eq(id))
                .execute();
    }
}
