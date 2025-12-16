-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 19, 2025 at 04:44 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `humai_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetDiseasesAndTreatments` (IN `id` INT, OUT `treatment` TEXT)   BEGIN
    
    SELECT CONCAT(d.name, ': ', t.treatment)
    INTO treatment
    FROM diseases d
    JOIN treatment t ON d.id = t.disease_id
    WHERE d.id = id
    LIMIT 1;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetUserDiagnoses` (IN `user_id` INT)   BEGIN
    SELECT u.first_name, u.last_name, d.name AS disease_name, di.confidence, di.notes, di.date_diagnosed
    FROM diagnosis di
    JOIN user u ON di.user_id = u.id
    JOIN diseases d ON di.disease_id = d.id
    WHERE u.id = user_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetUserFeedback` (IN `user_id` INT, OUT `feedback_details` TEXT)   BEGIN
    
    SET feedback_details = '';

    
    SELECT GROUP_CONCAT(f.comments SEPARATOR ', ') INTO feedback_details
    FROM feedback f
    WHERE f.user_id = user_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetUserLogs` (IN `user_id` INT)   BEGIN
    SELECT a.name AS action_name, l.detail, l.log_date
    FROM logs l
    JOIN action a ON l.action_id = a.id
    WHERE l.user_id = user_id
    ORDER BY l.log_date DESC;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetUserLogsByDateRange` (IN `user_id` INT, IN `start_date` DATE, IN `end_date` DATE, OUT `log_details` TEXT)   BEGIN
    SET log_details = '';
    SELECT GROUP_CONCAT(CONCAT(a.name, ' - ', l.detail, ' - ', l.log_date) SEPARATOR ', ')
    INTO log_details
    FROM logs l
    JOIN action a ON l.action_id = a.id
    WHERE l.user_id = user_id AND l.log_date BETWEEN start_date AND end_date;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `return_diagnose` (IN `disease` VARCHAR(100))   begin
select d.id as ID, concat(u.first_name,', ', u.last_name) as User, d.image_path as Image_path, ds.name as Disease, d.confidence as Confidence, d.notes as Note , d.date_diagnosed as Date_diagnosed, t.treatment as Treatment 
from diagnosis d
join user u on u.id=d.user_id
join diseases ds on ds.id=d.disease_id
join treatment t on t.disease_id=ds.id
where ds.name=disease
group by d.id;

end$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `action`
--

CREATE TABLE `action` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `action`
--

INSERT INTO `action` (`id`, `name`, `description`) VALUES
(1, 'Register', 'User registered a new account'),
(2, 'Update Profile', 'User updated their profile information'),
(3, 'Change Password', 'User changed their account password'),
(4, 'Reset Password', 'User requested a password reset'),
(5, 'View Diagnosis History', 'User viewed their past diagnosis results'),
(6, 'Download Report', 'User downloaded a detailed report of the diagnosis'),
(7, 'Submit Feedback', 'User submitted feedback about the platform'),
(8, 'Request Support', 'User requested technical support'),
(9, 'Update Disease Info', 'User updated information about a specific disease'),
(10, 'Mark as Favorite', 'User marked a disease or treatment as a favorite'),
(11, 'Share Diagnosis', 'User shared their diagnosis results with others'),
(12, 'Generate Recommendation', 'User generated a treatment recommendation based on diagnosis'),
(13, 'Login', 'User logged into the system'),
(14, 'Logout', 'User logged out of the system'),
(15, 'diagnosed an image', 'user diagnosed an image');

-- --------------------------------------------------------

--
-- Table structure for table `diagnosis`
--

