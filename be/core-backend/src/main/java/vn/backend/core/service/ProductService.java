package vn.backend.core.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.ProductRepository;
import vn.backend.entity.data.mysql.Product;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;

@Service
@Slf4j(topic = "PRODUCT-SERVICE")
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Page<Product> getListProductByCriteria(
            String keyword, Integer categoryId, Integer status, Integer type, Pageable pageable) {

        var executor = Executors.newFixedThreadPool(4);

        CompletableFuture<List<Product>> futureList = CompletableFuture.supplyAsync(
                () -> productRepository.getProductByCriteria(keyword, categoryId, status, type, pageable),
                executor
        );

        CompletableFuture<Long> futureCount = CompletableFuture.supplyAsync(
                () -> productRepository.countProductByCriteria(keyword, categoryId, status, type),
                executor
        );

        List<Product> list = futureList.join();
        Long count = futureCount.join();

        pageable.setTotal(count);
        executor.shutdown();

        return new Page<>(pageable, list);
    }

    public Product getProductById(Integer id) {
        return productRepository.getProductById(id);
    }

    public Product insertProduct(Product product) {
        return productRepository.insertProduct(product);
    }

    public Product updateProduct(Product product) {
        return productRepository.updateProduct(product);
    }

    public Integer deleteProduct(Integer id) {
        return productRepository.deleteProduct(id);
    }
}
