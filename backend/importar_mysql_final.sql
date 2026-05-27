-- Base de datos Sistema Veterinario
CREATE DATABASE IF NOT EXISTS veterinaria_db;
USE veterinaria_db;
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (`id_appointment` integer NOT NULL PRIMARY KEY AUTO_INCREMENT, `date` datetime NOT NULL, `reason` varchar(255) NOT NULL, `status` varchar(20) NOT NULL, `created_at` datetime NOT NULL, `pet_id` integer NOT NULL REFERENCES pets (`id_pet`) , `veterinarian_id` integer NOT NULL REFERENCES veterinarians (`id_veterinarian`) );

DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (`id_client` integer NOT NULL PRIMARY KEY AUTO_INCREMENT, `name` varchar(100) NOT NULL, `phone` varchar(20) NOT NULL, `email` varchar(254) NOT NULL UNIQUE, `address` varchar(255) NOT NULL, `created_at` datetime NOT NULL, `updated_at` datetime NOT NULL);

INSERT INTO `clients` (`id_client`, `name`, `phone`, `email`, `address`, `created_at`, `updated_at`) VALUES (1, 'Luis Pech', '9991112334', 'LuisPech77@gmail.com', 'c.18 x 333 y 334', '2026-03-27 22:39:31.560143', '2026-03-27 22:39:31.560197');

DROP TABLE IF EXISTS `medical_records`;
CREATE TABLE `medical_records` (`id_record` integer NOT NULL PRIMARY KEY AUTO_INCREMENT, `date` date NOT NULL, `diagnosis` varchar(255) NOT NULL, `treatment` varchar(255) NOT NULL, `notes` varchar(255) NOT NULL, `pet_id` integer NOT NULL REFERENCES pets (`id_pet`) , `veterinarian_id` integer NULL REFERENCES veterinarians (`id_veterinarian`) );

DROP TABLE IF EXISTS `pets`;
CREATE TABLE `pets` (`id_pet` integer NOT NULL PRIMARY KEY AUTO_INCREMENT, `name` varchar(100) NOT NULL, `species` varchar(20) NOT NULL, `breed` varchar(100) NOT NULL, `age` integer NOT NULL, `created_at` datetime NOT NULL, `client_id` integer NOT NULL REFERENCES clients (`id_client`) );

INSERT INTO `pets` (`id_pet`, `name`, `species`, `breed`, `age`, `created_at`, `client_id`) VALUES (1, 'Napa', 'dog', 'Malix', 20, '2026-03-27 22:40:05.918116', 1);

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (`id` integer NOT NULL PRIMARY KEY AUTO_INCREMENT, `password` varchar(128) NOT NULL, `last_login` datetime NULL, `is_superuser` bool NOT NULL, `username` varchar(150) NOT NULL UNIQUE, `first_name` varchar(150) NOT NULL, `last_name` varchar(150) NOT NULL, `email` varchar(254) NOT NULL, `is_staff` bool NOT NULL, `is_active` bool NOT NULL, `date_joined` datetime NOT NULL, `role` varchar(20) NOT NULL, `phone` varchar(17) NOT NULL);

INSERT INTO `users` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`, `role`, `phone`) VALUES (1, 'pbkdf2_sha256$1200000$A60OylOT3LwkH4r4UG1I1h$rkB/wMT4wQY327DIEtYqsAJi8OpagArv0gFz13Uni3o=', '2026-03-20 17:48:07.280541', 1, 'admin1', '', '', 'adminhappypaw@gmail.com', 1, 1, '2026-03-17 19:03:29', 'admin', '');
INSERT INTO `users` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`, `role`, `phone`) VALUES (5, 'pbkdf2_sha256$1200000$As3gj3hKm1KuO9FpIrQa2k$f+vBMP85viiYKJp/ICtHR2ZMKicE6ETdj+djT4OY0QQ=', NULL, 0, 'Carlos', 'Carlos', 'Domador', 'gabrieleec1704@gmail.com', 0, 1, '2026-03-20 17:49:42', 'veterinarian', '');
INSERT INTO `users` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`, `role`, `phone`) VALUES (6, 'pbkdf2_sha256$1200000$CXBKS9LzE3EkhcOUthhBx1$Hl0EUAjhXcf3Lf73UwEqGxKf0AVdW1pyWJd1b1cRKLA=', NULL, 0, 'carlos', 'Carlos', 'López', 'carlos@veterinaria.com', 0, 1, '2026-03-20 17:55:55.503644', 'veterinarian', '');
INSERT INTO `users` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`, `role`, `phone`) VALUES (7, 'pbkdf2_sha256$1200000$L8zJBtHLEULJEYbW9sWiAr$5Cw+feoEgirgRHDNa49h3k9O8RAZNX+VdAtoci8hD7g=', NULL, 1, 'jessi', 'Jessi', 'Chi', 'gabrieleec1704@gmail.com', 1, 1, '2026-03-25 22:11:22', 'veterinarian', '');