CREATE TABLE `diagnosis` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `disease_id` int(11) DEFAULT NULL,
  `confidence` decimal(5,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `date_diagnosed` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diagnosis`
--

INSERT INTO `diagnosis` (`id`, `user_id`, `image_path`, `disease_id`, `confidence`, `notes`, `date_diagnosed`) VALUES
(1, 1, '/images/rice_blight.jpg', 1, 95.00, 'Highly likely to be bacterial leaf blight', '2025-07-14 06:26:45'),
(2, 2, '/images/rice_blast.jpg', 4, 90.00, 'Potential leaf blast disease', '2025-07-14 06:26:45'),
(3, 3, '/images/rice_spot.jpg', 2, 85.00, 'Possible brown spot infection', '2025-07-14 06:26:45'),
(4, 4, '/images/rice_healthy.jpg', 3, 100.00, 'No disease, healthy rice leaf', '2025-07-14 06:26:45'),
(5, 5, '/images/rice_blast.jpg', 4, 92.00, 'Leaf blast suspected', '2025-07-14 06:26:45'),
(6, 6, '/images/rice_scald.jpg', 5, 88.00, 'Leaf scald infection possible', '2025-07-14 06:26:45'),
(7, 9, '/images/rice_narrow_spot.jpg', 6, 89.00, 'Likely narrow brown leaf spot', '2025-07-14 06:26:45'),
(8, 8, '/images/rice_neck_blast.jpg', 7, 91.00, 'Potential neck blast detected', '2025-07-14 06:26:45'),
(9, 9, '/images/rice_hispa.jpg', 8, 85.00, 'Rice hispa insect damage', '2025-07-14 06:26:45'),
(10, 10, '/images/rice_sheath_blight.jpg', 9, 93.00, 'Possible sheath blight disease', '2025-07-14 06:26:45'),
(11, 11, '/images/rice_blight.jpg', 1, 94.00, 'Highly likely to be bacterial leaf blight', '2025-07-14 06:26:45'),
(12, 12, '/images/rice_blast.jpg', 4, 87.00, 'Leaf blast infection observed', '2025-07-14 06:26:45'),
(13, 13, '/images/rice_spot.jpg', 2, 86.00, 'Brown spot detected on rice leaf', '2025-07-14 06:26:45'),
(14, 14, '/images/rice_healthy.jpg', 3, 100.00, 'Healthy rice leaf, no disease', '2025-07-14 06:26:45'),
(15, 1, '/images/rice_blast.jpg', 4, 91.00, 'Leaf blast suspected in upper leaves', '2025-07-14 06:26:45'),
(16, 16, '/images/rice_scald.jpg', 5, 89.00, 'Possible leaf scald in rice plant', '2025-07-14 06:26:45'),
(17, 17, '/images/rice_narrow_spot.jpg', 6, 84.00, 'Signs of narrow brown leaf spot infection', '2025-07-14 06:26:45'),
(18, 18, '/images/rice_neck_blast.jpg', 7, 93.00, 'Neck blast detected in the crop', '2025-07-14 06:26:45'),
(19, 9, '/images/rice_hispa.jpg', 8, 83.00, 'Rice hispa pest observed in field', '2025-07-14 06:26:45'),
(20, 20, '/images/rice_sheath_blight.jpg', 9, 90.00, 'Sheath blight infection identified', '2025-07-14 06:26:45'),
(21, 21, '/images/rice_blight.jpg', 1, 95.00, 'Bacterial leaf blight infection suspected', '2025-07-14 06:26:45'),
(22, 22, '/images/rice_blast.jpg', 4, 88.00, 'Leaf blast suspected in field', '2025-07-14 06:26:45'),
(23, 23, '/images/rice_spot.jpg', 2, 87.00, 'Brown spot infection on lower leaves', '2025-07-14 06:26:45'),
(24, 24, '/images/rice_healthy.jpg', 3, 100.00, 'No disease, healthy rice crop', '2025-07-14 06:26:45'),
(25, 5, '/images/rice_blast.jpg', 4, 93.00, 'Leaf blast detected in rice plant', '2025-07-14 06:26:45'),
(26, 26, '/images/rice_scald.jpg', 5, 90.00, 'Leaf scald infection observed', '2025-07-14 06:26:45'),
(27, 27, '/images/rice_narrow_spot.jpg', 6, 86.00, 'Narrow brown leaf spot visible on rice leaves', '2025-07-14 06:26:45'),
(28, 28, '/images/rice_neck_blast.jpg', 7, 92.00, 'Neck blast likely to spread', '2025-07-14 06:26:45'),
(29, 29, '/images/rice_hispa.jpg', 8, 82.00, 'Insect damage from rice hispa seen', '2025-07-14 06:26:45'),
(30, 30, '/images/rice_sheath_blight.jpg', 9, 91.00, 'Sheath blight affecting the rice crop', '2025-07-14 06:26:45'),
(31, 31, '/images/rice_blight.jpg', 1, 93.00, 'Symptoms of bacterial leaf blight', '2025-07-14 06:26:45'),
(32, 32, '/images/rice_blast.jpg', 4, 89.00, 'Leaf blast observed in several fields', '2025-07-14 06:26:45'),
(33, 3, '/images/rice_spot.jpg', 2, 85.00, 'Brown spot infection confirmed', '2025-07-14 06:26:45'),
(34, 34, '/images/rice_healthy.jpg', 3, 100.00, 'Healthy rice leaves, no signs of disease', '2025-07-14 06:26:45'),
(35, 35, '/images/rice_blast.jpg', 4, 94.00, 'Moderate leaf blast observed', '2025-07-14 06:26:45'),
(36, 36, '/images/rice_scald.jpg', 5, 88.00, 'Early signs of leaf scald', '2025-07-14 06:26:45'),
(37, 37, '/images/rice_narrow_spot.jpg', 6, 83.00, 'Narrow brown leaf spot likely spreading', '2025-07-14 06:26:45'),
(38, 38, '/images/rice_neck_blast.jpg', 7, 90.00, 'Neck blast detected in several plants', '2025-07-14 06:26:45'),
(39, 39, '/images/rice_hispa.jpg', 8, 80.00, 'Rice hispa presence confirmed', '2025-07-14 06:26:45'),
(40, 40, '/images/rice_sheath_blight.jpg', 9, 92.00, 'Sheath blight affecting a significant portion of the crop', '2025-07-14 06:26:45'),
(41, 41, '/images/rice_blight.jpg', 1, 96.00, 'Bacterial leaf blight identified', '2025-07-14 06:26:45'),
(42, 42, '/images/rice_blast.jpg', 4, 85.00, 'Leaf blast confirmed in multiple areas', '2025-07-14 06:26:45'),
(43, 43, '/images/rice_spot.jpg', 2, 84.00, 'Brown spot confirmed in rice plants', '2025-07-14 06:26:45'),
(44, 44, '/images/rice_healthy.jpg', 3, 100.00, 'No disease observed, healthy crop', '2025-07-14 06:26:45'),
(45, 45, '/images/rice_blast.jpg', 4, 92.00, 'Leaf blast suspected but not confirmed', '2025-07-14 06:26:45'),
(46, 46, '/images/rice_scald.jpg', 5, 87.00, 'Leaf scald detected in some leaves', '2025-07-14 06:26:45'),
(47, 47, '/images/rice_narrow_spot.jpg', 6, 90.00, 'Signs of narrow brown leaf spot seen', '2025-07-14 06:26:45'),
(48, 48, '/images/rice_neck_blast.jpg', 7, 91.00, 'Neck blast detected in rice plants', '2025-07-14 06:26:45'),
(49, 49, '/images/rice_hispa.jpg', 8, 86.00, 'Damage from rice hispa seen on plants', '2025-07-14 06:26:45'),
(50, 50, '/images/rice_sheath_blight.jpg', 9, 90.00, 'Sheath blight detected on multiple plants', '2025-07-14 06:26:45');

-- --------------------------------------------------------

--
-- Table structure for table `diseases`
--

CREATE TABLE `diseases` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  `cause` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diseases`
--

INSERT INTO `diseases` (`id`, `name`, `type`, `cause`) VALUES
(1, 'Bacterial Leaf Blight', 'Bacterial', 'Xanthomonas oryzae pv. oryzae'),
(2, 'Brown Spot', 'Fungal', 'Bipolaris oryzae'),
(3, 'Healthy Rice Leaf', 'Healthy', 'No disease present'),
(4, 'Leaf Blast', 'Fungal', 'Magnaporthe oryzae'),
(5, 'Leaf Scald', 'Fungal', 'Microdochium oryzae'),
(6, 'Narrow Brown Leaf Spot', 'Fungal', 'Cochliobolus miyabeanus'),
(7, 'Neck Blast', 'Fungal', 'Magnaporthe oryzae'),
(8, 'Rice Hispa', 'Insect', 'Dicladispa armigera'),
(9, 'Sheath Blight', 'Fungal', 'Rhizoctonia solani');

--
-- Triggers `diseases`
--
DELIMITER $$
CREATE TRIGGER `prevent_duplicate_disease_name` BEFORE INSERT ON `diseases` FOR EACH ROW BEGIN
    IF EXISTS (SELECT 1 FROM diseases WHERE name = NEW.name) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Disease name must be unique.';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` int(11) NOT NULL,
  `question` varchar(1000) NOT NULL,
  `answer` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `comments` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`id`, `user_id`, `comments`, `created_at`) VALUES
