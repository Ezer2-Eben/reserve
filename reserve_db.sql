-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : ven. 13 fév. 2026 à 19:17
-- Version du serveur : 8.4.7
-- Version de PHP : 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `reserve_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `alerte`
--

DROP TABLE IF EXISTS `alerte`;
CREATE TABLE IF NOT EXISTS `alerte` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `niveau` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reserve_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK59hmgpl27m32myak235mstux7` (`reserve_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `document`
--

DROP TABLE IF EXISTS `document`;
CREATE TABLE IF NOT EXISTS `document` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `chemin_fichier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_upload` datetime(6) DEFAULT NULL,
  `hash_fichier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nom_fichier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nom_fichier_original` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `taille_fichier` bigint DEFAULT NULL,
  `type_fichier` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reserve_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKjr66enoo0pr2y3wemumfe3cdp` (`reserve_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `historique_juridique`
--

DROP TABLE IF EXISTS `historique_juridique`;
CREATE TABLE IF NOT EXISTS `historique_juridique` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `commentaire` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_acte` date DEFAULT NULL,
  `nature_acte` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reserve_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKeincsy9vipdk69kjwjjms2mu9` (`reserve_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `projet`
--

DROP TABLE IF EXISTS `projet`;
CREATE TABLE IF NOT EXISTS `projet` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `financement` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maitre_ouvrage` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nom_projet` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reserve_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKm8xynj2vmy52yxwlwmi4a1wuo` (`reserve_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reserve`
--

DROP TABLE IF EXISTS `reserve`;
CREATE TABLE IF NOT EXISTS `reserve` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `localisation` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `longitude` double DEFAULT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `statut` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `superficie` double NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zone` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKqkufk3lkngup2yydrosnughoh` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

DROP TABLE IF EXISTS `utilisateur`;
CREATE TABLE IF NOT EXISTS `utilisateur` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('ADMIN','USER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKkq7nt5wyq9v9lpcpgxag2f24a` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`id`, `password`, `role`, `username`) VALUES
(1, '$2a$10$j99WhTk5zy1L4LJ9DQPqYe7yTclKZLhN/VSLLGLfwiBJsptiDwW4q', 'ADMIN', 'admin');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `alerte`
--
ALTER TABLE `alerte`
  ADD CONSTRAINT `FK59hmgpl27m32myak235mstux7` FOREIGN KEY (`reserve_id`) REFERENCES `reserve` (`id`);

--
-- Contraintes pour la table `document`
--
ALTER TABLE `document`
  ADD CONSTRAINT `FKjr66enoo0pr2y3wemumfe3cdp` FOREIGN KEY (`reserve_id`) REFERENCES `reserve` (`id`);

--
-- Contraintes pour la table `historique_juridique`
--
ALTER TABLE `historique_juridique`
  ADD CONSTRAINT `FKeincsy9vipdk69kjwjjms2mu9` FOREIGN KEY (`reserve_id`) REFERENCES `reserve` (`id`);

--
-- Contraintes pour la table `projet`
--
ALTER TABLE `projet`
  ADD CONSTRAINT `FKm8xynj2vmy52yxwlwmi4a1wuo` FOREIGN KEY (`reserve_id`) REFERENCES `reserve` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
