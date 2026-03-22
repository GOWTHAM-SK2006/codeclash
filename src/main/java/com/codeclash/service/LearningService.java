package com.codeclash.service;

import com.codeclash.entity.Language;
import com.codeclash.entity.Lesson;
import com.codeclash.entity.Topic;
import com.codeclash.repository.LanguageRepository;
import com.codeclash.repository.LessonRepository;
import com.codeclash.repository.TopicRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LearningService {

    private final LanguageRepository languageRepository;
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;

    public List<Language> getAllLanguages() {
        return languageRepository.findAll();
    }

    public List<Topic> getTopicsByLanguage(Long languageId) {
        return topicRepository.findByLanguageIdOrderByOrderIndex(languageId);
    }

    public List<Lesson> getLessonsByTopic(Long topicId) {
        return lessonRepository.findByTopicIdOrderByOrderIndex(topicId);
    }

    public Lesson getLesson(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
    }

    @Transactional
    public void clearAllLearningContent() {
        lessonRepository.deleteAll();
        topicRepository.deleteAll();
    }

    /**
     * Temporary startup cleanup to remove existing duplicates.
     * This will run once when the application starts.
     * After one successful restart, this can be removed.
     */
    @PostConstruct
    public void startupCleanup() {
        try {
            System.out.println("Starting one-time learning content cleanup...");
            clearAllLearningContent();
            System.out.println("Learning content cleared successfully.");
        } catch (Exception e) {
            System.err.println("Failed to clear learning content: " + e.getMessage());
        }
    }
}
