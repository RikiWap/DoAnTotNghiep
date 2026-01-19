package vn.backend.entity.data.mysql;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class Branch {
    private Integer id;
    private Integer parentId;
    private String avatar;
    private String name;
    private String address;
    private String website;
    private String description;
    private Integer foundingYear;
    private Integer foundingMonth;
    private Integer foundingDay;
    private String phone;
    private String email;
    private Integer ownerId;
    private Timestamp createdTime;
    private Integer status;
}