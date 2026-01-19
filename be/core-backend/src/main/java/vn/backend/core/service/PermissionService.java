package vn.backend.core.service;


import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.data.pojo.PermissionInfo;
import vn.backend.core.data.pojo.ResourceInfo;
import vn.backend.core.repository.PermissionRepository;
import vn.backend.core.repository.ResourceRepository;
import vn.backend.core.repository.RoleRepository;
import vn.backend.entity.data.mysql.Permission;
import vn.backend.entity.data.mysql.Resource;
import vn.backend.entity.data.mysql.Role;
import vn.backend.entity.data.pojo.EBPermissionResource;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

@Service
public class PermissionService {
    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private Gson gson;

    public List<Permission> getPermissionByCriteria(Integer objectId) {
        return permissionRepository.getPermissionByCriteria(objectId);
    }

    public Permission getPermissionById(Integer permissionId) {
        return permissionRepository.getPermissionById(permissionId);
    }

    public Permission insertPermission(Permission permission) {
        return permissionRepository.insertPermission(permission);
    }

    public List<Permission> insertBatchPermission(List<Permission> lstPermission) {
        return permissionRepository.insertBatchPermission(lstPermission);
    }

    public Permission updatePermission(Permission permission) {
        return permissionRepository.updatePermission(permission);
    }

    public Integer deletePermission(Integer id) {
        return permissionRepository.deletePermission(id);
    }

    public List<EBPermissionResource> getPermissionResources(Integer roleId) {
        Role role = roleRepository.getRoleById(roleId);
        return permissionRepository.getPermissionResources(roleId, role.getIsOperator());
    }


    public long checkPermission(Integer roleId, String uri, String action) {
        return permissionRepository.checkPermission(roleId, uri, action);
    }


    /**
     * Thêm hoặc cập nhật lại quyền
     */
    public Permission updatePermission(Permission permission, String action) {
        Permission permissionDb = permissionRepository.getPermissionActions(
                permission.getResourceId(), permission.getRoleId());

        if (permissionDb == null) {
            if ("ADD".equals(action)) {
                return permissionRepository.insertPermission(permission);
            }
            return permission;
        }

        Type listType = new TypeToken<ArrayList<String>>() {
        }.getType();

        String oldActions = permissionDb.getActions();
        List<String> lstOldAction = new ArrayList<>();

        if (!StringUtils.isBlank(oldActions)) {
            lstOldAction = gson.fromJson(oldActions, listType);
        }

        List<String> lstNewAction = gson.fromJson(permission.getActions(), listType);

        //Cập nhật
        Set<String> resultSet = new LinkedHashSet<>(lstOldAction);

        if ("ADD".equals(action)) {
            resultSet.addAll(lstNewAction);
        } else {
            resultSet.removeAll(lstNewAction);
        }
        List<String> finalResult = new ArrayList<>(resultSet);

        permissionDb.setActions(gson.toJson(finalResult));
        return permissionRepository.updatePermission(permissionDb);
    }

    public List<ResourceInfo> getResourceInfo(Integer roleId, String name) {
        // Lấy song song resource và permission
        CompletableFuture<List<Resource>> futureResources = CompletableFuture.supplyAsync(
                () -> resourceRepository.getAllResources(name)
        );

        CompletableFuture<List<Permission>> futurePermissions = CompletableFuture.supplyAsync(
                () -> permissionRepository.getPermissionByCriteria(roleId)
        );

        List<Resource> lstResource = futureResources.join();
        List<Permission> lstPermission = futurePermissions.join();

        List<ResourceInfo> result = new ArrayList<>();

        for (Resource resource : lstResource) {
            ResourceInfo info = new ResourceInfo(resource);

            // tìm permission tương ứng
            Permission matched = lstPermission.stream()
                    .filter(p -> p.getResourceId().equals(resource.getId()))
                    .findFirst()
                    .orElse(null);

            PermissionInfo permInfo = new PermissionInfo();
            permInfo.setRoleId(roleId);
            permInfo.setActions(matched != null && matched.getActions() != null
                    ? matched.getActions()
                    : "[]"); // mặc định rỗng

            info.setPermission(permInfo);
            result.add(info);
        }

        return result;
    }
}
