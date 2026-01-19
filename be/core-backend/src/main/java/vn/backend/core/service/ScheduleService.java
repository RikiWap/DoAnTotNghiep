package vn.backend.core.service;

import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.ScheduleRepository;
import vn.backend.entity.data.mysql.Schedule;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;
    private final JavaMailSender mailSender;

    public Page<Schedule> getList(String keyword, Integer customerId, Integer type, Pageable pageable) {
        List<Schedule> list = scheduleRepository.getByCriteria(keyword, customerId, type, pageable);
        Long total = scheduleRepository.countByCriteria(keyword, customerId, type);

        pageable.setTotal(total);
        return new Page<>(pageable, list);
    }

    public Schedule getById(Integer id) {
        return scheduleRepository.getById(id);
    }

    public Schedule insert(Schedule item) {
        return scheduleRepository.insert(item);
    }

    public Schedule update(Schedule item) {
        return scheduleRepository.update(item);
    }

    public Integer delete(Integer id) {
        return scheduleRepository.delete(id);
    }

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Quét & gửi email nhắc lịch
     */
    public void processEmailReminder() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime fromTime = now.minusHours(1);

        List<Schedule> schedules =
                scheduleRepository.getSchedulesAfter(fromTime);

        if (schedules.isEmpty()) {
            log.info("No schedules found for email reminder.");
            return;
        }

        for (Schedule s : schedules) {
            try {
                sendEmail(s);
                scheduleRepository.markEmailSent(s.getId());
            } catch (Exception e) {
                log.error("Send email failed for schedule {}", s.getId(), e);
            }
        }
    }

    private void sendEmail(Schedule s) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(s.getUserEmail());
        message.setSubject("🔔 Nhắc lịch hẹn sắp tới");
        message.setText(buildEmailContent(s));

        mailSender.send(message);
    }

    private String buildEmailContent(Schedule s) {
        return String.format(
                """
                Xin chào %s,

                Bạn có một lịch hẹn sắp diễn ra trong vòng 1 tiếng tới.

                ─────────────────────────────
                📌 Tiêu đề: %s
                👤 Khách hàng: %s
                🕒 Thời gian: %s → %s
                🏢 Chi nhánh: %s
                📝 Nội dung:
                %s
                ─────────────────────────────

                Vui lòng chuẩn bị để đảm bảo buổi làm việc diễn ra hiệu quả.

                Trân trọng,
                Hệ thống CRM
                """,
                s.getUserName(),
                s.getTitle(),
                s.getCustomerName(),
                s.getStartTime().format(FORMATTER),
                s.getEndTime().format(FORMATTER),
                s.getBranchName(),
                s.getContent()
        );
    }

    /**
     * Chạy mỗi 1 phút
     */
    @Scheduled(cron = "0 */1 * * * ?")
//    @Scheduled(cron = "*/30 * * * * ?")
//    @PostConstruct
    public void run() {
        log.info("Running schedule email reminder task...");
        processEmailReminder();
    }
}
