package vn.backend.core.util;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import vn.backend.core.config.security.SimpleSecurityUser;
import vn.backend.core.config.security.principal.impl.SimplePrincipal;
import vn.backend.core.service.JWTService;
import vn.backend.entity.data.mysql.User;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class SecurityUtils {

    /**
     * Lấy về userId từ thông tin được lưu trong principal
     *
     * @param principal
     * @return
     */
    public static Integer userId(Principal principal) {
        if (principal == null) {
            return 0;
        }

        Integer userId = (Integer) ((SimplePrincipal) principal).getId();
        return userId == null ? 0 : userId;
    }

    public static String getJwt(Principal principal) {
        if (principal != null) {
            String bearer = ((SimplePrincipal) principal).getClientInfo().get("Authorization");
            if (StringUtils.isBlank(bearer)) {
                return "";
            }

            String jwt = "";
            if (bearer != null && bearer.startsWith("Bearer ")) jwt = bearer.substring("Bearer ".length());
            return jwt;
        }

        return "";
    }

    /**
     * Map qua SimpleSecurityUser để xác thực
     *
     * @param user
     * @return
     */
    public static SimpleSecurityUser toSimpleSecurityUser(User user) {
        String userName = user.getPhone();
        if (StringUtils.isBlank(userName)) {
            userName = CommonUtils.NVL(user.getEmail());
        }

        SimpleSecurityUser simpleSecurityUser = new SimpleSecurityUser();
        simpleSecurityUser.setId(user.getId());
        simpleSecurityUser.setUsername(userName);
        simpleSecurityUser.setName(user.getName());
        simpleSecurityUser.setRoleId(user.getRoleId());

        List<Integer> lstRole = new ArrayList<>();
        if (CommonUtils.NVL(user.getRoleId()) > 0) {
            lstRole.add(user.getRoleId());
        }
        simpleSecurityUser.setRoles(lstRole);

        return simpleSecurityUser;
    }
}
