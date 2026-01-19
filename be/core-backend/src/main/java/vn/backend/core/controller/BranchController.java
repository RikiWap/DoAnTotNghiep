package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.BranchService;
import vn.backend.core.util.CommonUtils;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.Branch;

import java.security.Principal;

@RestController
public class BranchController extends BaseController {
    private static final String URI = "/branch/";

    @Autowired
    private BranchService branchService;

    @GetMapping("/branch/list")
    public ResponseEntity<ApiResponse<Page<Branch>>> getAllBranches(
            @RequestParam(required = false) Integer id,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            Pageable pageable,
            Principal principal) {

        checkPermission(principal, URI, "VIEW");
        var result = branchService.getListBranchByCriteria(id, keyword, status, pageable);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/branch/update")
    public ResponseEntity<ApiResponse<Branch>> upsertBranch(
            @RequestBody Branch branch,
            Principal principal) {
        String action = (CommonUtils.NVL(branch.getId()) <= 0) ? "ADD" : "UPDATE";
        checkPermission(principal, URI, action);

        Branch result = (CommonUtils.NVL(branch.getId()) <= 0)
                ? branchService.insertBranch(branch)
                : branchService.updateBranch(branch);

        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/branch/update-status")
    public ResponseEntity<ApiResponse<Integer>> updateBranchStatus(
            @RequestParam Integer id,
            @RequestParam Integer status,
            Principal principal) {

        // Kiểm tra quyền cập nhật trạng thái
        checkPermission(principal, "/branch/", "UPDATE");

        var result = branchService.updateBranchStatus(id, status);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @DeleteMapping("/branch/delete/{id}")
    public ResponseEntity<ApiResponse<Integer>> deleteBranch(@PathVariable Integer id, Principal principal) {
        checkPermission(principal, URI, "DELETE");
        var result = branchService.deleteBranch(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