(1, 1, 'Great platform, very easy to use and intuitive!', '2025-09-17 06:47:07'),
(2, 2, 'Could use some performance improvements, but works well overall.', '2025-09-17 06:47:07'),
(3, 3, 'The mobile app version is a bit laggy at times.', '2025-09-17 06:47:07'),
(4, 4, 'I love how user-friendly everything is. Keep it up!', '2025-09-17 06:47:07'),
(5, 5, 'I had some trouble uploading images, but the support was helpful.', '2025-09-17 06:47:07'),
(6, 6, 'Fantastic service, really impressed with the system accuracy.', '2025-09-17 06:47:07'),
(7, 5, 'I like the design, but I would love more tutorial content.', '2025-09-17 06:47:07'),
(8, 8, 'Good experience, but it would be nice to have more detailed results.', '2025-09-17 06:47:07'),
(9, 9, 'Sometimes the system takes too long to diagnose, needs faster processing.', '2025-09-17 06:47:07'),
(10, 10, 'Very informative platform, I learned a lot about crop diseases!', '2025-09-17 06:47:07'),
(11, 11, 'The interface is sleek, but it can be difficult to navigate at times.', '2025-09-17 06:47:07'),
(12, 12, 'I appreciate the system\'s accuracy, it really helped me a lot.', '2025-09-17 06:47:07'),
(13, 13, 'Could benefit from more customization options for notifications.', '2025-09-17 06:47:07'),
(14, 14, 'Amazing platform! The analysis and results are spot-on.', '2025-09-17 06:47:07'),
(15, 18, 'It\'s a great tool, but I think it needs better integration with social media.', '2025-09-17 06:47:07'),
(16, 16, 'Love the detailed information, but it would be helpful if it could support more diseases.', '2025-09-17 06:47:07'),
(17, 17, 'Good tool, but I had trouble with the login process initially.', '2025-09-17 06:47:07'),
(18, 18, 'I would appreciate more prevention tips for different diseases.', '2025-09-17 06:47:07'),
(19, 10, 'Overall, the platform is easy to use, but the help section could be better.', '2025-09-17 06:47:07'),
(20, 20, 'I wish the app had a way to track the progress of my crops over time.', '2025-09-17 06:47:07'),
(21, 21, 'Really easy to use and useful, but it could do with better image recognition.', '2025-09-17 06:47:07'),
(22, 22, 'I was expecting more information on the diagnosis, but it was still helpful.', '2025-09-17 06:47:07'),
(23, 23, 'It took me a while to figure out how to upload my data, but once done, it was fine.', '2025-09-17 06:47:07'),
(24, 24, 'The treatment information provided was very useful, thank you.', '2025-09-17 06:47:07'),
(25, 26, 'The app needs to be more responsive, but otherwise works well.', '2025-09-17 06:47:07'),
(26, 26, 'I found the disease explanations really helpful. Would love more detailed notes.', '2025-09-17 06:47:07'),
(27, 27, 'Good experience, although the system sometimes freezes when uploading large files.', '2025-09-17 06:47:07'),
(28, 28, 'I appreciate the real-time updates and notifications from the platform.', '2025-09-17 06:47:07'),
(29, 29, 'It\'s a helpful tool for diagnosing crop diseases, but I would suggest adding more crops.', '2025-09-17 06:47:07'),
(30, 30, 'The feedback I got was quick and useful, but I hope the system improves over time.', '2025-09-17 06:47:07');

-- --------------------------------------------------------

