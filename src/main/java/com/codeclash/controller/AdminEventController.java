package com.codeclash.controller;

import com.codeclash.entity.Event;
import com.codeclash.service.AdminPanelService;
import com.codeclash.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
public class AdminEventController {

    private final EventService eventService;
    private final AdminPanelService adminPanelService;

    @GetMapping
    public List<Event> getAllEvents(@RequestHeader("X-Admin-Session") String token) {
        adminPanelService.verifyAdminSession(token);
        return eventService.getAllEvents(false);
    }

    @PostMapping
    public Event createEvent(@RequestHeader("X-Admin-Session") String token, @RequestBody Map<String, Object> body) {
        adminPanelService.verifyAdminSession(token);

        Event event = Event.builder()
                .title(String.valueOf(body.get("title")))
                .biddingTitle(String.valueOf(body.get("biddingTitle")))
                .entryFee(Integer.parseInt(String.valueOf(body.get("entryFee"))))
                .biddingStartTime(LocalDateTime.parse(String.valueOf(body.get("biddingStartTime"))))
                .contestTitle(String.valueOf(body.get("contestTitle")))
                .contestStartTime(LocalDateTime.parse(String.valueOf(body.get("contestStartTime"))))
                .contestDurationMinutes(Integer.parseInt(String.valueOf(body.get("contestDuration"))))
                .problemIds(String.valueOf(body.get("problemIds")))
                .maxParticipants(Integer.parseInt(String.valueOf(body.get("maxParticipants"))))
                .build();

        return eventService.createEvent(event);
    }

    @DeleteMapping("/{id}")
    public void deleteEvent(@RequestHeader("X-Admin-Session") String token, @PathVariable String id) {
        adminPanelService.verifyAdminSession(token);
        eventService.deleteEvent(id);
    }
}
