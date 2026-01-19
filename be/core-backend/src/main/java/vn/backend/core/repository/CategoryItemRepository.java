package vn.backend.core.repository;

import org.apache.commons.lang3.StringUtils;
import org.jooq.*;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.util.CommonUtils;
import vn.backend.entity.data.mysql.CategoryItem;

import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.CategoryItem.CATEGORY_ITEM;

@Repository
public class CategoryItemRepository {

    @Autowired
    private DSLContext dsl;

    private static List<Field<?>> fields() {
        return asList(
                CATEGORY_ITEM.ID,
                CATEGORY_ITEM.AVATAR,
                CATEGORY_ITEM.NAME,
                CATEGORY_ITEM.TYPE,
                CATEGORY_ITEM.PARENT_ID,
                CATEGORY_ITEM.FEATURED,
                CATEGORY_ITEM.POSITION,
                CATEGORY_ITEM.ACTIVE
        );
    }

    private Condition whereCondition(String keyword, Integer type, Integer active, Integer level) {

        Condition condition = DSL.trueCondition();

        if (CommonUtils.NVL(type) > 0) {
            condition = condition.and(CATEGORY_ITEM.TYPE.eq(type));
        }

        if (CommonUtils.NVL(active) >= 0) {
            condition = condition.and(CATEGORY_ITEM.ACTIVE.eq(active));
        }

        // level: 0 = cha, 1 = con, 2 = tất cả
        if (CommonUtils.NVL(level) == 0) {
            condition = condition.and(CATEGORY_ITEM.PARENT_ID.eq(0));
        } else if (CommonUtils.NVL(level) == 1) {
            condition = condition.and(CATEGORY_ITEM.PARENT_ID.gt(0));
        }

        if (StringUtils.isNotBlank(keyword)) {
            condition = condition.and(DSL.lower(CATEGORY_ITEM.NAME)
                    .like("%" + keyword.trim().toLowerCase() + "%"));
        }

        return condition;
    }

    public List<CategoryItem> getList(String keyword, Integer type, Integer active,
                                      Integer level, Pageable pageable) {

        Condition condition = whereCondition(keyword, type, active, level);

        return dsl.select(fields())
                .from(CATEGORY_ITEM)
                .where(condition)
                .orderBy(CATEGORY_ITEM.POSITION.asc(), CATEGORY_ITEM.ID.asc())
                .limit(pageable.getLimit())
                .offset(pageable.getOffset())
                .fetchInto(CategoryItem.class);
    }

    public Long countList(String keyword, Integer type, Integer active, Integer level) {
        Condition condition = whereCondition(keyword, type, active, level);

        return dsl.selectCount()
                .from(CATEGORY_ITEM)
                .where(condition)
                .fetchOne(0, Long.class);
    }

    public List<CategoryItem> getChild(Integer parentId) {
        return dsl.select(fields())
                .from(CATEGORY_ITEM)
                .where(CATEGORY_ITEM.PARENT_ID.eq(parentId))
                .orderBy(CATEGORY_ITEM.POSITION.asc(), CATEGORY_ITEM.ID.asc())
                .fetchInto(CategoryItem.class);
    }

    public CategoryItem getById(Integer id) {
        return dsl.select(fields())
                .from(CATEGORY_ITEM)
                .where(CATEGORY_ITEM.ID.eq(id))
                .fetchOptionalInto(CategoryItem.class)
                .orElse(null);
    }

    public CategoryItem insert(CategoryItem item) {
        dsl.insertInto(CATEGORY_ITEM,
                        CATEGORY_ITEM.AVATAR,
                        CATEGORY_ITEM.NAME,
                        CATEGORY_ITEM.TYPE,
                        CATEGORY_ITEM.PARENT_ID,
                        CATEGORY_ITEM.FEATURED,
                        CATEGORY_ITEM.POSITION,
                        CATEGORY_ITEM.ACTIVE)
                .values(
                        item.getAvatar(),
                        item.getName(),
                        item.getType(),
                        CommonUtils.NVL(item.getParentId()),
                        item.getFeatured(),
                        CommonUtils.NVL(item.getPosition()),
                        CommonUtils.NVL(item.getActive(), 1)
                )
                .execute();

        item.setId(dsl.lastID().intValue());
        return item;
    }

    public CategoryItem update(CategoryItem item) {
        dsl.update(CATEGORY_ITEM)
                .set(CATEGORY_ITEM.AVATAR, item.getAvatar())
                .set(CATEGORY_ITEM.NAME, item.getName())
                .set(CATEGORY_ITEM.TYPE, item.getType())
                .set(CATEGORY_ITEM.PARENT_ID, CommonUtils.NVL(item.getParentId()))
                .set(CATEGORY_ITEM.FEATURED, item.getFeatured())
                .set(CATEGORY_ITEM.POSITION, CommonUtils.NVL(item.getPosition()))
                .set(CATEGORY_ITEM.ACTIVE, CommonUtils.NVL(item.getActive(), 1))
                .where(CATEGORY_ITEM.ID.eq(item.getId()))
                .execute();
        return item;
    }

    public Integer delete(Integer id) {
        return dsl.delete(CATEGORY_ITEM)
                .where(CATEGORY_ITEM.ID.eq(id))
                .execute();
    }

    public Integer updateStatus(Integer id, Integer active) {
        return dsl.update(CATEGORY_ITEM)
                .set(CATEGORY_ITEM.ACTIVE, active)
                .where(CATEGORY_ITEM.ID.eq(id))
                .execute();
    }
}