--
-- Stand-in structure for view `how_to`
-- (See below for the actual view)
--
CREATE TABLE `how_to` (
`id` int(11)
,`disease_name` varchar(100)
,`cause` text
,`treatment` text
,`prevention` text
);

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

CREATE TABLE `logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action_id` int(11) DEFAULT NULL,
  `detail` text DEFAULT NULL,
  `log_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `logs`
--

INSERT INTO `logs` (`id`, `user_id`, `action_id`, `detail`, `log_date`) VALUES
(1, 7, 14, 'Admin logged in to the system', '2025-07-14 06:21:00'),
(2, 2, 2, 'User uploaded an image of rice crop for diagnosis', '2025-07-14 06:21:00'),
(3, 3, 2, 'User performed a diagnosis on a rice crop image', '2025-07-14 06:21:00'),
(4, 4, 1, 'User logged out of the system', '2025-07-14 06:21:00'),
(5, 15, 1, 'Admin logged in to the system', '2025-07-14 06:21:00'),
(6, 6, 3, 'User uploaded an image of rice crop for diagnosis', '2025-07-14 06:21:00'),
(7, 7, 3, 'User performed a diagnosis on a rice crop image', '2025-07-14 06:21:00'),
(8, 8, 4, 'User logged out of the system', '2025-07-14 06:21:00'),
(9, 9, 10, 'User logged in to the system', '2025-07-14 06:21:00'),
(10, 10, 2, 'User uploaded an image of rice crop for diagnosis', '2025-07-14 06:21:00'),
(11, 11, 3, 'User performed a diagnosis on a rice crop image', '2025-07-14 06:21:00'),
(12, 12, 4, 'User logged out of the system', '2025-07-14 06:21:00'),
(13, 13, 1, 'User logged in to the system', '2025-07-14 06:21:00'),
(14, 14, 2, 'User uploaded an image of rice crop for diagnosis', '2025-07-14 06:21:00'),
(15, 11, 3, 'User performed a diagnosis on a rice crop image', '2025-07-14 06:21:00'),
(16, 16, 4, 'User logged out of the system', '2025-07-14 06:21:00'),
(17, 17, 1, 'User logged in to the system', '2025-07-14 06:21:00'),
(18, 18, 2, 'User uploaded an image of rice crop for diagnosis', '2025-07-14 06:21:00'),
(19, 18, 3, 'User performed a diagnosis on a rice crop image', '2025-07-14 06:21:00'),
(20, 20, 4, 'User logged out of the system', '2025-07-14 06:21:00'),
(21, 15, 1, 'Admin logged in to the system', '2025-07-14 06:21:00'),
(22, 22, 5, 'User registered a new account', '2025-07-14 06:21:00'),
(23, 23, 6, 'User updated their profile information', '2025-07-14 06:21:00'),
(24, 24, 7, 'User changed their account password', '2025-07-14 06:21:00'),
(25, 25, 8, 'Admin requested a password reset', '2025-07-14 06:21:00'),
(26, 26, 9, 'User viewed their past diagnosis results', '2025-07-14 06:21:00'),
(27, 27, 10, 'User downloaded a detailed report of the diagnosis', '2025-07-14 06:21:00'),
(28, 28, 11, 'User submitted feedback about the platform', '2025-07-14 06:21:00'),
(29, 29, 12, 'User sent a message through the platform', '2025-07-14 06:21:00'),
(30, 30, 2, 'User requested technical support', '2025-07-14 06:21:00'),
(31, 31, 1, 'User updated information about a specific disease', '2025-07-14 06:21:00'),
(32, 32, 9, 'User marked a disease or treatment as a favorite', '2025-07-14 06:21:00'),
(33, 32, 10, 'User shared their diagnosis results with others', '2025-07-14 06:21:00'),
(34, 34, 14, 'User generated a treatment recommendation based on diagnosis', '2025-07-14 06:21:00'),
(35, 35, 13, 'User scheduled a reminder for follow-up actions', '2025-07-14 06:21:00'),
(36, 36, 12, 'User synchronized their data across multiple devices', '2025-07-14 06:21:00'),
(37, 37, 10, 'User logged in to the system', '2025-07-14 06:21:00'),
(38, 38, 1, 'User uploaded an image of rice crop for diagnosis', '2025-07-14 06:21:00'),
(39, 39, 2, 'User performed a diagnosis on a rice crop image', '2025-07-14 06:21:00'),
(40, 40, 3, 'User logged out of the system', '2025-07-14 06:21:00'),
(41, 41, 4, 'User logged in to the system', '2025-07-14 06:21:00'),
(42, 42, 5, 'User uploaded an image of rice crop for diagnosis', '2025-07-14 06:21:00'),
(43, 43, 6, 'User performed a diagnosis on a rice crop image', '2025-07-14 06:21:00'),
(44, 44, 7, 'User logged out of the system', '2025-07-14 06:21:00'),
(45, 19, 8, 'Admin logged in to the system', '2025-07-14 06:21:00'),
(46, 46, 9, 'User uploaded an image of rice crop for diagnosis', '2025-07-14 06:21:00'),
(47, 47, 10, 'User performed a diagnosis on a rice crop image', '2025-07-14 06:21:00'),
(48, 48, 11, 'User logged out of the system', '2025-07-14 06:21:00'),
(49, 49, 12, 'User logged in to the system', '2025-07-14 06:21:00'),
(50, 50, 13, 'User uploaded an image of rice crop for diagnosis', '2025-07-14 06:21:00'),
(51, 1, 14, 'User performed a diagnosis on a rice crop image', '2025-07-14 06:21:00'),
(52, 33, 6, 'Admin logged out of the system', '2025-07-14 06:21:00'),
(53, 3, 7, 'User logged in to the system', '2025-07-14 06:21:00'),
(54, 4, 7, 'User uploaded an image of rice crop for diagnosis', '2025-07-14 06:21:00'),
(55, 5, 8, 'User performed a diagnosis on a rice crop image', '2025-07-14 06:21:00'),
(56, 6, 1, 'User logged out of the system', '2025-07-14 06:21:00'),
(57, 25, 2, 'Admin logged in to the system', '2025-07-14 06:21:00'),
(58, 8, 1, 'User uploaded an image of rice crop for diagnosis', '2025-07-14 06:21:00'),
(59, 9, 2, 'User performed a diagnosis on a rice crop image', '2025-07-14 06:21:00'),
(60, 19, 3, 'Admin logged out of the system', '2025-07-14 06:21:00'),
(61, 7, 14, 'Admin logged in to the system', '2025-07-15 01:17:10'),
(62, 1, 6, 'User updated profile: UpdatedName UpdatedLastName', '2025-07-15 01:37:07'),
(65, 1, 6, 'User updated profile: koby solis', '2025-07-15 03:37:20'),
(66, 1, 6, 'User updated profile: koby solis', '2025-07-15 03:37:20'),
(67, 2, 6, 'User updated profile: aljon alejado', '2025-07-15 03:39:40'),
(68, 2, 2, 'User updated profile: aljon alejado', '2025-07-15 03:39:40'),
(69, 67, 1, 'detail', '2025-07-15 03:53:47');

-- --------------------------------------------------------

--
-- Stand-in structure for view `show_diagnose_treatment`
-- (See below for the actual view)
--
CREATE TABLE `show_diagnose_treatment` (
`ID` int(11)
,`user_ID` int(11)
,`Image` varchar(255)
,`Disease_name` varchar(100)
,`Confidence` decimal(5,2)
,`treatment` text
,`Note` text
,`Date_diagnosed` timestamp
);

-- --------------------------------------------------------

--
-- Table structure for table `treatment`
--

CREATE TABLE `treatment` (
  `id` int(11) NOT NULL,
  `disease_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `treatment` text DEFAULT NULL,
  `prevention` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `treatment`
