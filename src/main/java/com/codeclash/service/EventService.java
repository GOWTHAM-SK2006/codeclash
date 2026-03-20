package com.codeclash.service;

import com.codeclash.entity.Event;
import com.codeclash.entity.EventBid;
import com.codeclash.entity.User;
import com.codeclash.repository.EventBidRepository;
import com.codeclash.repository.EventRepository;
import com.codeclash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private final EventBidRepository eventBidRepository;
    private final UserRepository userRepository;
    private final CoinService coinService;

    private static final int BID_DURATION_MINS = 2;
    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    // ──────────────────────────────────────────────────────────────
    // Admin Actions
    // ──────────────────────────────────────────────────────────────

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents(boolean onlyActive) {
        if (onlyActive) {
            return eventRepository.findAllByActiveTrueOrderByBiddingStartTimeAsc();
        }
        return eventRepository.findAll();
    }

    @Transactional
    public void deleteEvent(String id) {
        eventBidRepository.deleteAllByEventId(id);
        eventRepository.deleteById(id);
    }

    public Event getEventById(String id) {
        return eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
    }

    @Transactional
    public Event updateEvent(String id, Map<String, Object> body) {
        Event event = getEventById(id);
        if (body.containsKey("title"))
            event.setTitle(String.valueOf(body.get("title")));
        if (body.containsKey("biddingTitle"))
            event.setBiddingTitle(String.valueOf(body.get("biddingTitle")));
        if (body.containsKey("entryFee"))
            event.setEntryFee(Integer.parseInt(String.valueOf(body.get("entryFee"))));
        if (body.containsKey("biddingStartTime"))
            event.setBiddingStartTime(LocalDateTime.parse(String.valueOf(body.get("biddingStartTime"))));
        if (body.containsKey("contestTitle"))
            event.setContestTitle(String.valueOf(body.get("contestTitle")));
        if (body.containsKey("contestStartTime"))
            event.setContestStartTime(LocalDateTime.parse(String.valueOf(body.get("contestStartTime"))));
        if (body.containsKey("contestDuration"))
            event.setContestDurationMinutes(Integer.parseInt(String.valueOf(body.get("contestDuration"))));
        if (body.containsKey("problemIds"))
            event.setProblemIds(String.valueOf(body.get("problemIds")));
        if (body.containsKey("maxParticipants"))
            event.setMaxParticipants(Integer.parseInt(String.valueOf(body.get("maxParticipants"))));
        if (body.containsKey("active"))
            event.setActive((Boolean) body.get("active"));
        return eventRepository.save(event);
    }

    public Map<String, Object> getAdminEventDetails(String id) {
        Event event = getEventById(id);
        Map<String, Object> status = getEventStatus(id, null);

        List<EventBid> bids = eventBidRepository.findAllByEventIdOrderByAmountDescUpdatedAtAsc(id);
        List<Map<String, Object>> bidDetails = bids.stream().map(b -> {
            Map<String, Object> m = new HashMap<>();
            m.put("userId", b.getUser().getId());
            m.put("username", b.getUser().getUsername());
            m.put("displayName",
                    b.getUser().getDisplayName() != null ? b.getUser().getDisplayName() : b.getUser().getUsername());
            m.put("amount", b.getAmount());
            m.put("selected", b.isSelected());
            m.put("refunded", b.isRefunded());
            m.put("rank", b.getRank());
            return m;
        }).collect(Collectors.toList());

        status.put("allBids", bidDetails);
        status.put("selectedCount", bids.stream().filter(EventBid::isSelected).count());
        status.put("isBiddingProcessed", event.isBiddingProcessed());
        status.put("isContestProcessed", event.isContestProcessed());

        return status;
    }

    @Transactional
    public void manualFinalizeWinners(String id, List<Long> winnerUserIds) {
        Event event = getEventById(id);
        List<EventBid> allBids = eventBidRepository.findAllByEventIdOrderByAmountDescUpdatedAtAsc(id);

        for (EventBid bid : allBids) {
            boolean isWinner = winnerUserIds.contains(bid.getUser().getId());

            bid.setSelected(isWinner);
            if (isWinner) {
                bid.setRank(winnerUserIds.indexOf(bid.getUser().getId()) + 1);
                bid.setRefunded(false);
            } else {
                bid.setRank(null);
                if (!bid.isRefunded() && bid.getAmount() > 0) {
                    bid.setRefunded(true);
                    coinService.awardCoins(bid.getUser(), bid.getAmount(),
                            "Bidding refund (Manual Selection) for: " + event.getTitle());
                }
            }
            eventBidRepository.save(bid);
        }

        event.setBiddingProcessed(true);
        eventRepository.save(event);
    }

    @Transactional
    public void distributeRewards(String id, List<Map<String, Object>> customRewards) {
        Event event = getEventById(id);
        if (event.isContestProcessed()) {
            throw new RuntimeException("Rewards already distributed");
        }

        for (Map<String, Object> reward : customRewards) {
            Long userId = Long.valueOf(String.valueOf(reward.get("userId")));
            int amount = Integer.valueOf(String.valueOf(reward.get("amount")));
            String reason = String.valueOf(reward.getOrDefault("reason", "Event Rewards: " + event.getTitle()));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));

            coinService.awardCoins(user, amount, reason);
        }

        event.setContestProcessed(true);
        eventRepository.save(event);
    }

    // ──────────────────────────────────────────────────────────────
    // Status & Logic
    // ──────────────────────────────────────────────────────────────

    public enum EventPhase {
        NOT_STARTED, BIDDING_LIVE, BIDDING_ENDED, CONTEST_LIVE, CONTEST_ENDED
    }

    public Map<String, Object> getEventStatus(String eventId, String username) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        LocalDateTime now = LocalDateTime.now(IST);
        EventPhase phase = determinePhase(event, now);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", event.getId());
        res.put("title", event.getTitle());
        res.put("phase", phase.name());
        res.put("entryFee", event.getEntryFee());
        res.put("maxParticipants", event.getMaxParticipants());

        // Timing
        res.put("biddingStart", event.getBiddingStartTime());
        res.put("contestStart", event.getContestStartTime());
        res.put("contestDuration", event.getContestDurationMinutes());

        // Countdowns
        if (phase == EventPhase.NOT_STARTED) {
            res.put("secondsUntilBidding", java.time.Duration.between(now, event.getBiddingStartTime()).getSeconds());
        } else if (phase == EventPhase.BIDDING_LIVE) {
            res.put("secondsRemainingBidding",
                    java.time.Duration.between(now, event.getBiddingStartTime().plusMinutes(BID_DURATION_MINS))
                            .getSeconds());
        }

        // Leaderboard
        List<EventBid> allBids = eventBidRepository.findAllByEventIdOrderByAmountDescUpdatedAtAsc(eventId);
        List<Map<String, Object>> leaderboard = allBids.stream().map(b -> {
            Map<String, Object> m = new HashMap<>();
            m.put("username", b.getUser().getUsername());
            m.put("displayName",
                    b.getUser().getDisplayName() != null ? b.getUser().getDisplayName() : b.getUser().getUsername());
            m.put("amount", b.getAmount());
            m.put("selected", b.isSelected());
            return m;
        }).collect(Collectors.toList());
        res.put("leaderboard", leaderboard);

        // User specific
        if (username != null) {
            User user = userRepository.findByUsername(username).orElse(null);
            if (user != null) {
                Optional<EventBid> bidOpt = eventBidRepository.findByEventIdAndUserId(eventId, user.getId());
                int userAmount = bidOpt.map(EventBid::getAmount).orElse(0);
                boolean isSelected = bidOpt.map(EventBid::isSelected).orElse(false);

                // Rank calculation
                int rank = -1;
                for (int i = 0; i < allBids.size(); i++) {
                    if (allBids.get(i).getUser().getId().equals(user.getId())) {
                        rank = i + 1;
                        break;
                    }
                }

                // Predictive selection check if bidding ended but not processed
                if (!isSelected && phase != EventPhase.NOT_STARTED && phase != EventPhase.BIDDING_LIVE
                        && !event.isBiddingProcessed()) {
                    if (rank != -1 && rank <= event.getMaxParticipants() && userAmount > 0) {
                        isSelected = true;
                    }
                }

                res.put("userBid", userAmount);
                res.put("userSelected", isSelected);
                res.put("userRank", rank);
                res.put("biddingProcessed", event.isBiddingProcessed());
            }
        }

        return res;
    }

    private EventPhase determinePhase(Event event, LocalDateTime now) {
        if (now.isBefore(event.getBiddingStartTime())) {
            return EventPhase.NOT_STARTED;
        }
        if (now.isBefore(event.getBiddingStartTime().plusMinutes(BID_DURATION_MINS))) {
            return EventPhase.BIDDING_LIVE;
        }
        if (now.isBefore(event.getContestStartTime())) {
            return EventPhase.BIDDING_ENDED;
        }
        if (now.isBefore(event.getContestStartTime().plusMinutes(event.getContestDurationMinutes()))) {
            return EventPhase.CONTEST_LIVE;
        }
        return EventPhase.CONTEST_ENDED;
    }

    // ──────────────────────────────────────────────────────────────
    // Bidding Action
    // ──────────────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> placeBid(String eventId, String username) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (determinePhase(event, LocalDateTime.now(IST)) != EventPhase.BIDDING_LIVE) {
            throw new RuntimeException("Bidding is not active");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!coinService.hasEnoughCoins(user, event.getEntryFee())) {
            throw new RuntimeException("Not enough coins");
        }

        EventBid bid = eventBidRepository.findByEventIdAndUserId(eventId, user.getId())
                .orElse(EventBid.builder().event(event).user(user).amount(0).build());

        bid.setAmount(bid.getAmount() + event.getEntryFee());
        eventBidRepository.save(bid);

        coinService.spendCoins(user, event.getEntryFee(), "Bidding on event: " + event.getTitle());

        return Map.of("ok", true, "newAmount", bid.getAmount());
    }

    // ──────────────────────────────────────────────────────────────
    // Scheduled Tasks
    // ──────────────────────────────────────────────────────────────

    @Scheduled(fixedRate = 30000) // 30 sec
    @Transactional
    public void processEvents() {
        LocalDateTime now = LocalDateTime.now(IST);
        List<Event> activeEvents = eventRepository.findAllByActiveTrueOrderByBiddingStartTimeAsc();

        for (Event event : activeEvents) {
            // 1. Conclude bidding phase
            if (!event.isBiddingProcessed()
                    && now.isAfter(event.getBiddingStartTime().plusMinutes(BID_DURATION_MINS))) {
                concludeBidding(event);
            }
        }
    }

    private void concludeBidding(Event event) {
        log.info("Processing bidding for event: {}", event.getTitle());

        List<EventBid> allBids = eventBidRepository.findAllByEventIdOrderByAmountDescUpdatedAtAsc(event.getId());

        // Mark Top N
        int limit = event.getMaxParticipants();
        for (int i = 0; i < allBids.size(); i++) {
            EventBid bid = allBids.get(i);
            if (i < limit && bid.getAmount() > 0) {
                bid.setSelected(true);
                bid.setRank(i + 1);
            } else {
                bid.setRefunded(true);
                coinService.awardCoins(bid.getUser(), bid.getAmount(), "Bidding refund for: " + event.getTitle());
            }
            eventBidRepository.save(bid);
        }

        event.setBiddingProcessed(true);
        eventRepository.save(event);
    }
}
