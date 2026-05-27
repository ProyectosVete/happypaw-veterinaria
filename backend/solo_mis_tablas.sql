-- Base de datos Sistema Veterinario
CREATE DATABASE IF NOT EXISTS veterinaria_db;
USE veterinaria_db;
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (`id_client` integer NOT NULL PRIMARY KEY AUTO_INCREMENT, `name` varchar(100) NOT NULL, `phone` varchar(20) NOT NULL, `email` varchar(254) NOT NULL UNIQUE, `address` varchar(255) NOT NULL, `created_at` datetime NOT NULL, `updated_at` datetime NOT NULL);

INSERT INTO `clients` (`id_client`, `name`, `phone`, `email`, `address`, `created_at`, `updated_at`) VALUES (1, 'Luis Pech', '9991112334', 'LuisPech77@gmail.com', 'c.18 x 333 y 334', '2026-03-27 22:39:31.560143', '2026-03-27 22:39:31.560197');

DROP TABLE IF EXISTS `pets`;
CREATE TABLE `pets` (`id_pet` integer NOT NULL PRIMARY KEY AUTO_INCREMENT, `name` varchar(100) NOT NULL, `species` varchar(20) NOT NULL, `breed` varchar(100) NOT NULL, `age` integer NOT NULL, `created_at` datetime NOT NULL, `client_id` integer NOT NULL REFERENCES `clients` (`id_client`) DEFERRABLE INITIALLY DEFERRED);

INSERT INTO `pets` (`id_pet`, `name`, `species`, `breed`, `age`, `created_at`, `client_id`) VALUES (1, 'Napa', 'dog', 'Malix', 20, '2026-03-27 22:40:05.918116', 1);

DROP TABLE IF EXISTS `veterinarians`;
CREATE TABLE `veterinarians` (`id_veterinarian` integer NOT NULL PRIMARY KEY AUTO_INCREMENT, `name` varchar(100) NOT NULL, `cedula` varchar(20) NOT NULL UNIQUE, `phone` varchar(20) NOT NULL, `email` varchar(254) NOT NULL UNIQUE, `specialty` varchar(100) NOT NULL, `user_id` bigint NOT NULL UNIQUE REFERENCES `users` (`id`) DEFERRABLE INITIALLY DEFERRED);

DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (`id_appointment` integer NOT NULL PRIMARY KEY AUTO_INCREMENT, `date` datetime NOT NULL, `reason` varchar(255) NOT NULL, `status` varchar(20) NOT NULL, `created_at` datetime NOT NULL, `pet_id` integer NOT NULL REFERENCES `pets` (`id_pet`) DEFERRABLE INITIALLY DEFERRED, `veterinarian_id` integer NOT NULL REFERENCES `veterinarians` (`id_veterinarian`) DEFERRABLE INITIALLY DEFERRED);

DROP TABLE IF EXISTS `medical_records`;
CREATE TABLE `medical_records` (`id_record` integer NOT NULL PRIMARY KEY AUTO_INCREMENT, `date` date NOT NULL, `diagnosis` varchar(255) NOT NULL, `treatment` varchar(255) NOT NULL, `notes` varchar(255) NOT NULL, `pet_id` integer NOT NULL REFERENCES `pets` (`id_pet`) DEFERRABLE INITIALLY DEFERRED, `veterinarian_id` integer NULL REFERENCES `veterinarians` (`id_veterinarian`) DEFERRABLE INITIALLY DEFERRED);

SET FOREIGN_KEY_CHECKS=1;