--

INSERT INTO `treatment` (`id`, `disease_id`, `description`, `treatment`, `prevention`) VALUES
(1, 1, 'Bacterial Leaf Blight', 'Use antibiotics like Streptomycin, Copper-based fungicides', 'Rotate crops and use resistant varieties'),
(2, 2, 'Brown Spot', 'Apply fungicides like Propiconazole, Azoxystrobin', 'Avoid excessive nitrogen fertilization, practice crop rotation'),
(3, 3, 'Healthy Rice Leaf', 'No treatment needed', 'Ensure proper irrigation and soil health'),
(4, 4, 'Leaf Blast', 'Apply fungicides like Tricyclazole, Propiconazole', 'Use resistant varieties and crop rotation'),
(5, 5, 'Leaf Scald', 'Use fungicides like Iprodione, Mancozeb', 'Ensure good drainage and avoid excessive moisture'),
(6, 6, 'Narrow Brown Leaf Spot', 'Apply fungicides like Tebuconazole, Chlorothalonil', 'Crop rotation and proper spacing of plants'),
(7, 7, 'Neck Blast', 'Use fungicides like Tricyclazole, Benomyl', 'Use resistant varieties and improve field drainage'),
(8, 8, 'Rice Hispa', 'Use insecticides like Chlorpyrifos, Cypermethrin', 'Monitor rice fields regularly and remove infested plants'),
(9, 9, 'Sheath Blight', 'Use fungicides like Validamycin, Mancozeb', 'Use resistant varieties and practice proper irrigation management'),
(10, 1, 'Bacterial Leaf Blight', 'Apply bactericides like Copper hydroxide', 'Rotate crops and use resistant varieties'),
(11, 2, 'Brown Spot', 'Use fungicides like Chlorothalonil', 'Practice early planting and avoid water stress'),
(12, 3, 'Healthy Rice Leaf', 'Maintain soil fertility', 'Proper irrigation and field management'),
(13, 4, 'Leaf Blast', 'Apply systemic fungicides like Azoxystrobin', 'Use resistant varieties and follow proper planting densities'),
(14, 5, 'Leaf Scald', 'Use fungicides like Hexaconazole', 'Keep fields well-drained and avoid high humidity'),
(15, 6, 'Narrow Brown Leaf Spot', 'Apply fungicides like Azoxystrobin, Chlorothalonil', 'Practice crop rotation and use resistant varieties'),
(16, 7, 'Neck Blast', 'Apply fungicides like Tricyclazole, Pyroclor', 'Ensure proper irrigation and use resistant varieties'),
(17, 8, 'Rice Hispa', 'Use biological control like Beauveria bassiana', 'Regular monitoring and use of pest-resistant rice varieties'),
(18, 9, 'Sheath Blight', 'Use fungicides like Pyraclostrobin, Mancozeb', 'Use resistant varieties and ensure proper irrigation'),
(19, 1, 'Bacterial Leaf Blight', 'Avoid overhead irrigation to minimize leaf wetness', 'Practice crop rotation with non-rice crops'),
(20, 2, 'Brown Spot', 'Use systemic fungicides like Propiconazole', 'Monitor for early symptoms and apply preventive treatments'),
(21, 3, 'Healthy Rice Leaf', 'N/A', 'Maintain healthy soil conditions and crop care'),
(22, 4, 'Leaf Blast', 'Apply fungicides like Pyraclostrobin, Azoxystrobin', 'Practice early planting and select resistant rice varieties'),
(23, 5, 'Leaf Scald', 'Apply fungicides like Iprodione, Propiconazole', 'Maintain proper field drainage and reduce plant stress'),
(24, 6, 'Narrow Brown Leaf Spot', 'Use fungicides like Tebuconazole, Azoxystrobin', 'Ensure adequate spacing between rice plants and practice crop rotation'),
(25, 7, 'Neck Blast', 'Use fungicides like Tricyclazole, Tebuconazole', 'Improve field drainage and select resistant rice varieties'),
(26, 8, 'Rice Hispa', 'Apply insecticides like Bifenthrin, Fipronil', 'Monitor rice fields for pests and apply treatments as needed'),
(27, 9, 'Sheath Blight', 'Apply fungicides like Propiconazole, Tebuconazole', 'Proper irrigation management and use of resistant varieties');

