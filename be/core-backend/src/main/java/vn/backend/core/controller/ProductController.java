package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.ProductService;
import vn.backend.core.util.CommonUtils;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.mysql.Product;

import java.security.Principal;

@RestController
public class ProductController extends BaseController {

    private static final String URI = "/product/";

    @Autowired
    private ProductService productService;

    @GetMapping("/product/list")
    public ResponseEntity<ApiResponse<Page<Product>>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer type,
            Pageable pageable,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        var result = productService.getListProductByCriteria(keyword, categoryId, status, type, pageable);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/product/get")
    public ResponseEntity<ApiResponse<Product>> get(
            @RequestParam Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "VIEW");
        var result = productService.getProductById(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/product/update")
    public ResponseEntity<ApiResponse<Product>> update(
            @RequestBody Product product,
            Principal principal
    ) {
        String action = (CommonUtils.NVL(product.getId()) <= 0) ? "ADD" : "UPDATE";
        checkPermission(principal, URI, action);

        Product result = (CommonUtils.NVL(product.getId()) <= 0)
                ? productService.insertProduct(product)
                : productService.updateProduct(product);

        return Mapper.map(result, ApiResponse::okEntity);
    }

    @DeleteMapping("/product/delete/{id}")
    public ResponseEntity<ApiResponse<Integer>> delete(
            @PathVariable Integer id,
            Principal principal
    ) {
        checkPermission(principal, URI, "DELETE");
        var result = productService.deleteProduct(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
