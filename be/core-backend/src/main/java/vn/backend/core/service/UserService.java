package vn.backend.core.service;

import lombok.extern.slf4j.Slf4j;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.constant.ErrorCode;
import vn.backend.core.exception.AppException;
import vn.backend.core.repository.RoleRepository;
import vn.backend.core.repository.UserRepository;
import vn.backend.core.util.CommonUtils;
import vn.backend.entity.data.mysql.Role;
import vn.backend.entity.data.mysql.User;
import vn.backend.entity.data.response.TokenResponse;

import java.util.List;
import java.util.concurrent.CompletableFuture;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static vn.backend.core.util.SecurityUtils.toSimpleSecurityUser;

@Slf4j(topic = "USER-SERVICE")
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PermissionService permissionService;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private RoleRepository roleRepository;

    public User getUserById(Integer userId) {
        return userRepository.getUserById(userId);
    }

    public User checkPermission(Integer userId, String URI, String action) {
        User user = getUserById(userId);
        return checkUserPermission(URI, action, user);
    }

    private User checkUserPermission(String URI, String action, User user) {
        Integer roleId = user.getRoleId();
        if (CommonUtils.NVL(roleId) <= 0) return new User();
        Role role = roleRepository.getRoleById(roleId);

        if (CommonUtils.NVL(role.getId()) <= 0) {
            return new User();
        }

        if (role.getIsOperator() == 1) return user;

        Long totalPer = permissionService.checkPermission(roleId, URI, action);

        if (CommonUtils.NVL(totalPer) <= 0) {
            log.error("Lỗi không có quyền, roleId {}, URI {}, action {}",
                    roleId, URI, action);
        }
        if (totalPer > 0) return user;
        return new User();
    }

    public User register(User user) {
        User userDB = userRepository.getUserByPhone(user.getPhone());

        if (userDB != null && CommonUtils.NVL(userDB.getId()) > 0) {
            throw new AppException(ErrorCode.DUPLICATED_USER);
        }
        User newUser = userRepository.register(user);
        newUser.setType("register");
        newUser.setActionType("register");
        newUser.setTime(System.currentTimeMillis());
        return newUser;
    }

    public User insertUser(User user) {
        User userDB = userRepository.getUserByPhone(user.getPhone());

        if (userDB != null && CommonUtils.NVL(userDB.getId()) > 0) {
            throw new AppException(ErrorCode.DUPLICATED_USER);
        }
        if (user.getPlainPassword() != null && !user.getPlainPassword().isEmpty()) {
            String encryptedPassword = BCrypt.hashpw(user.getPlainPassword(), BCrypt.gensalt());
            user.setPassword(encryptedPassword);
        }

        User newUser = userRepository.insertUser(user);
        return newUser;
    }

    public User updateUser(User user) {
        if (!CommonUtils.NVL(user.getPlainPassword()).isEmpty()) {
            String encryptedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
            user.setPassword(encryptedPassword);
        }

        if (user.getPlainPassword() != null && !user.getPlainPassword().isEmpty()) {
            String encryptedPassword = BCrypt.hashpw(user.getPlainPassword(), BCrypt.gensalt());
            user.setPassword(encryptedPassword);
        }
        return userRepository.updateUser(user);
    }

    public User updateInfo(User user) {
        return userRepository.updateInfo(user);
    }

    public User updateUserPassword(Integer id, String newPassword) {
        if (CommonUtils.NVL(id) <= 0) {
            throw new AppException("Invalid user ID", BAD_REQUEST.value());
        }

        User user = userRepository.getUserById(id);
        if (CommonUtils.NVL(user.getId()) <= 0) {
            throw new AppException("User not found", BAD_REQUEST.value());
        }

        // Mã hóa password mới
        String encryptedPassword = BCrypt.hashpw(newPassword, BCrypt.gensalt());
        user.setPassword(encryptedPassword);
        return userRepository.updatePass(user);
    }

    public Integer deleteUser(Integer id) {
        return userRepository.deleteUser(id);
    }

    public Integer updateUserStatus(Integer id, Integer active) {
        return userRepository.updateUserStatus(id, active);
    }

    public TokenResponse authenticate(User user, User userDb, Boolean isRefresh) {
        userDb.setType("login");
        return this.getTokenResponse(user, userDb, isRefresh);
    }

    private TokenResponse getTokenResponse(User user, User userDb, Boolean isRefresh) {
        return this.processAuthenticate(user, userDb, isRefresh);
    }

    public TokenResponse processAuthenticate(User user, User userDb, Boolean isRefresh) {
        return extractToken(user, userDb, isRefresh);
    }


    /**
     * Kiểm tra có đăng nhập thành công hay không
     *
     * @param user
     * @param userDb
     * @return
     */
    private TokenResponse extractToken(User user, User userDb, Boolean isRefresh) {
        if (isRefresh) {
            return new TokenResponse(jwtService.generateJwt(toSimpleSecurityUser(userDb)));
        }

        Boolean validPassword = checkValidAuthenticationInfo(user, userDb);

        if (!validPassword) {
            throw new AppException(ErrorCode.INVALID_AUTHENTICATION_INFO);
        }
        return new TokenResponse(jwtService.generateJwt(toSimpleSecurityUser(userDb)));
    }

    private Boolean checkValidAuthenticationInfo(User user, User userDb) {
            if (user == null || user.getPlainPassword() == null) {
                throw new AppException(ErrorCode.INVALID_AUTHENTICATION_INFO);
            }
            return BCrypt.checkpw(user.getPlainPassword(), userDb.getPassword());
    }

    public Page<User> getListUserByCriteria(List<Integer> lstUserId, String query,
                                            Pageable pageable) {
        CompletableFuture<List<User>> futureLst = CompletableFuture.supplyAsync(
                () -> userRepository.getUserByCriteria(lstUserId, query, pageable)
        );
        CompletableFuture<Long> futureCount = CompletableFuture.supplyAsync(
                () -> userRepository.countUserByCriteria(lstUserId, query)
        );

        List<User> lst = futureLst.join();
        Long count = futureCount.join();

        pageable.setTotal(count);
        return new Page<>(pageable, lst);
    }

    public User getUserByPhone(String phone) {
        return userRepository.getUserByPhone(phone);
    }

    public User getUserByEmail(String email) {
        return userRepository.getUserByEmail(email);
    }


}