-- --------------------------------------------------------

--
-- Table structure for table `type`
--

CREATE TABLE `type` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `type`
--

INSERT INTO `type` (`id`, `name`) VALUES
(1, 'Admin'),
(2, 'Regular User');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `type_id` int(11) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `registered_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `first_name`, `last_name`, `type_id`, `email`, `password`, `phone_number`, `location`, `registered_date`) VALUES
(1, 'koby', 'solis', 2, 'john.doe1@example.com', 'password123', '1234567890', 'California', '2025-07-14 06:08:48'),
(2, 'aljon', 'alejado', 2, 'jane.doe1@example.com', 'password123', '0987654321', 'Nevada', '2025-07-14 06:08:48'),
(3, 'Alice', 'Smith', 2, 'alice.smith1@example.com', 'password123', '2345678901', 'Texas', '2025-07-14 06:08:48'),
(4, 'Bob', 'Johnson', 2, 'bob.johnson1@example.com', 'password123', '3456789012', 'Florida', '2025-07-14 06:08:48'),
(5, 'Charlie', 'Brown', 2, 'charlie.brown1@example.com', 'password123', '4567890123', 'New York', '2025-07-14 06:08:48'),
(6, 'Diana', 'Green', 2, 'diana.green1@example.com', 'password123', '5678901234', 'Ohio', '2025-07-14 06:08:48'),
(7, 'Eve', 'White', 1, 'eve.white1@example.com', 'password123', '6789012345', 'Illinois', '2025-07-14 06:08:48'),
(8, 'Frank', 'Harris', 2, 'frank.harris1@example.com', 'password123', '7890123456', 'Michigan', '2025-07-14 06:08:48'),
(9, 'Grace', 'Clark', 2, 'grace.clark1@example.com', 'password123', '8901234567', 'Arizona', '2025-07-14 06:08:48'),
(10, 'Henry', 'Lewis', 2, 'henry.lewis1@example.com', 'password123', '9012345678', 'Washington', '2025-07-14 06:08:48'),
(11, 'Ivy', 'Walker', 2, 'ivy.walker1@example.com', 'password123', '0123456789', 'Oregon', '2025-07-14 06:08:48'),
(12, 'Jack', 'Allen', 2, 'jack.allen1@example.com', 'password123', '1234509876', 'Utah', '2025-07-14 06:08:48'),
(13, 'Kim', 'Young', 2, 'kim.young1@example.com', 'password123', '2345612345', 'Colorado', '2025-07-14 06:08:48'),
(14, 'Liam', 'King', 2, 'liam.king1@example.com', 'password123', '3456723456', 'Indiana', '2025-07-14 06:08:48'),
(15, 'Megan', 'Scott', 1, 'megan.scott1@example.com', 'password123', '4567834567', 'Missouri', '2025-07-14 06:08:48'),
(16, 'Nathan', 'Adams', 2, 'nathan.adams1@example.com', 'password123', '5678945678', 'Georgia', '2025-07-14 06:08:48'),
(17, 'Olivia', 'Baker', 2, 'olivia.baker1@example.com', 'password123', '6789056789', 'Virginia', '2025-07-14 06:08:48'),
(18, 'Paul', 'Gonzalez', 2, 'paul.gonzalez1@example.com', 'password123', '7890167890', 'North Carolina', '2025-07-14 06:08:48'),
(19, 'Quinn', 'Nelson', 1, 'quinn.nelson1@example.com', 'password123', '8901278901', 'Pennsylvania', '2025-07-14 06:08:48'),
(20, 'Rachel', 'Carter', 2, 'rachel.carter1@example.com', 'password123', '9012389012', 'Kentucky', '2025-07-14 06:08:48'),
(21, 'Samuel', 'Mitchell', 2, 'samuel.mitchell1@example.com', 'password123', '0123490123', 'Tennessee', '2025-07-14 06:08:48'),
(22, 'Tina', 'Perez', 2, 'tina.perez1@example.com', 'password123', '1234501234', 'North Dakota', '2025-07-14 06:08:48'),
(23, 'Ursula', 'Roberts', 2, 'ursula.roberts1@example.com', 'password123', '2345612345', 'Alabama', '2025-07-14 06:08:48'),
(24, 'Victor', 'Evans', 2, 'victor.evans1@example.com', 'password123', '3456723456', 'Wisconsin', '2025-07-14 06:08:48'),
(25, 'Wendy', 'Turner', 1, 'wendy.turner1@example.com', 'password123', '4567834567', 'Minnesota', '2025-07-14 06:08:48'),
(26, 'Xander', 'Collins', 2, 'xander.collins1@example.com', 'password123', '5678945678', 'Iowa', '2025-07-14 06:08:48'),
(27, 'Yara', 'Murphy', 2, 'yara.murphy1@example.com', 'password123', '6789056789', 'New Jersey', '2025-07-14 06:08:48'),
(28, 'Zach', 'Bennett', 2, 'zach.bennett1@example.com', 'password123', '7890167890', 'South Carolina', '2025-07-14 06:08:48'),
(29, 'Anna', 'Foster', 2, 'anna.foster1@example.com', 'password123', '8901278901', 'Louisiana', '2025-07-14 06:08:48'),
(30, 'Ben', 'Simmons', 2, 'ben.simmons1@example.com', 'password123', '9012389012', 'Maryland', '2025-07-14 06:08:48'),
(31, 'Cindy', 'Wright', 2, 'cindy.wright1@example.com', 'password123', '0123490123', 'Delaware', '2025-07-14 06:08:48'),
(32, 'Dan', 'Griffin', 2, 'dan.griffin1@example.com', 'password123', '1234501234', 'Montana', '2025-07-14 06:08:48'),
(33, 'Eva', 'Morris', 1, 'eva.morris1@example.com', 'password123', '2345612345', 'Hawaii', '2025-07-14 06:08:48'),
(34, 'Felix', 'Russell', 2, 'felix.russell1@example.com', 'password123', '3456723456', 'Maine', '2025-07-14 06:08:48'),
(35, 'Gloria', 'Diaz', 2, 'gloria.diaz1@example.com', 'password123', '4567834567', 'Nebraska', '2025-07-14 06:08:48'),
(36, 'Harry', 'Anderson', 2, 'harry.anderson1@example.com', 'password123', '5678945678', 'Alaska', '2025-07-14 06:08:48'),
(37, 'Irene', 'Taylor', 2, 'irene.taylor1@example.com', 'password123', '6789056789', 'Kansas', '2025-07-14 06:08:48'),
(38, 'Jared', 'Wilson', 2, 'jared.wilson1@example.com', 'password123', '7890167890', 'Wyoming', '2025-07-14 06:08:48'),
(39, 'Kara', 'Hughes', 2, 'kara.hughes1@example.com', 'password123', '8901278901', 'Oklahoma', '2025-07-14 06:08:48'),
(40, 'Luke', 'King', 2, 'luke.king1@example.com', 'password123', '9012389012', 'Rhode Island', '2025-07-14 06:08:48'),
(41, 'Monica', 'Long', 2, 'monica.long1@example.com', 'password123', '0123490123', 'Connecticut', '2025-07-14 06:08:48'),
(42, 'Nora', 'Shaw', 2, 'nora.shaw1@example.com', 'password123', '1234501234', 'Arkansas', '2025-07-14 06:08:48'),
(43, 'Oscar', 'Bates', 2, 'oscar.bates1@example.com', 'password123', '2345612345', 'West Virginia', '2025-07-14 06:08:48'),
(44, 'Penny', 'Howard', 2, 'penny.howard1@example.com', 'password123', '3456723456', 'Idaho', '2025-07-14 06:08:48'),
(45, 'Quincy', 'Douglas', 2, 'quincy.douglas1@example.com', 'password123', '4567834567', 'South Dakota', '2025-07-14 06:08:48'),
(46, 'Rachel', 'Mason', 2, 'rachel.mason1@example.com', 'password123', '5678945678', 'Mississippi', '2025-07-14 06:08:48'),
(47, 'Ava', 'Davis', 2, 'ava.davis@example.com', 'password123', '2345678901', 'California', '2025-07-14 06:08:48'),
(48, 'Mason', 'Taylor', 2, 'mason.taylor@example.com', 'password123', '3456789012', 'Texas', '2025-07-14 06:08:48'),
(49, 'Lily', 'Martinez', 2, 'lily.martinez@example.com', 'password123', '4567890123', 'Florida', '2025-07-14 06:08:48'),
(50, 'Ethan', 'Lopez', 2, 'ethan.lopez@example.com', 'password123', '5678901234', 'Georgia', '2025-07-14 06:08:48'),
(67, 'sozun', 'Doe', 2, 'com', 'password123', '1234567890', 'California', '2025-07-15 03:53:47');

--
-- Triggers `user`
--
DELIMITER $$
CREATE TRIGGER `log_user` AFTER INSERT ON `user` FOR EACH ROW begin
 insert into logs (user_id, action_id, detail)
 values (NEW.id, 1, 'detail');
end
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `log_user_profile_update` AFTER UPDATE ON `user` FOR EACH ROW BEGIN
    INSERT INTO logs (user_id, action_id, detail, log_date)
    VALUES (NEW.id, 6, CONCAT('User updated profile: ', NEW.first_name, ' ', NEW.last_name), NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `log_user_update` AFTER UPDATE ON `user` FOR EACH ROW begin
    insert into logs (user_id, action_id, detail, log_date)
    values (NEW.id, 2, CONCAT('User updated profile: ', NEW.first_name, ' ', NEW.last_name), NOW());
end
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `prevent_duplicate_email` BEFORE INSERT ON `user` FOR EACH ROW BEGIN
    IF EXISTS (SELECT 1 FROM user WHERE email = NEW.email) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Duplicate email is not allowed.';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `validate_phone_number_format` BEFORE INSERT ON `user` FOR EACH ROW BEGIN
    
    IF NOT NEW.phone_number REGEXP '^[0-9]{10}$' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid phone number format. It must be 10 digits long.';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_confidence`