DROP TABLE IF EXISTS `users_groups`;
CREATE TABLE `users_groups` (`id` integer NOT NULL PRIMARY KEY AUTO_INCREMENT, `user_id` bigint NOT NULL REFERENCES users (`id`) , `group_id` integer NOT NULL REFERENCES auth_group (`id`) );

DROP TABLE IF EXISTS `users_user_permissions`;
CREATE TABLE `users_user_permissions` (`id` integer NOT NULL PRIMARY KEY AUTO_INCREMENT, `user_id` bigint NOT NULL REFERENCES users (`id`) , `permission_id` integer NOT NULL REFERENCES auth_permission (`id`) );

INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (45, 1, 1);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (46, 1, 2);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (47, 1, 3);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (48, 1, 4);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (49, 1, 5);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (50, 1, 6);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (51, 1, 7);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (52, 1, 8);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (53, 1, 9);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (54, 1, 10);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (55, 1, 11);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (56, 1, 12);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (57, 1, 13);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (58, 1, 14);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (59, 1, 15);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (60, 1, 16);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (61, 1, 17);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (62, 1, 18);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (63, 1, 19);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (64, 1, 20);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (65, 1, 21);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (66, 1, 22);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (67, 1, 23);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (68, 1, 24);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (69, 1, 25);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (70, 1, 26);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (71, 1, 27);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (72, 1, 28);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (73, 1, 29);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (74, 1, 30);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (75, 1, 31);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (76, 1, 32);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (77, 1, 33);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (78, 1, 34);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (79, 1, 35);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (80, 1, 36);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (81, 1, 37);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (82, 1, 38);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (83, 1, 39);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (84, 1, 40);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (85, 1, 41);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (86, 1, 42);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (87, 1, 43);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (88, 1, 44);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (89, 7, 1);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (90, 7, 2);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (91, 7, 3);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (92, 7, 4);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (93, 7, 5);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (94, 7, 6);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (95, 7, 7);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (96, 7, 8);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (97, 7, 9);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (98, 7, 10);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (99, 7, 11);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (100, 7, 12);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (101, 7, 13);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (102, 7, 14);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (103, 7, 15);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (104, 7, 16);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (105, 7, 17);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (106, 7, 18);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (107, 7, 19);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (108, 7, 20);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (109, 7, 21);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (110, 7, 22);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (111, 7, 23);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (112, 7, 24);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (113, 7, 25);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (114, 7, 26);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (115, 7, 27);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (116, 7, 28);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (117, 7, 29);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (118, 7, 30);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (119, 7, 31);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (120, 7, 32);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (121, 7, 33);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (122, 7, 34);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (123, 7, 35);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (124, 7, 36);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (125, 7, 37);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (126, 7, 38);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (127, 7, 39);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (128, 7, 40);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (129, 7, 41);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (130, 7, 42);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (131, 7, 43);
INSERT INTO `users_user_permissions` (`id`, `user_id`, `permission_id`) VALUES (132, 7, 44);

DROP TABLE IF EXISTS `veterinarians`;
CREATE TABLE `veterinarians` (`id_veterinarian` integer NOT NULL PRIMARY KEY AUTO_INCREMENT, `name` varchar(100) NOT NULL, `cedula` varchar(20) NOT NULL UNIQUE, `phone` varchar(20) NOT NULL, `email` varchar(254) NOT NULL UNIQUE, `specialty` varchar(100) NOT NULL, `user_id` bigint NOT NULL UNIQUE REFERENCES users (`id`) );

SET FOREIGN_KEY_CHECKS=1;