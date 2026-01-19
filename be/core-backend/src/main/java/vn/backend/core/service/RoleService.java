package vn.backend.core.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.RoleRepository;
import vn.backend.entity.data.mysql.Role;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j(topic = "ROLE-SERVICE")
@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    public Page<Role> getListRoleByCriteria(Integer id, String name, Integer isDefault,
                                            Integer isOperator, Pageable pageable) {
        CompletableFuture<List<Role>> futureLst = CompletableFuture.supplyAsync(
                () -> roleRepository.getRoleByCriteria(id, name, isDefault, isOperator, pageable)
        );
        CompletableFuture<Long> futureCount = CompletableFuture.supplyAsync(
                () -> roleRepository.countRoleByCriteria(id, name, isDefault, isOperator)
        );

        List<Role> lst = futureLst.join();
        Long count = futureCount.join();

        pageable.setTotal(count);
        return new Page<>(pageable, lst);
    }

    public Role insertRole(Role role) {
        return roleRepository.insertRole(role);
    }

    public Role updateRole(Role role) {
        return roleRepository.updateRole(role);
    }

    public Integer deleteRole(Integer id) {
        return roleRepository.deleteRole(id);
    }

    public Role getDefaultRole() {
        return roleRepository.getDefaultRole();
    }
}
