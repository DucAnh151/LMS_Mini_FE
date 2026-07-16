DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS courses;

CREATE TABLE `courses` (
  `created_date` date NOT NULL,
  `price` decimal(19,4) DEFAULT NULL,
  `updated_date` date NOT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `instructor_name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `course_language` enum('ENGLISH','VIETNAMESE') DEFAULT NULL,
  `level` enum('ADVANCED','BEGINNER','INTERMEDIATE') DEFAULT NULL,
  `status` enum('ACTIVE','DELETE') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK61og8rbqdd2y28rx2et5fdnxd` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `students` (
  `birth_date` date DEFAULT NULL,
  `created_date` date NOT NULL,
  `updated_date` date NOT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `identity_number` varchar(255) NOT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `gender` enum('FEMALE','MALE','OTHER') DEFAULT NULL,
  `status` enum('ACTIVE','DELETE') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKe2rndfrsx22acpq2ty1caeuyw` (`email`),
  UNIQUE KEY `UKsipa5l8v21bj47swfp4bs7awk` (`identity_number`),
  UNIQUE KEY `UKtdld3q5q0s0u7v0rq4h9jiohn` (`phone_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `lessons` (
  `created_date` date NOT NULL,
  `duration_in_seconds` int(11) DEFAULT NULL,
  `order_index` int(11) DEFAULT NULL,
  `updated_date` date NOT NULL,
  `course_id` bigint(20) DEFAULT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `lesson_code` varchar(50) NOT NULL,
  `content` text DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `lesson_type` enum('DOCUMENT','QUIZ','VIDEO') DEFAULT NULL,
  `status` enum('ACTIVE','DELETE') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK7jvsiodwrlie5ajrom650ofuw` (`lesson_code`),
  KEY `FK17ucc7gjfjddsyi0gvstkqeat` (`course_id`),
  CONSTRAINT `FK17ucc7gjfjddsyi0gvstkqeat`
    FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `resources` (
  `created_date` date NOT NULL,
  `is_primary` bit(1) NOT NULL,
  `updated_date` date NOT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `object_id` bigint(20) NOT NULL,
  `url` varchar(255) NOT NULL,
  `object_type` enum('COURSE','LESSON','STUDENT') NOT NULL,
  `resource_type` enum('AVATAR','DOCUMENT','THUMBNAIL','VIDEO') NOT NULL,
  `status` enum('ACTIVE','DELETE') DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `enrollments` (
  `created_date` date NOT NULL,
  `updated_date` date NOT NULL,
  `course_id` bigint(20) NOT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `student_id` bigint(20) NOT NULL,
  `status` enum('ACTIVE','DELETE') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKi0g6mfijtuh199nj653nva6j5` (`student_id`,`course_id`),
  KEY `FKho8mcicp4196ebpltdn9wl6co` (`course_id`),
  CONSTRAINT `FK8kf1u1857xgo56xbfmnif2c51`
    FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKho8mcicp4196ebpltdn9wl6co`
    FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;