package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.CategoryItemService;
import vn.backend.core.util.CommonUtils;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.CategoryItem;

import java.security.Principal;
import java.util.List;

@RestController
public class CategoryItemController extends BaseController {

    private static final String URI = "/categoryItem/";

    @Autowired
    private CategoryItemService service;
/**
 * Level: 0 - lấy cha, 1 - lấy con, 2 - lấy tất cả
 *
 */
    @GetMapping("/categoryItem/list")
    public ResponseEntity<ApiResponse<Page<CategoryItem>>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "2") Integer level,
            @RequestParam(required = false, defaultValue = "-1") Integer active,
            @RequestParam(required = false, defaultValue = "1") Integer type,
            Pageable pageable,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        var result = service.getListCategoryItem(keyword, type, active, level, pageable);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/categoryItem/child")
    public ResponseEntity<ApiResponse<List<CategoryItem>>> child(
            @RequestParam Integer parentId,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        var result = service.getChild(parentId);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/categoryItem/get")
    public ResponseEntity<ApiResponse<CategoryItem>> get(
            @RequestParam Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        var result = service.getById(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/categoryItem/update")
    public ResponseEntity<ApiResponse<CategoryItem>> update(
            @RequestBody CategoryItem item,
            Principal principal
    ) {
        String action = (CommonUtils.NVL(item.getId()) <= 0) ? "ADD" : "UPDATE";
        checkPermission(principal, URI, action);

        var result = service.upsert(item);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @DeleteMapping("/categoryItem/delete/{id}")
    public ResponseEntity<ApiResponse<Integer>> delete(
            @PathVariable Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "DELETE");
        var result = service.delete(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/categoryItem/update-status")
    public ResponseEntity<ApiResponse<Integer>> updateStatus(
            @RequestParam Integer id,
            @RequestParam Integer active,
            Principal principal
    ) {
        checkPermission(principal, URI, "UPDATE");
        var result = service.updateStatus(id, active);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
