package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.exception.AppException;
import vn.backend.core.service.UserService;
import vn.backend.entity.data.mysql.User;

import java.security.Principal;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static vn.backend.core.util.SecurityUtils.userId;

@Service
public class BaseController {
    @Autowired
    private UserService userService;

    /**
     * Kiểm tra quyền
     *
     * @param principal
     * @param URI
     * @param action
     * @return
     */
    public User checkPermission(Principal principal, String URI, String action) {
        Integer loginId = userId(principal);
        User user = userService.checkPermission(loginId, URI, action);
        checkUserPermission(URI, action, user);
        return user;
    }

    private static User checkUserPermission(String URI, String action, User user) {
        if (user.getId() == null) {
            throw new AppException(
                    String.format("Bạn không có quyền thực hiện thao tác này! Path: %s, Action: %s", URI, action),
                    BAD_REQUEST.value());
        }
        return user;
    }

    private String getMessageError(Map<String, String> mapParam, String message) {
        for (Map.Entry<String, String> entry : mapParam.entrySet()) {
            message = message.replaceAll(String.format(":%s:", entry.getKey()), entry.getValue());
        }

        return message;
    }
}
