-- DROP DATABASE IF EXISTS inside;
-- CREATE DATABASE inside;
-- USE inside;

CREATE TABLE IF NOT EXISTS `roles` (
  `id`  INT NOT NULL,
  `libelle` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1;

INSERT INTO `roles` (`id`, `libelle`) VALUES
(1, 'Consultant'),
(2, 'Structure'),
(3, 'Admin'),
(4, 'Super Admin');

CREATE TABLE IF NOT EXISTS `users` (
  `id` MEDIUMINT NOT NULL,
  `nom` varchar(50) CHARACTER SET utf8 NOT NULL,
  `prenom` varchar(50) CHARACTER SET utf8 NOT NULL,
  `email` varchar(50) CHARACTER SET utf8 NOT NULL,
  `civilite` varchar(1) CHARACTER SET utf8 NOT NULL DEFAULT 'H',
  `dateNaissance` varchar(30) CHARACTER SET utf8 NOT NULL,
  `pwd` varchar(80) CHARACTER SET utf8 DEFAULT NULL,
  `hasRtt` TINYINT NOT NULL DEFAULT 1,
  -- `cp` FLOAT NOT NULL DEFAULT 0,
  -- `cp_ant` FLOAT NOT NULL DEFAULT 0,
  -- `rtt` FLOAT NOT NULL DEFAULT 0,
  `role` INT NOT NULL DEFAULT 1,
  `etat` INT NOT NULL DEFAULT 1,
  `admin` MEDIUMINT NOT NULL DEFAULT 1,
  `creation` timestamp NOT NULL DEFAULT current_timestamp,
  `last_connection` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `debutActivite` DATE NULL,
  `finActivite` DATE NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT FOREIGN KEY (`role` ) REFERENCES `roles` (`id` ) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT FOREIGN KEY (`admin` ) REFERENCES `users` (`id` ) ON DELETE NO ACTION ON UPDATE CASCADE,
  INDEX `_idx` (`role` ASC),
  INDEX `_civilitex` (`civilite` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `history` (
  `date` timestamp NOT NULL DEFAULT current_timestamp,
  `ip` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci NULL,
  `user` MEDIUMINT NOT NULL,
  `log` varchar(2000) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  CONSTRAINT FOREIGN KEY (`user` ) REFERENCES `users` (`id` ) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB  DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `conges_motifs` (
  `id` varchar(10) CHARACTER SET utf8 NOT NULL,
  `libelle` varchar(100) CHARACTER SET utf8 NOT NULL,
  `shortlibelle` varchar(50) CHARACTER SET utf8,
  `min` INT NOT NULL DEFAULT 0,
  `ordre` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `conges_motifs` (`id`, `libelle`, `shortlibelle`, `min`, `ordre`) VALUES
('CP', 'CP', null, 0, 1),
-- ('RCE', 'RC employeur', 'RTT Empl.', 2),
('RTT', 'RTT', null, -2, 3),
('CP_ANT', 'CP Anticipé', 'CP ant.', 0, 4),
('CS', 'Sans solde', null, 0, 5),
('MA', 'Maladie', null, 0, 6),
('ENF', 'Enfant malade (3 jours par an)', 'Enfant malade', 0, 7),
('DEL', 'Délégation DP, CE', 0, 8),
('MAR', 'Mariage', null, 0, 9),
('NAI', 'Naissance (3 jours)', 'Naissance', 0, 10),
('PAT', 'Paternité (9 jours ouvrés)', 'Paternité', 0, 11),
('MAT', 'Maternité', null, 0, 12),
('DEM', 'Déménagement (1 jour par an)', 'Déménagement', 0, 13),
('PAO', 'Congés pathologique', null, 0, 14),
('DC', 'Décès ascendants, descendants, collatéraux', 'Décès', 0, 15),
('REC', 'Récupération', 'Récup.', 0, 16);
-- ('AU', 'Autres (à justifier)', 'Autres', 0, 15);

CREATE TABLE IF NOT EXISTS `conges_compteurs` (
  `user` MEDIUMINT NOT NULL,
  `motif` varchar(10) CHARACTER SET utf8 NOT NULL,
  `compteur` FLOAT NOT NULL DEFAULT 0,
  PRIMARY KEY (`user`, `motif`),
  CONSTRAINT FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `_userx` (`user` ASC),
  INDEX `_motifx` (`motif` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `conges_etat` (
  `id` MEDIUMINT NOT NULL AUTO_INCREMENT,
  `libelle` varchar(50) CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `conges` (
  `id` MEDIUMINT NOT NULL AUTO_INCREMENT,
  `user` MEDIUMINT NOT NULL,
  `debut` DATETIME NOT NULL,
  `fin` DATETIME NOT NULL,
  `duree` FLOAT NOT NULL DEFAULT 0,
  `motif` varchar(10) CHARACTER SET utf8 NOT NULL,
  `etat` MEDIUMINT NOT NULL DEFAULT 1,
  `justification` varchar(2000) CHARACTER SET utf8,
  `type` varchar(5) CHARACTER SET utf8 NOT NULL DEFAULT 'N',
  `refus` varchar(2000) CHARACTER SET utf8,
  `creation` timestamp NOT NULL DEFAULT current_timestamp,
  `last_modif` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT FOREIGN KEY (`etat`) REFERENCES `conges_etat` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  INDEX `_motifx` (`motif` ASC),
  INDEX `_typex` (`type` ASC),
  INDEX `_etatx` (`etat` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `conges_validation` (
  `conges` MEDIUMINT NOT NULL,
  `etat` MEDIUMINT NOT NULL,
  `user` MEDIUMINT NOT NULL,
  `justification` varchar(1000) CHARACTER SET utf8,
  `creation` timestamp NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`conges`, `etat`, `user`),
  CONSTRAINT FOREIGN KEY (`conges`) REFERENCES `conges` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT FOREIGN KEY (`etat`) REFERENCES `conges_etat` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `JoursFeries` (
  `jour` DATE NOT NULL,
  `libelle` varchar(45) CHARACTER SET utf8 NOT NULL,
  `chome` SMALLINT(6),
  PRIMARY KEY (`jour`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

INSERT INTO `users` (`id`,`nom`, `prenom`, `email`, `dateNaissance`, `pwd`, `role`) VALUES
(0,'Admin', 'Admin', 'admin@inside-groupe.com', '1982-11-29','d11ca905f1135973759e4545df3b041d18b9c46b',4),
(999999,'Tous', '', 'all@inside-groupe.com', '1982-11-29','d11ca905f1135973759e4545df3b041d18b9c46b',2);

INSERT INTO `conges_etat` (`id`, `libelle`) VALUES
(1, 'Attente de validation'),
(2, 'Acceptés'),
(3, 'Refusés');

INSERT INTO `conges_compteurs` (`user`, `motif`, `compteur`) VALUES
(0, 'CP', 999),
(0, 'CP_ANT', 999),
(0, 'RTT', 999),
(999999, 'CP', 999),
(999999, 'CP_ANT', 999),
(999999, 'RTT', 999);

CREATE TABLE IF NOT EXISTS `activite` (
  `user` MEDIUMINT NOT NULL,
  `mois` DATE NOT NULL,
  `etat` MEDIUMINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`user`, `mois`),
  CONSTRAINT FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `_etatx` (`etat` ASC),
  INDEX `_moisx` (`mois` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `activite_jour` (
  `user` MEDIUMINT NOT NULL,
  `jour` DATETIME NOT NULL,
  `type` varchar(10) CHARACTER SET utf8 NOT NULL,
  `information` varchar(2000) CHARACTER SET utf8,
  `heuresSup` FLOAT NOT NULL DEFAULT 0,
  `heuresNuit` FLOAT NOT NULL DEFAULT 0,
  `heuresAstreinte` FLOAT NOT NULL DEFAULT 0,
  `heuresInt` FLOAT NOT NULL DEFAULT 0,
  PRIMARY KEY (`user`, `jour`),
  CONSTRAINT FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `_typex` (`type` ASC),
  INDEX `_jourx` (`jour` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ALTER TABLE `users` ADD COLUMN `last_connection` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  AFTER `creation` ;
-- ALTER TABLE `conges` ADD COLUMN `last_modif` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP  AFTER `creation` ;
