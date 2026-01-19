package vn.backend.core.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.CategoryItemRepository;
import vn.backend.entity.data.mysql.CategoryItem;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j(topic = "CATEGORY-ITEM-SERVICE")
@Service
public class CategoryItemService {

    @Autowired
    private CategoryItemRepository repo;

    public Page<CategoryItem> getListCategoryItem(String keyword, Integer type, Integer active,
                                                  Integer level, Pageable pageable) {

        CompletableFuture<List<CategoryItem>> futureList = CompletableFuture.supplyAsync(
                () -> repo.getList(keyword, type, active, level, pageable)
        );

        CompletableFuture<Long> futureCount = CompletableFuture.supplyAsync(
                () -> repo.countList(keyword, type, active, level)
        );

        List<CategoryItem> list = futureList.join();
        Long total = futureCount.join();

        pageable.setTotal(total);
        return new Page<>(pageable, list);
    }

    public List<CategoryItem> getChild(Integer parentId) {
        return repo.getChild(parentId);
    }

    public CategoryItem getById(Integer id) {
        return repo.getById(id);
    }

    public CategoryItem upsert(CategoryItem item) {
        if (item.getId() == null || item.getId() <= 0) {
            return repo.insert(item);
        }
        return repo.update(item);
    }

    public Integer delete(Integer id) {
        return repo.delete(id);
    }

    public Integer updateStatus(Integer id, Integer active) {
        return repo.updateStatus(id, active);
    }
}
