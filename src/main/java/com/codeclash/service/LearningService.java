package com.codeclash.service;

import com.codeclash.entity.Language;
import com.codeclash.entity.Lesson;
import com.codeclash.entity.Topic;
import com.codeclash.repository.LanguageRepository;
import com.codeclash.repository.LessonRepository;
import com.codeclash.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}