-- (See below for the actual view)
--
CREATE TABLE `view_confidence` (
`user_id` int(11)
,`image_path` varchar(255)
,`name` varchar(100)
,`description` text
,`treatment` text
,`confidence` decimal(5,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_feedbacks`
-- (See below for the actual view)
--
CREATE TABLE `view_feedbacks` (
`id` int(11)
,`user_name` varchar(102)
,`comments` text
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_users`
-- (See below for the actual view)
--
CREATE TABLE `view_users` (
`id` int(11)
,`Users` varchar(102)
,`User type` varchar(50)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `view_user_logs`
-- (See below for the actual view)
--
CREATE TABLE `view_user_logs` (
`id` int(11)
,`user_name` varchar(102)
,`user_type` varchar(50)
,`activity_logs` varchar(100)
,`log_date` timestamp
);

-- --------------------------------------------------------

--
-- Structure for view `how_to`
--
DROP TABLE IF EXISTS `how_to`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `how_to`  AS SELECT `d`.`id` AS `id`, `d`.`name` AS `disease_name`, `d`.`cause` AS `cause`, `t`.`treatment` AS `treatment`, `t`.`prevention` AS `prevention` FROM (`diseases` `d` join `treatment` `t` on(`t`.`disease_id` = `d`.`id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `show_diagnose_treatment`
--
DROP TABLE IF EXISTS `show_diagnose_treatment`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `show_diagnose_treatment`  AS SELECT `d`.`id` AS `ID`, `d`.`user_id` AS `user_ID`, `d`.`image_path` AS `Image`, `di`.`name` AS `Disease_name`, `d`.`confidence` AS `Confidence`, `t`.`treatment` AS `treatment`, `d`.`notes` AS `Note`, `d`.`date_diagnosed` AS `Date_diagnosed` FROM ((`diagnosis` `d` join `diseases` `di` on(`di`.`id` = `d`.`disease_id`)) join `treatment` `t` on(`t`.`disease_id` = `di`.`id`)) GROUP BY `d`.`id` ;

-- --------------------------------------------------------

--
-- Structure for view `view_confidence`
--
DROP TABLE IF EXISTS `view_confidence`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_confidence`  AS SELECT `d`.`user_id` AS `user_id`, `d`.`image_path` AS `image_path`, `di`.`name` AS `name`, `t`.`description` AS `description`, `t`.`treatment` AS `treatment`, `d`.`confidence` AS `confidence` FROM ((`diagnosis` `d` join `diseases` `di` on(`di`.`id` = `d`.`disease_id`)) join `treatment` `t` on(`t`.`disease_id` = `di`.`id`)) GROUP BY `d`.`id` ORDER BY `d`.`id` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `view_feedbacks`
--
DROP TABLE IF EXISTS `view_feedbacks`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_feedbacks`  AS SELECT `u`.`id` AS `id`, concat(`u`.`last_name`,', ',`u`.`first_name`) AS `user_name`, `f`.`comments` AS `comments` FROM (`user` `u` join `feedback` `f` on(`f`.`user_id` = `u`.`id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `view_users`
--
DROP TABLE IF EXISTS `view_users`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_users`  AS SELECT `u`.`id` AS `id`, concat(`u`.`last_name`,', ',`u`.`first_name`) AS `Users`, `t`.`name` AS `User type` FROM (`user` `u` join `type` `t` on(`t`.`id` = `u`.`type_id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `view_user_logs`
--
DROP TABLE IF EXISTS `view_user_logs`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_user_logs`  AS SELECT `u`.`id` AS `id`, concat(`u`.`last_name`,', ',`u`.`first_name`) AS `user_name`, `t`.`name` AS `user_type`, `a`.`name` AS `activity_logs`, `l`.`log_date` AS `log_date` FROM (((`user` `u` join `type` `t` on(`t`.`id` = `u`.`type_id`)) join `logs` `l` on(`l`.`user_id` = `u`.`id`)) join `action` `a` on(`a`.`id` = `l`.`action_id`)) ORDER BY `u`.`id` ASC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `action`
--
ALTER TABLE `action`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `diagnosis`
--
ALTER TABLE `diagnosis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `disease_id` (`disease_id`);

--
-- Indexes for table `diseases`
--
ALTER TABLE `diseases`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `action_id` (`action_id`);

--
-- Indexes for table `treatment`
--
ALTER TABLE `treatment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `disease_id` (`disease_id`);

--
-- Indexes for table `type`
--
ALTER TABLE `type`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `type_id` (`type_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `action`
--
ALTER TABLE `action`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `diagnosis`
--
ALTER TABLE `diagnosis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `diseases`
--
ALTER TABLE `diseases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `treatment`
--
ALTER TABLE `treatment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `type`
--
ALTER TABLE `type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `diagnosis`
--
ALTER TABLE `diagnosis`
  ADD CONSTRAINT `diagnosis_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `diagnosis_ibfk_2` FOREIGN KEY (`disease_id`) REFERENCES `diseases` (`id`);

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `logs_ibfk_2` FOREIGN KEY (`action_id`) REFERENCES `action` (`id`);

--
-- Constraints for table `treatment`
--
ALTER TABLE `treatment`
  ADD CONSTRAINT `treatment_ibfk_1` FOREIGN KEY (`disease_id`) REFERENCES `diseases` (`id`);

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `type` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
