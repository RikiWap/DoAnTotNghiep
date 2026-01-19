package vn.backend.core.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.BranchRepository;
import vn.backend.entity.data.mysql.Branch;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j(topic = "BRANCH-SERVICE")
@Service
public class BranchService {

    @Autowired
    private BranchRepository branchRepository;

    public Page<Branch> getListBranchByCriteria(Integer id, String name, Integer status, Pageable pageable) {
        CompletableFuture<List<Branch>> futureList = CompletableFuture.supplyAsync(
                () -> branchRepository.getBranchByCriteria(id, name, status, pageable)
        );
        CompletableFuture<Long> futureCount = CompletableFuture.supplyAsync(
                () -> branchRepository.countBranchByCriteria(id, name, status)
        );

        List<Branch> list = futureList.join();
        Long count = futureCount.join();

        pageable.setTotal(count);
        return new Page<>(pageable, list);
    }

    public Branch insertBranch(Branch branch) {
        return branchRepository.insertBranch(branch);
    }

    public Branch updateBranch(Branch branch) {
        return branchRepository.updateBranch(branch);
    }

    public Integer deleteBranch(Integer id) {
        return branchRepository.deleteBranch(id);
    }

    public Integer updateBranchStatus(Integer id, Integer status) {
        return branchRepository.updateBranchStatus(id, status);
    }
}
