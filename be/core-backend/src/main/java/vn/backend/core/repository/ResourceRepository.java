package vn.backend.core.repository;

import org.apache.commons.lang3.StringUtils;
import org.jooq.*;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.exception.AppException;
import vn.backend.core.util.CommonUtils;
import vn.backend.entity.data.mysql.Resource;

import java.util.ArrayList;
import java.util.List;

import static java.util.Arrays.asList;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static vn.entity.backend.tables.Resource.RESOURCE;

@Repository
public class ResourceRepository {

    @Autowired
    private DSLContext dslContext;

    public static List<Field<?>> getResourceFields() {
        List<Field<?>> selectedFields = new ArrayList<>(getResourceFieldsWithoutId());
        selectedFields.add(RESOURCE.ID);
        return selectedFields;
    }

    public static List<Field<?>> getResourceFieldsWithoutId() {
        return asList(
                RESOURCE.ID,
                RESOURCE.NAME,
                RESOURCE.DESCRIPTION,
                RESOURCE.CODE,
                RESOURCE.URI,
                RESOURCE.ACTIONS
        );
    }

    private Condition getWhereCondition(String name, Integer active) {
        Condition condition = DSL.trueCondition();
        if (!StringUtils.isBlank(name)) {
            condition = condition.and(DSL.lower(RESOURCE.NAME)
                    .like(DSL.val("%" + name.trim().toLowerCase() + "%")));
        }

        if (CommonUtils.NVL(active) > 0) {
            condition = condition.and(RESOURCE.ACTIVE.eq(active));
        }

        return condition;
    }

    /**
     * Lấy theo điều kiện
     */
    public List<Resource> getResourceByCriteria(String name,
                                                Integer active, Pageable pageable) {
        SelectConditionStep<Record> select = dslContext
                .select(getResourceFields())
                .from(RESOURCE)
                .where(getWhereCondition(name, active));

        select.orderBy(RESOURCE.ID.desc()).offset(pageable.getOffset()).limit(pageable.getLimit());
        return select.fetchInto(Resource.class);
    }

    /**
     * Đếm số resource theo điều kiện
     */
    public long countResourceByCriteria(String name, Integer active) {
        return dslContext
                .selectCount()
                .from(RESOURCE)
                .where(getWhereCondition(name, active))
                .fetchOne(0, Long.class);
    }

    public Integer updateResourceStatus(Integer id, Integer active) {
        if (CommonUtils.NVL(id) <= 0) return 0;

        return dslContext.update(RESOURCE)
                .set(RESOURCE.ACTIVE, CommonUtils.NVL(active))
                .where(RESOURCE.ID.eq(id))
                .execute();
    }

    /**
     * Lấy ra toàn bộ để tính toán phân quyền
     */
    public List<Resource> getAllResources(String name) {
        SelectOffsetStep<Record> select = dslContext
                .select(getResourceFields())
                .from(RESOURCE)
                .where(
                        (StringUtils.isBlank(name) ? DSL.trueCondition() : DSL.lower(RESOURCE.NAME)
                                .like(DSL.val("%" + name.trim().toLowerCase() + "%")))
                )
                .limit(1000);

        return select.fetchInto(Resource.class);
    }

    public Resource getResourceById(Integer resourceId) {
        return dslContext
                .select()
                .from(RESOURCE)
                .where(RESOURCE.ID.eq(resourceId))
                .fetchOptionalInto(Resource.class)
                .orElseThrow(() -> new AppException("Resource not found", BAD_REQUEST.value()));
    }

    public Resource insertResource(Resource resource) {
        dslContext
                .insertInto(RESOURCE, getResourceFieldsWithoutId())
                .values(
                        null,
                        DSL.value(resource.getName()),
                        DSL.value(resource.getDescription()),
                        DSL.value(resource.getCode()),
                        DSL.value(resource.getUri()),
                        DSL.value(CommonUtils.getJSON(resource.getActions()))
                )
                .execute();
        resource.setId(dslContext.lastID().intValue());
        return resource;
    }

    public Resource updateResource(Resource resource) {
        dslContext.update(RESOURCE)
                .set(RESOURCE.NAME, resource.getName())
                .set(RESOURCE.DESCRIPTION, resource.getDescription())
                .set(RESOURCE.CODE, resource.getCode())
                .set(RESOURCE.URI, resource.getUri())
                .set(RESOURCE.ACTIONS, CommonUtils.getJSON(resource.getActions()))
                .set(RESOURCE.ACTIONS, CommonUtils.getJSON(resource.getActions()))
                .where(RESOURCE.ID.eq(resource.getId()))
                .execute();
        return resource;
    }

    public Integer deleteResource(Integer id) {
        return dslContext
                .delete(RESOURCE)
                .where(RESOURCE.ID.eq(id))
                .execute();
    }
}
