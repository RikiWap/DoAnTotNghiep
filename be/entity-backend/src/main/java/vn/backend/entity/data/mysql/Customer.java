package vn.backend.entity.data.mysql;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class Customer {
    private Integer id;
    private String name;
    private String avatar;
    private Integer gender; // 1 - Nữ, 2 - Nam
    private Integer age;
    private Integer sourceId;  // Nguồn khách hàng
    private String sourceName;
    private String address;
    private String phone;
    private String email;
    private LocalDateTime birthday;
    private Integer height;
    private Double weight;
    private Integer userId;      // Người phụ trách khách hàng
    private String userName;

    private Integer creatorId;   // Người tạo
    private String creatorName;

    private String note;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;
    private LocalDateTime latestContact;

    //Dữ liệu submit trên form xuống
    private List<CustomerExtraInfo> customerExtraInfos;

    //Chứa thông tin bổ trợ (thuộc tính bổ sung khách hàng)
    private Map<Integer, List<CustomerAttribute>> mapCustomerAttribute;

}
