package vn.backend.core.controller;

import org.apache.commons.lang3.StringUtils;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.config.property.SystemProperties;
import vn.backend.core.constant.ErrorCode;
import vn.backend.core.data.response.AuthResponse;
import vn.backend.core.exception.AppException;
import vn.backend.core.service.RoleService;
import vn.backend.core.service.UserService;
import vn.backend.core.util.CommonUtils;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.Role;
import vn.backend.entity.data.mysql.User;
import vn.backend.entity.data.response.TokenResponse;

import java.util.concurrent.CompletableFuture;

@RestController
public class AuthController extends BaseController{
    @Autowired
    private UserService userService;

    @Autowired
    private SystemProperties systemProperties;

    @Autowired
    private RoleService roleService;

    @PostMapping("/user/authenticate")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @RequestBody User user) {
        User userDb = validateUserAuthenticate(user);
        if (CommonUtils.NVL(userDb.getId()) <= 0) {
            throw new AppException(ErrorCode.INVALID_AUTHENTICATION_INFO);
        }

        if (userDb.getActive() == 0) throw new AppException(ErrorCode.LOCK_ACCOUNT);
        var result = userService.authenticate(user, userDb, false);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    /**
     * Nhân viên tạo nhanh tài khoản người dùng, từ thông tin khách hàng mua hàng
     *
     * @param user
     * @return
     */
    @PostMapping("/user/create")
    public ResponseEntity<ApiResponse<AuthResponse>> create(
            @RequestBody User user) {
        if (!systemProperties.getEnabledRegister()) {
            throw new AppException(ErrorCode.REGISTRATION_DISABLED);
        }

        if (!StringUtils.isBlank(user.getPlainPassword())) {
            String password = BCrypt.hashpw(user.getPlainPassword(), BCrypt.gensalt());
            user.setPassword(password);
            user.setFirstTime(0);
        }

        Role defaultRole = roleService.getDefaultRole();
        user.setRoleId(defaultRole.getId());
        userService.register(user);
        AuthResponse authResponse = new AuthResponse(true, "Đăng ký thành công");
        return Mapper.map(authResponse, ApiResponse::okEntity);
    }


    private User validateUserAuthenticate(User user) {
        if (StringUtils.isBlank(user.getPhone()) && StringUtils.isBlank(user.getEmail())) {
            throw new AppException(ErrorCode.MISSING_EMAIL_OR_PHONE);
        }
        if (StringUtils.isBlank(user.getPlainPassword())) {
            throw new AppException(ErrorCode.MISSING_PASSWORD);
        }

        CompletableFuture<User> futureEmail = CompletableFuture.supplyAsync(
                () -> userService.getUserByEmail(user.getEmail())
        );
        CompletableFuture<User> futurePhone = CompletableFuture.supplyAsync(
                () -> userService.getUserByPhone(user.getPhone())
        );

        User userByEmail = futureEmail.join();
        User userByPhone = futurePhone.join();

        if (CommonUtils.NVL(userByEmail.getId()) > 0) return userByEmail;
        if (CommonUtils.NVL(userByPhone.getId()) > 0) return userByPhone;
        return new User();
    }
}
