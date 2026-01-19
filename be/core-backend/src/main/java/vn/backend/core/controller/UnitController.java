package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.UnitService;
import vn.backend.core.util.CommonUtils;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.Unit;

import java.security.Principal;

@RestController
public class UnitController extends BaseController {

    private static final String URI = "/unit/";

    @Autowired
    private UnitService service;

    @GetMapping("/unit/list")
    public ResponseEntity<ApiResponse<Page<Unit>>> listUnits(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            Pageable pageable,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        var result = service.getListUnitByCriteria(keyword, status, pageable);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/unit/get")
    public ResponseEntity<ApiResponse<Unit>> getUnit(
            @RequestParam Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        var result = service.getUnitById(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/unit/update")
    public ResponseEntity<ApiResponse<Unit>> upsertUnit(
            @RequestBody Unit unit,
            Principal principal
    ) {
        String action = (CommonUtils.NVL(unit.getId()) <= 0) ? "ADD" : "UPDATE";
        checkPermission(principal, URI, action);

        var result = service.upsertUnit(unit);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @DeleteMapping("/unit/delete/{id}")
    public ResponseEntity<ApiResponse<Integer>> deleteUnit(
            @PathVariable Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "DELETE");
        var result = service.deleteUnit(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/unit/update-status")
    public ResponseEntity<ApiResponse<Integer>> updateStatus(
            @RequestParam Integer id,
            @RequestParam Integer status,
            Principal principal
    ) {
        checkPermission(principal, URI, "UPDATE");
        var result = service.updateUnitStatus(id, status);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
