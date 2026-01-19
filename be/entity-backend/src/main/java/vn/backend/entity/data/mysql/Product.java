package vn.backend.entity.data.mysql;

import lombok.Data;

@Data
public class Product  {

    private Integer id;

    private String name;

    private Integer categoryId;
    private String categoryName;  // Lấy từ CategoryItem.name

    private String content;

    private String code;

    private String avatar;

    private Double price;

    private Double discount;

    private Integer discountUnit;

    private Integer position;

    private Integer status;

    private Integer unitId;
    private String unitName; // Lấy từ Unit.name

    private Integer type;

    private Integer expiredPeriod;
}
