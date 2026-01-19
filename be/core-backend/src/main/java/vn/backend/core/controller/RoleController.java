package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.RoleService;
import vn.backend.core.util.CommonUtils;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.Role;

import java.security.Principal;

@RestController
public class RoleController extends BaseController {
    private static final String URI = "/role/";

    @Autowired
    private RoleService roleService;

    @GetMapping("/role/list")
    public ResponseEntity<ApiResponse<Page<Role>>> getAllRoles(
            @RequestParam(required = false) Integer id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer isDefault,
            @RequestParam(required = false) Integer isOperator,
            Pageable pageable,
            Principal principal) {

        checkPermission(principal, URI, "VIEW");
        var result = roleService.getListRoleByCriteria(id, name, isDefault, isOperator, pageable);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/role/update")
    public ResponseEntity<ApiResponse<Role>> upsertRole(@RequestBody Role role, Principal principal) {
        String action = (CommonUtils.NVL(role.getId()) <= 0) ? "ADD" : "UPDATE";
        checkPermission(principal, URI, action);

        Role result;
        if (CommonUtils.NVL(role.getId()) <= 0) {
            result = roleService.insertRole(role);
        } else {
            result = roleService.updateRole(role);
        }

        return Mapper.map(result, ApiResponse::okEntity);
    }

    @DeleteMapping("/role/delete/{id}")
    public ResponseEntity<ApiResponse<Integer>> deleteRole(@PathVariable Integer id, Principal principal) {
        checkPermission(principal, URI, "DELETE");
        var result = roleService.deleteRole(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
