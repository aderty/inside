-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- Select AddConges(1, 'N', 'CP',STR_TO_DATE('12/12/2013', '%d/%m/%Y'), STR_TO_DATE('19/12/2013', '%d/%m/%Y'), '');
-- CALL AddConges(1, 'N', 'CP',STR_TO_DATE('29/10/2013', '%d/%m/%Y'), STR_TO_DATE('12/11/2013', '%d/%m/%Y'), '', @duree, @retour);
-- SELECT @duree, @retour;
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS InitCompteursUser; 
DELIMITER $$

CREATE PROCEDURE `InitCompteursUser` (user INT)
BEGIN

REPLACE INTO conges_compteurs(user, motif, compteur) VALUES (user, 'DEM', 1);
REPLACE INTO conges_compteurs(user, motif, compteur) VALUES (user, 'ENF', 3);
REPLACE INTO conges_compteurs(user, motif, compteur) VALUES (user, 'MAR', 4);
REPLACE INTO conges_compteurs(user, motif, compteur) VALUES (user, 'NAI', 3);
REPLACE INTO conges_compteurs(user, motif, compteur) VALUES (user, 'PAT', 9);

END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- Select AddConges(1, 'N', 'CP',STR_TO_DATE('12/12/2013', '%d/%m/%Y'), STR_TO_DATE('19/12/2013', '%d/%m/%Y'), '');
-- CALL AddConges(1, 'N', 'CP',STR_TO_DATE('29/10/2013', '%d/%m/%Y'), STR_TO_DATE('12/11/2013', '%d/%m/%Y'), '', @duree, @retour);
-- SELECT @duree, @retour;
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS AddCompteursUser; 
DELIMITER $$

CREATE PROCEDURE `AddCompteursUser` (user INT, cp FlOAT, cp_ant FlOAT,  rtt FlOAT)
BEGIN
INSERT INTO conges_compteurs(user, motif, compteur) VALUES
			(user, 'CP', cp);
INSERT INTO conges_compteurs(user, motif, compteur) VALUES
			(user, 'CP_ANT', cp_ant);
INSERT INTO conges_compteurs(user, motif, compteur) VALUES
			(user, 'RTT', rtt);

CALL InitCompteursUser(user);
END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- Select AddConges(1, 'N', 'CP',STR_TO_DATE('12/12/2013', '%d/%m/%Y'), STR_TO_DATE('19/12/2013', '%d/%m/%Y'), '');
-- CALL AddConges(1, 'N', 'CP',STR_TO_DATE('29/10/2013', '%d/%m/%Y'), STR_TO_DATE('12/11/2013', '%d/%m/%Y'), '', @duree, @retour);
-- SELECT @duree, @retour;
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS UpdateCompteursUser; 
DELIMITER $$

CREATE PROCEDURE `UpdateCompteursUser` (user INT, cp FlOAT, cp_ant FlOAT,  rtt FlOAT)
BEGIN

UPDATE conges_compteurs SET compteur = cp WHERE conges_compteurs.user = user AND motif = 'CP';
UPDATE conges_compteurs SET compteur = cp_ant WHERE conges_compteurs.user = user AND motif = 'CP_ANT';
UPDATE conges_compteurs SET compteur = rtt WHERE conges_compteurs.user = user AND motif = 'RTT';

END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- Select AddConges(1, 'N', 'CP',STR_TO_DATE('12/12/2013', '%d/%m/%Y'), STR_TO_DATE('19/12/2013', '%d/%m/%Y'), '');
-- CALL AddConges(1, 'N', 'CP',STR_TO_DATE('29/10/2013', '%d/%m/%Y'), STR_TO_DATE('12/11/2013', '%d/%m/%Y'), '', @duree, @retour);
-- SELECT @duree, @retour;
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS RazCompteurs; 
DELIMITER $$

CREATE PROCEDURE `RazCompteurs` ()
BEGIN

UPDATE  conges_compteurs as tab1 join users on tab1.user = users.id SET tab1.compteur = 1 WHERE tab1.motif = 'DEM'
and (users.finActivite is null or period_diff(current_timestamp, users.finActivite) < 0);
UPDATE  conges_compteurs as tab1 join users on tab1.user = users.id SET tab1.compteur = 3 WHERE tab1.motif = 'ENF'
and (users.finActivite is null or period_diff(current_timestamp, users.finActivite) < 0);
UPDATE  conges_compteurs as tab1 join users on tab1.user = users.id SET tab1.compteur = 4 WHERE tab1.motif = 'MAR'
and (users.finActivite is null or period_diff(current_timestamp, users.finActivite) < 0);
UPDATE  conges_compteurs as tab1 join users on tab1.user = users.id SET tab1.compteur = 3 WHERE tab1.motif = 'NAI'
and (users.finActivite is null or period_diff(current_timestamp, users.finActivite) < 0);
UPDATE  conges_compteurs as tab1 join users on tab1.user = users.id SET tab1.compteur = 9 WHERE tab1.motif = 'PAT'
and (users.finActivite is null or period_diff(current_timestamp, users.finActivite) < 0);
-- Log du transfert
INSERT INTO history SELECT current_timestamp as date, '127.0.0.1' as ip, tab1.user as user, 'Remise à zéro des compteurs effectué' as log 
FROM conges_compteurs as tab1 JOIN users on tab1.user = users.id
WHERE tab1.user <> 999999 
and (users.finActivite is null or period_diff(current_timestamp, users.finActivite) < 0)
GROUP BY tab1.user;

END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- Select AddConges(1, 'N', 'CP',STR_TO_DATE('12/12/2013', '%d/%m/%Y'), STR_TO_DATE('19/12/2013', '%d/%m/%Y'), '');
-- CALL AddConges(1, 'N', 'CP',STR_TO_DATE('29/10/2013', '%d/%m/%Y'), STR_TO_DATE('12/11/2013', '%d/%m/%Y'), '', @duree, @retour);
-- SELECT @duree, @retour;
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS TransfertCP; 
DELIMITER $$

CREATE PROCEDURE `TransfertCP` ()
BEGIN
-- Log avant transfert
INSERT INTO history SELECT current_timestamp as date, '127.0.0.1' as ip, users.id as user, CONCAT('Valeurs avant transfert -> CP : ', tab1.cp, ' et CP_ANT : ', tab2.cp_ant) as log FROM users 
	JOIN( SELECT tab1.user as user, tab1.compteur as cp FROM conges_compteurs as tab1 WHERE tab1.motif = 'CP' and tab1.user <> 999999) as tab1 ON users.id = tab1.user 
	JOIN( SELECT tab1.user as user, tab1.compteur as cp_ant FROM conges_compteurs as tab1 WHERE tab1.motif = 'CP_ANT' and tab1.user <> 999999) as tab2 ON users.id = tab2.user
WHERE users.id <> 999999
GROUP BY users.id;

-- CP = CP + CP_ANT
-- Attention Round(CP_ANT, 1) : arrondi aux décimales
UPDATE  conges_compteurs as tab1 join users on tab1.user = users.id join conges_compteurs as tab2 on tab1.user = tab2.user and tab2.motif = 'CP_ANT' 
SET tab1.compteur = ROUND(tab1.compteur + tab2.compteur, 2) WHERE tab1.motif = 'CP' and tab1.user <> 999999
and (users.finActivite is null or period_diff(current_timestamp, users.finActivite) < 0);
-- Remise à 0 de CP_ANT
UPDATE  conges_compteurs as tab1 join users on tab1.user = users.id SET compteur = 0 WHERE motif = 'CP_ANT'
and (users.finActivite is null or period_diff(current_timestamp, users.finActivite) < 0);
-- Log du transfert
INSERT INTO history SELECT current_timestamp as date, '127.0.0.1' as ip, tab1.user as user, CONCAT('Transfert des CP anticipés vers CP effectué : Nouvelle valeur -> CP : ', tab1.compteur)  as log 
FROM conges_compteurs as tab1 JOIN users on tab1.user = users.id
WHERE tab1.motif = 'CP' and tab1.user <> 999999
and (users.finActivite is null or period_diff(current_timestamp, users.finActivite) < 0);

END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- Select AddConges(1, 'N', 'CP',STR_TO_DATE('12/12/2013', '%d/%m/%Y'), STR_TO_DATE('19/12/2013', '%d/%m/%Y'), '');
-- CALL AddConges(1, 'N', 'CP',STR_TO_DATE('29/10/2013', '%d/%m/%Y'), STR_TO_DATE('12/11/2013', '%d/%m/%Y'), '', @duree, @retour);
-- SELECT @duree, @retour;
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS CalculCongesAcquis; 
DELIMITER $$

CREATE PROCEDURE `CalculCongesAcquis` ()
BEGIN

DECLARE nbMoisMin INT;
SET nbMoisMin = 1;

-- Log avant calcul
INSERT INTO history SELECT current_timestamp as date, '127.0.0.1' as ip, users.id as user, CONCAT('Valeurs avant calcul des congès acquis -> CP_ANT : ', tab1.cp_ant, ' et RTT : ', tab2.rtt) as log FROM users 
	JOIN( SELECT tab1.user as user, tab1.compteur as cp_ant FROM conges_compteurs as tab1 WHERE tab1.motif = 'CP_ANT' and tab1.user <> 999999) as tab1 ON users.id = tab1.user 
	JOIN( SELECT tab1.user as user, tab1.compteur as rtt FROM conges_compteurs as tab1 WHERE tab1.motif = 'RTT' and tab1.user <> 999999) as tab2 ON users.id = tab2.user
WHERE users.id <> 999999 and period_diff(date_format(current_timestamp, '%Y%m'), date_format(users.debutActivite, '%Y%m')) > nbMoisMin
and (users.finActivite is null or period_diff(current_timestamp, users.finActivite) < 0)
GROUP BY users.id;

-- maj des CP (+ 2.08) pour les utilisateurs qui sont inscris depuis plus d'un mois.
UPDATE  conges_compteurs as tab1 join users on tab1.user = users.id SET tab1.compteur = tab1.compteur + 2.08 
WHERE tab1.motif = 'CP_ANT' and tab1.user <> 999999 
	and period_diff(date_format(current_timestamp, '%Y%m'), date_format(users.debutActivite, '%Y%m')) > nbMoisMin
    and (users.finActivite is null or period_diff(current_timestamp, users.finActivite) < 0);

-- maj des RTT (+ 0.75) pour les utilisateurs qui sont inscris depuis plus d'un mois.
UPDATE  conges_compteurs as tab1 join users on tab1.user = users.id SET tab1.compteur = tab1.compteur + 0.75 
WHERE tab1.motif = 'RTT' and tab1.user <> 999999 and users.hasRtt = 1
	and period_diff(date_format(current_timestamp, '%Y%m'), date_format(users.debutActivite, '%Y%m')) > nbMoisMin
	and (users.finActivite is null or period_diff(current_timestamp, users.finActivite) < 0);
	
-- Log du calcul
INSERT INTO history SELECT current_timestamp as date, '127.0.0.1' as ip, users.id as user, CONCAT('Calcul des congès acquis effectué -> CP_ANT : ', tab1.cp_ant, ' et RTT : ', tab2.rtt) as log FROM users 
	JOIN( SELECT tab1.user as user, tab1.compteur as cp_ant FROM conges_compteurs as tab1 WHERE tab1.motif = 'CP_ANT' and tab1.user <> 999999) as tab1 ON users.id = tab1.user 
	JOIN( SELECT tab1.user as user, tab1.compteur as rtt FROM conges_compteurs as tab1 WHERE tab1.motif = 'RTT' and tab1.user <> 999999) as tab2 ON users.id = tab2.user
WHERE users.id <> 999999 and period_diff(date_format(current_timestamp, '%Y%m'), date_format(users.debutActivite, '%Y%m')) > nbMoisMin
and (users.finActivite is null or period_diff(current_timestamp, users.finActivite) < 0)
GROUP BY users.id;

END $$
DELIMITER ;



-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- CALL GenererJourFerie();
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS GenererJourFerie; 
DELIMITER $$

CREATE PROCEDURE `GenererJourFerie` ()
BEGIN
DECLARE BISEXTILE BOOLEAN;
DECLARE bis, compteur, an , G , C , C_4 , E, H , K, P, Q , I, B, J1, J2, R FLOAT; 
DECLARE DimPaque , LunPaque , JeuAscension , LunPentecote , NouvelAn , FeteTravail ,Armistice3945 , Assomption , Armistice1418 , FeteNationale , ToussaINT , Noel DATE;   

SET compteur = 0;

WHILE compteur <= 7 DO
SET an = YEAR(CURDATE()) + compteur; 
SET compteur = compteur +1; 
SET G = an % 19; 
SET C = an / 100; 
SET C_4 = C / 4; 
SET E = (8 * C + 13)/25; 
SET H = (19 * G + C - C_4 - E + 15) % 30; 
SET K = H / 28; 
SET P = 29 / (H + 1); 
SET Q = (21 - G)/11; 
SET I = (((K * P * Q) - 1) * K) + H; 
SET B = (an / 4) + an; 
SET J1 = B + I + 2 + C_4 - C; 
SET J2 = J1 % 7; 
SET R = 28 + I - J2; 

-- SELECT (an%4=0) AND ((an%100!=0) OR (an%400=0)) INTO BISEXTILE;

-- IF(R > 31) THEN 

-- SET DimPaque = CAST(CONCAT(CAST(an AS CHAR) , '-04-' , cast((ROUND(R + 0.3)-31) AS CHAR)) AS DATETIME); ELSE 

-- SET DimPaque = CAST(CONCAT(CAST(an AS CHAR) , '-03-' , cast(ROUND(R -0.3) AS CHAR)) AS DATETIME); END 

-- IF;    

SET DimPaque = cast(CONCAT(cast(an AS CHAR(4)),'-03-01') AS DATE); 
SET DimPaque = ADDDATE(DimPaque,INTERVAL ROUND(R + 0.3) - 1 DAY);

-- Jours fériés mobiles   
SET LunPaque = ADDDATE(DimPaque,INTERVAL 1 DAY); 
SET JeuAscension = ADDDATE(DimPaque,INTERVAL 39 DAY); 
SET LunPentecote = ADDDATE(DimPaque,INTERVAL 50 DAY);   

-- Jours fériés fixes   
SET NouvelAn = cast(CONCAT(cast(an AS CHAR),'-01-01') AS DATE); 
SET FeteTravail = cast(CONCAT(cast(an AS CHAR),'-05-01') AS DATE); 
SET Armistice3945 = cast(CONCAT(cast(an AS CHAR),'-05-08') AS DATE); 
SET Assomption = cast(CONCAT(cast(an AS CHAR),'-08-15') AS DATE); 
SET Armistice1418 = cast(CONCAT(cast(an AS CHAR),'-11-11') AS DATE); 
SET FeteNationale = cast(CONCAT(cast(an AS CHAR),'-07-14') AS DATE); 
SET ToussaINT = cast(CONCAT(cast(an AS CHAR),'-11-01') AS DATE); 
SET Noel = cast(CONCAT(cast(an AS CHAR),'-12-25') AS DATE);   

INSERT INTO JoursFeries (jour, libelle, chome)
SELECT DimPaque, 'Dimanche de Pâques', 1 UNION 
SELECT LunPaque, 'Lundi de Pâques', 1 UNION 
SELECT JeuAscension, 'Jeudi de l''Ascension', 1 UNION 
SELECT LunPentecote, 'Lundi de Pentecôte', 0 UNION 
SELECT NouvelAn, 'Nouvel an', 1 UNION 
SELECT FeteTravail, 'Fête du travail', 1 UNION 
SELECT Armistice3945, 'Armistice 39-45', 1 UNION 
SELECT Assomption, 'Assomption', 1 UNION 
SELECT FeteNationale, 'Fête Nationale', 1 UNION 
SELECT ToussaINT, 'Toussaint', 1 UNION 
SELECT Armistice1418, 'Armistice 14-18', 1 UNION 
SELECT Noel, 'Noël', 1;  

END WHILE;

END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- select BizDaysInclusive(STR_TO_DATE('11/11/2013', '%d/%m/%Y'), STR_TO_DATE('/11/2013', '%d/%m/%Y'));
-- --------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS BizDaysInclusive;
DELIMITER $$  
 
CREATE FUNCTION `BizDaysInclusive`( d1 DATETIME, d2 DATETIME ) RETURNS FLOAT
    DETERMINISTIC
BEGIN                               
  DECLARE days, dow1, dow2, nbferie FLOAT;                                                   
  SET dow1 = DAYOFWEEK(d1);
  SET dow2 = DAYOFWEEK(d2);
  SET days = FLOOR( DATEDIFF(DATE(d2),DATE(d1))/7 ) * 5 +                                         
             CASE
               WHEN dow1=1 AND dow2=7 THEN 5 
               WHEN dow1 IN(7,1) AND dow2 IN (7,1) THEN 0
               WHEN dow1=dow2 THEN 1 
               WHEN dow1 IN(7,1) AND dow2 NOT IN (7,1) THEN dow2-1 
               WHEN dow1 NOT IN(7,1) AND dow2 IN(7,1) THEN 7-dow1
               WHEN dow1<=dow2 THEN dow2-dow1+1
               WHEN dow1>dow2 THEN 5-(dow1-dow2-1)
               ELSE 0
             END;
  SELECT COUNT(*)  INTO nbferie  FROM JoursFeries 
					WHERE chome = 1 AND DATEDIFF(jour, d1) >= 0 
					AND DATEDIFF(jour, d2) <= 0 
					AND DAYOFWEEK(jour) NOT IN(7,1);
  IF HOUR(d1) > 7 AND DAYOFWEEK(d1) NOT IN(7,1) THEN
	SET days = days - 0.5;
  END IF;
  IF HOUR(d2) < 14 AND DAYOFWEEK(d2) NOT IN(7,1) THEN
	SET days = days - 0.5;
  END IF;
  RETURN days - nbferie;
END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- select BizDaysInclusive(STR_TO_DATE('11/11/2013', '%d/%m/%Y'), STR_TO_DATE('/11/2013', '%d/%m/%Y'));
-- --------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS CheckConflis;
DELIMITER $$  
 
CREATE FUNCTION `CheckConflis`(idconges INT, user INT,  d1 DATETIME, d2 DATETIME ) RETURNS INT
    DETERMINISTIC
BEGIN                                                                                 
  DECLARE nbconflis INT;
  SET nbconflis = 0;

	SELECT COUNT(*) INTO nbconflis 
		FROM ( SELECT debut, fin, etat FROM conges WHERE (conges.user = user OR conges.user = 999999) AND conges.id <> idconges AND conges.fin > current_timestamp) AS congesTmp 
		WHERE 
-- Debut entre les dates
(congesTmp.etat <> 3
AND DATEDIFF(d1, congesTmp.debut) > 0 
AND DATEDIFF(congesTmp.fin, d1) > 0) 
		Or 
-- Fin entre les dates
(congesTmp.etat <> 3
AND DATEDIFF(d2, congesTmp.debut) > 0 
AND DATEDIFF(congesTmp.fin, d2) > 0)
		Or 
-- Debut avant et Fin après
(congesTmp.etat <> 3
AND DATEDIFF(d1, congesTmp.debut) < 0 
AND DATEDIFF(congesTmp.fin, d2) < 0)
		Or 
-- Même Debut et Fin après et 
(congesTmp.etat <> 3
AND DATEDIFF(d1, congesTmp.debut) = 0 
AND HOUR(d1) < HOUR(congesTmp.debut)
AND DATEDIFF(d2, congesTmp.debut) > 0) 
		Or
(congesTmp.etat <> 3
AND DATEDIFF(congesTmp.fin, d1) = 0
AND HOUR(d1) < HOUR(congesTmp.fin)
AND DATEDIFF(congesTmp.fin, d2) < 0 ) 
		Or 
(congesTmp.etat <> 3
AND DATEDIFF(congesTmp.fin, d1) = 0
AND DATEDIFF(congesTmp.fin, d2) = 0
AND HOUR(d1) < HOUR(congesTmp.fin) AND HOUR(d2) >= HOUR(congesTmp.fin)) 
		Or
(congesTmp.etat <> 3
AND DATEDIFF(d1, congesTmp.debut) = 0 
AND DATEDIFF(d2, congesTmp.debut) = 0
AND HOUR(d2) > HOUR(congesTmp.debut) AND HOUR(d1) <= HOUR(congesTmp.debut))
 		Or 
 (congesTmp.etat <> 3
 AND DATEDIFF(congesTmp.debut, d2) = 0
 AND HOUR(d2) > HOUR(congesTmp.debut)
 AND DATEDIFF(congesTmp.debut, d1) > 0 )
 		Or 
 (congesTmp.etat <> 3
 AND DATEDIFF(congesTmp.fin, d2) = 0
 AND HOUR(d2) < HOUR(congesTmp.fin)
 AND DATEDIFF(congesTmp.fin, d1) < 0 );


  RETURN nbconflis;
END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- Select AddConges(1, 'N', 'CP',STR_TO_DATE('12/12/2013', '%d/%m/%Y'), STR_TO_DATE('19/12/2013', '%d/%m/%Y'), '');
-- CALL AddConges(1, 'N', 'CP',STR_TO_DATE('29/10/2013', '%d/%m/%Y'), STR_TO_DATE('12/11/2013', '%d/%m/%Y'), '', @duree, @retour);
-- SELECT @duree, @retour;
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS AddConges; 
DELIMITER $$

CREATE PROCEDURE `AddConges` (user INT, typeConges VARCHAR(5), motif VARCHAR(10) CHARACTER SET utf8,  d1 DATETIME, d2 DATETIME, justification VARCHAR(1000), OUT rowid INT, OUT duree FLOAT, OUT retour VARCHAR(1000) CHARACTER SET utf8)
ThisSP:BEGIN
DECLARE nbconflis, existActivite, etat, min_motif INT;
DECLARE nbdispo FLOAT;
SET duree = -1;
SET min_motif = 0;
SET nbdispo = 1000;
SET etat = 1;

-- On vérifie la présence d'un autre congé dans les dates du congé demandé.
SELECT CheckConflis(-1, user, d1, d2) INTO nbconflis;

IF (nbconflis > 0) THEN
 SET duree = -1;
 SET retour = "CONGES_PRESENT";
 LEAVE ThisSP;
END IF;

-- On vérifie le nombre de jour de travail dans le congé.
SELECT BizDaysInclusive(d1, d2) INTO duree;
IF duree <= 0 THEN
	SET duree = -1;
	SET retour = "ZERO_JOUR_TRAVAIL";
	LEAVE ThisSP;
END IF;

SELECT count(*) INTO existActivite FROM activite WHERE activite.user = user AND 
((YEAR(activite.mois) = YEAR(d1) AND MONTH(activite.mois) = MONTH(d1)) OR (YEAR(activite.mois) = YEAR(d2) AND MONTH(activite.mois) = MONTH(d2)));
IF existActivite > 0 THEN
	SET duree = -1;
	SET retour = "ACTIVITE_SAUVER";
	LEAVE ThisSP;
END IF;

-- On vérifie le nombre de jour dispo pour l'utilisateur
SELECT min INTO min_motif FROM conges_motifs WHERE conges_motifs.id = motif;

IF (SELECT count(*) FROM conges_compteurs WHERE conges_compteurs.user = user AND conges_compteurs.motif = motif) THEN
	SELECT compteur INTO nbdispo FROM conges_compteurs WHERE conges_compteurs.user = user AND conges_compteurs.motif = motif;
END IF;
	
IF nbdispo - duree  < min_motif THEN
	SET duree = -1;
	SET retour = "PAS_ASSEZ";
	LEAVE ThisSP;
END IF;

-- Congé admin -> état validé directement
IF typeConges = 'R' THEN
	SET etat = 2;
END IF;
-- Ajout du nouveau congé.
INSERT INTO conges(user, etat, debut, fin, duree, motif, justification, type) VALUES
			(user, etat, d1,d2, duree, motif, justification, typeConges);
SET rowid = LAST_INSERT_ID();

-- IF nbdispo < 1000 THEN
	UPDATE conges_compteurs SET compteur = compteur - duree WHERE conges_compteurs.user = user AND conges_compteurs.motif = motif;
-- END IF;

END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- Select AddToAllConges('N', 'CP',STR_TO_DATE('12/12/2013', '%d/%m/%Y'), STR_TO_DATE('19/12/2013', '%d/%m/%Y'), '');
-- CALL AddToAllConges('N', 'CP',STR_TO_DATE('29/10/2013', '%d/%m/%Y'), STR_TO_DATE('12/11/2013', '%d/%m/%Y'), '', @duree, @retour);
-- SELECT @duree, @retour;
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS AddToAllConges; 
DELIMITER $$

CREATE PROCEDURE `AddToAllConges` (typeConges VARCHAR(5), motif VARCHAR(10) CHARACTER SET utf8,  d1 DATETIME, d2 DATETIME, justification VARCHAR(1000), OUT rowid INT, OUT duree FLOAT, OUT retour VARCHAR(1000) CHARACTER SET utf8)
ThisSP:BEGIN
DECLARE nbconflis, _etat INT;
SET duree = -1;
SET _etat = 1;
SET nbconflis = 0;

-- On ne vérifie pas le nombre de jour dispo pour chaque utilisateur
-- car c'est une action admin dont authorisée même si le seuil min est dépassé.

-- On vérifie le nombre de jour de travail dans le congé en 1er.
SELECT BizDaysInclusive(d1, d2) INTO duree;
IF duree <= 0 THEN
	SET duree = -1;
	SET retour = "ZERO_JOUR_TRAVAIL";
	LEAVE ThisSP;
END IF;

-- Congé admin -> état validé directement
IF typeConges = 'R' THEN
	SET _etat = 2;
END IF;

-- SELECT CheckConflis(-1, user, d1, d2) INTO nbconflis;
-- IF (nbconflis > 0) THEN
-- SET duree = -1;
-- SET retour = "CONGES_PRESENT";
-- LEAVE ThisSP;
-- END IF;

-- Ajout du nouveau congé.
IF motif = 'RTT' THEN
	-- Gestion des utilisateurs sans RTT
	INSERT INTO conges(user, etat, debut, fin, duree, motif, justification, type)
	SELECT users.id, _etat, d1, d2, duree, motif, justification, typeConges
	FROM users WHERE users.etat = 1 and users.id <> 999999 and users.id <> 0 and users.hasRtt = 1;
ELSE
	INSERT INTO conges(user, etat, debut, fin, duree, motif, justification, type)
	SELECT users.id, _etat, d1, d2, duree, motif, justification, typeConges
	FROM users WHERE users.etat = 1 and users.id <> 999999 and users.id <> 0;
END IF;

SET rowid = LAST_INSERT_ID();
IF motif = 'RTT' THEN
	-- Gestion des utilisateurs sans RTT
	UPDATE conges_compteurs join users on conges_compteurs.user = users.id SET conges_compteurs.compteur = conges_compteurs.compteur - duree WHERE users.etat = 1 and conges_compteurs.user <> 999999 AND conges_compteurs.user <> 0 AND conges_compteurs.motif = motif and users.hasRtt = 1;
ELSE
	UPDATE conges_compteurs join users on conges_compteurs.user = users.id SET conges_compteurs.compteur = conges_compteurs.compteur - duree WHERE users.etat = 1 and conges_compteurs.user <> 999999 AND conges_compteurs.user <> 0 AND conges_compteurs.motif = motif;
END IF;

END $$
DELIMITER ;


-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- Select AddConges(1, 'N', 'CP',STR_TO_DATE('12/12/2013', '%d/%m/%Y'), STR_TO_DATE('19/12/2013', '%d/%m/%Y'), '');
-- CALL AddConges(1, 'N', 'CP',STR_TO_DATE('29/10/2013', '%d/%m/%Y'), STR_TO_DATE('12/11/2013', '%d/%m/%Y'), '', @duree, @retour);
-- SELECT @duree, @retour;
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS UpdateConges; 
DELIMITER $$

CREATE PROCEDURE `UpdateConges` (idconges INT, typeConges VARCHAR(5), motif VARCHAR(10) CHARACTER SET utf8,  d1 DATETIME, d2 DATETIME, justification VARCHAR(1000), forcer BOOLEAN, OUT duree FLOAT, OUT retour VARCHAR(1000) CHARACTER SET utf8)
ThisSP:BEGIN
DECLARE iduser, etat INT;
DECLARE duree_old FLOAT;
DECLARE motif_old VARCHAR(10) CHARACTER SET utf8;
DECLARE nbconflis, existActivite INT;
DECLARE nbdispo FLOAT;
SET duree = 0;
SET nbdispo = 1000;

SELECT BizDaysInclusive(d1, d2) INTO duree;
IF duree = 0 THEN
	SET duree = -1;
	SET retour = "ZERO_JOUR_TRAVAIL";
	LEAVE ThisSP;
END IF;

SELECT conges.user, conges.duree, conges.motif, conges.etat INTO iduser, duree_old, motif_old, etat FROM conges WHERE conges.id = idconges;

IF etat <> 1 AND NOT forcer THEN
	SET duree = -1;
	SET retour = "EN_VALIDATION";
	LEAVE ThisSP;
END IF;

SELECT CheckConflis(idconges, iduser, d1, d2) INTO nbconflis;

IF (nbconflis > 0) THEN
 SET duree = -1;
 SET retour = "CONGES_PRESENT";
 LEAVE ThisSP;
END IF;

SELECT count(*) INTO existActivite FROM activite WHERE activite.user = iduser AND 
((YEAR(activite.mois) = YEAR(d1) AND MONTH(activite.mois) = MONTH(d1)) OR (YEAR(activite.mois) = YEAR(d2) AND MONTH(activite.mois) = MONTH(d2)));
IF existActivite > 0 THEN
	SET duree = -1;
	SET retour = "ACTIVITE_SAUVER";
	LEAVE ThisSP;
END IF;

IF (SELECT count(*) FROM conges_compteurs WHERE conges_compteurs.user = iduser AND conges_compteurs.motif = motif) THEN
	SELECT compteur INTO nbdispo FROM conges_compteurs WHERE conges_compteurs.user = iduser AND conges_compteurs.motif = motif;
END IF;

IF motif_old = motif THEN
	SET nbdispo = nbdispo + duree_old;
END IF;
	
IF duree > nbdispo THEN
	SET duree = -1;
	SET retour = "PAS_ASSEZ";
	LEAVE ThisSP;
END IF;

UPDATE conges SET conges.last_modif = NOW(), conges.debut = d1, conges.fin = d2, conges.duree = duree, conges.motif = motif, conges.justification = justification, conges.type = typeConges WHERE conges.id = idconges;

-- IF (SELECT count(*) FROM conges_compteurs WHERE conges_compteurs.user = iduser AND conges_compteurs.motif = motif_old) THEN
	UPDATE conges_compteurs SET compteur = compteur + duree_old WHERE conges_compteurs.user = iduser AND conges_compteurs.motif = motif_old;
-- END IF;

-- IF nbdispo < 1000 THEN
	UPDATE conges_compteurs SET compteur = compteur - duree WHERE conges_compteurs.user = iduser AND conges_compteurs.motif = motif;
-- END IF;

END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- Select AddConges(1, 'N', 'CP',STR_TO_DATE('12/12/2013', '%d/%m/%Y'), STR_TO_DATE('19/12/2013', '%d/%m/%Y'), '');
-- CALL AddConges(1, 'N', 'CP',STR_TO_DATE('29/10/2013', '%d/%m/%Y'), STR_TO_DATE('12/11/2013', '%d/%m/%Y'), '', @duree, @retour);
-- SELECT @duree, @retour;
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS RemoveConges; 
DELIMITER $$

CREATE PROCEDURE `RemoveConges` (idconges INT, OUT retour VARCHAR(1000) CHARACTER SET utf8)
ThisSP:BEGIN
DECLARE user, etat INT;
DECLARE duree FLOAT;
DECLARE motif VARCHAR(10) CHARACTER SET utf8;
SET duree = 0;

SELECT conges.user, conges.etat, conges.duree, conges.motif INTO user, etat, duree, motif FROM conges WHERE conges.id = idconges;

-- IF (SELECT count(*) FROM conges_compteurs WHERE conges_compteurs.user = user AND conges_compteurs.motif = motif) THEN
IF etat <> 3 THEN
	UPDATE conges_compteurs SET compteur = compteur + duree WHERE conges_compteurs.user = user AND conges_compteurs.motif = motif;
END IF;
-- END IF;

DELETE FROM conges WHERE id = idconges;

END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- Select AddConges(1, 'N', 'CP',STR_TO_DATE('12/12/2013', '%d/%m/%Y'), STR_TO_DATE('19/12/2013', '%d/%m/%Y'), '');
-- CALL AddConges(1, 'N', 'CP',STR_TO_DATE('29/10/2013', '%d/%m/%Y'), STR_TO_DATE('12/11/2013', '%d/%m/%Y'), '', @duree, @retour);
-- SELECT @duree, @retour;
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS UpdateEtatConges; 
DELIMITER $$

CREATE PROCEDURE `UpdateEtatConges` (idconges INT, newetat INT, refus VARCHAR(2000) CHARACTER SET utf8, OUT retour VARCHAR(1000) CHARACTER SET utf8)
ThisSP:BEGIN
DECLARE user, etat INT;
DECLARE duree FLOAT;
DECLARE motif VARCHAR(10) CHARACTER SET utf8;
SET duree = 0;

SELECT conges.user, conges.etat, conges.duree, conges.motif INTO user, etat, duree, motif FROM conges WHERE conges.id = idconges;

IF etat = 3 THEN
	SET retour = "DEJA_REFUSE";
	LEAVE ThisSP;
END IF;

IF newetat = 3 THEN
	-- IF (SELECT count(*) FROM conges_compteurs WHERE conges_compteurs.user = user AND conges_compteurs.motif = motif) THEN
		UPDATE conges_compteurs SET compteur = compteur + duree WHERE conges_compteurs.user = user AND conges_compteurs.motif = motif;
	-- END IF;
END IF;

UPDATE conges SET conges.etat = newetat, conges.refus = refus, conges.last_modif = NOW() WHERE conges.id = idconges;

END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- Select AddConges(1, 'N', 'CP',STR_TO_DATE('12/12/2013', '%d/%m/%Y'), STR_TO_DATE('19/12/2013', '%d/%m/%Y'), '');
-- CALL AddConges(1, 'N', 'CP',STR_TO_DATE('29/10/2013', '%d/%m/%Y'), STR_TO_DATE('12/11/2013', '%d/%m/%Y'), '', @duree, @retour);
-- SELECT @duree, @retour;
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS StartUser; 
DELIMITER $$

CREATE PROCEDURE `StartUser` (user INT, role INT, OUT retour VARCHAR(1000) CHARACTER SET utf8, OUT params VARCHAR(1000) CHARACTER SET utf8)
ThisSP:BEGIN
DECLARE nbvalidation INT;
DECLARE current_role, current_etat INT;
DECLARE duree FLOAT;
DECLARE finActivite DATE;
DECLARE last_connection TIMESTAMP;
DECLARE motif VARCHAR(8);
DECLARE ret VARCHAR(1000);
SET params = "";

SELECT users.role, users.etat, users.last_connection, users.finActivite INTO current_role, current_etat, last_connection, finActivite FROM users WHERE users.id = user;
If finActivite Is not null AND date(finActivite) < date(current_timestamp)THEN
	SET retour = "USER_INVALIDE";
	LEAVE ThisSP;
END IF;

UPDATE users SET last_connection = NOW() WHERE users.id = user;

IF current_etat <> 1 THEN
	SET retour = "USER_INVALIDE";
	LEAVE ThisSP;
END IF;

IF current_role <> role THEN
	SET params = CONCAT(params, "roleChanged:" , current_role, "|");
END IF;


SELECT count(*) INTO nbvalidation FROM conges WHERE conges.user = user AND conges.etat = 2 AND conges.last_modif > last_connection;
SET params = CONCAT(params, "nbMesCongesVal:" , nbvalidation, "|");

IF current_role = 3 THEN
	SELECT count(*) INTO nbvalidation FROM conges JOIN users on conges.user = users.id WHERE conges.etat = 1 AND date(conges.debut) >= date(NOW()) AND users.admin = user;

	IF nbvalidation > 0 THEN
		SET params = CONCAT(params , "nbCongesVal:" , nbvalidation , "|");
	END IF;
END IF;

IF current_role = 4 THEN
	SELECT count(*) INTO nbvalidation FROM conges WHERE conges.etat = 1 AND date(conges.debut) >= date(NOW());

	IF nbvalidation > 0 THEN
		SET params = CONCAT(params , "nbCongesVal:" , nbvalidation , "|");
	END IF;
	
	SELECT count(*) INTO nbvalidation FROM activite WHERE activite.etat = 1;

	IF nbvalidation > 0 THEN
		SET params = CONCAT(params , "nbActivitesVal:" , nbvalidation , "|");
	END IF;
END IF;

END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- Select AddConges(1, 'N', 'CP',STR_TO_DATE('12/12/2013', '%d/%m/%Y'), STR_TO_DATE('19/12/2013', '%d/%m/%Y'), '');
-- CALL AddConges(1, 'N', 'CP',STR_TO_DATE('29/10/2013', '%d/%m/%Y'), STR_TO_DATE('12/11/2013', '%d/%m/%Y'), '', @duree, @retour);
-- SELECT @duree, @retour;
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS GetJoursChomes; 
DELIMITER $$

CREATE PROCEDURE `GetJoursChomes` (user INT, startDate DATE, endDate DATE)
ThisSP:BEGIN
DECLARE exist_activite, exist_declaration INT;
-- On récupère d'abord les jours fériés non travaillés pour bug mise en forme côté JS
SELECT CAST(jour as datetime) as debut, CAST(jour as datetime) as fin, 'JF' as type, 2 as etat, '' as information FROM JoursFeries WHERE
JoursFeries.chome = 1
AND DATEDIFF(startDate, JoursFeries.jour) <= 0 
AND DATEDIFF(JoursFeries.jour, endDate) <= 0
UNION
SELECT conges.debut, conges.fin, conges.motif AS type, conges.etat as etat, conges.justification as information FROM conges WHERE (conges.user = user OR conges.user = 999999) 
AND conges.etat <> 3
AND (
-- Debut entre les dates
(DATEDIFF(startDate, conges.debut) > 0 
AND DATEDIFF(conges.fin, startDate) > 0) 
		Or 
-- Fin entre les dates
(DATEDIFF(endDate, conges.debut) > 0 
AND DATEDIFF(conges.fin, endDate) > 0)
		Or 
-- Debut avant et Fin après
(DATEDIFF(startDate, conges.debut) < 0 
AND DATEDIFF(conges.fin, endDate) < 0)
		Or 
-- Même Debut et 
(DATEDIFF(startDate, conges.debut) = 0 
AND HOUR(startDate) >= HOUR(conges.debut)) 
		Or 
(DATEDIFF(conges.fin, startDate) = 0
AND HOUR(startDate) < HOUR(conges.fin)) 
		Or
(DATEDIFF(endDate, conges.debut) = 0 
AND HOUR(endDate) > HOUR(conges.debut)) 
		Or 
(DATEDIFF(conges.fin, endDate) = 0
AND HOUR(endDate) <= HOUR(conges.fin)))

-- AND DAYOFWEEK(JoursFeries.jour) NOT IN(7,1)
ORDER BY debut;

END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- Select AddConges(1, 'N', 'CP',STR_TO_DATE('12/12/2013', '%d/%m/%Y'), STR_TO_DATE('19/12/2013', '%d/%m/%Y'), '');
-- CALL AddConges(1, 'N', 'CP',STR_TO_DATE('29/10/2013', '%d/%m/%Y'), STR_TO_DATE('12/11/2013', '%d/%m/%Y'), '', @duree, @retour);
-- SELECT @duree, @retour;
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS GetActivite; 
DELIMITER $$

CREATE PROCEDURE `GetActivite` (user INT, startDate DATE, endDate DATE, OUT etat INT, OUT mois DATE)
ThisSP:BEGIN
DECLARE exist_activite, exist_declaration, current_month INT;
SET etat = -1;
SET current_month = MONTH(startDate);
IF DAY(startDate) > 1 THEN
	SET current_month = MONTH(startDate) + 1;
END IF;
SELECT count(*) INTO exist_activite FROM activite WHERE activite.user = user AND DATEDIFF(activite.mois, startDate) >= 0 AND  DATEDIFF(activite.mois, endDate) <= 0 AND MONTH(activite.mois) = current_month;

If exist_activite > 0 THEN
	SELECT activite.mois, activite.etat INTO mois, etat FROM activite WHERE activite.user = user AND DATEDIFF(activite.mois, startDate) >= 0 AND  DATEDIFF(activite.mois, endDate) <= 0 AND MONTH(activite.mois) = current_month limit 1;

	SELECT count(*) INTO exist_declaration FROM activite_jour WHERE activite_jour.user = user AND DATEDIFF(jour, startDate) >= 0 AND  DATEDIFF(jour, endDate) <= 0 AND MONTH(activite_jour.jour) = current_month;
	IF exist_declaration > 0 THEN
		SELECT jour, type, information, heuresSup, heuresAstreinte, heuresNuit, heuresInt  FROM activite_jour WHERE activite_jour.user = user AND DATEDIFF(jour, startDate) >= 0 AND  DATEDIFF(jour, endDate) <= 0 AND MONTH(activite_jour.jour) = current_month;
	ELSE
		SET etat = 0;
		CALL GetJoursChomes(user, startDate, endDate);
	END IF;
ELSE
	CALL GetJoursChomes(user, startDate, endDate);
END IF;

END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- Select AddConges(1, 'N', 'CP',STR_TO_DATE('12/12/2013', '%d/%m/%Y'), STR_TO_DATE('19/12/2013', '%d/%m/%Y'), '');
-- CALL AddConges(1, 'N', 'CP',STR_TO_DATE('29/10/2013', '%d/%m/%Y'), STR_TO_DATE('12/11/2013', '%d/%m/%Y'), '', @duree, @retour);
-- SELECT @duree, @retour;
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS SetActiviteJour; 
DELIMITER $$

CREATE PROCEDURE `SetActiviteJour` (user INT, jour DATETIME, type varchar(10) CHARACTER SET utf8, information varchar(2000) CHARACTER SET utf8)
ThisSP:BEGIN

UPDATE activite_jour SET activite_jour.type = type, activite_jour.information = information WHERE activite_jour.user = user AND activite_jour.jour = jour;

If (SELECT ROW_COUNT() = 0) THEN
	INSERT INTO activite_jour (user, jour, type, information) VALUES (user, jour, type, information);
END IF;

END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- CALL GetListActivites(2013, 11);
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS GetListActivites; 
DELIMITER $$

CREATE PROCEDURE `GetListActivites` (annee INT, mois INT, admin INT)
ThisSP:BEGIN

IF (mois = -1) THEN
	-- Sélection des jours
	SELECT activite.mois, activite.user, activite.etat, users.nom, users.prenom, sum(tActivite.nb) as nb, tActivite.type 
	FROM activite JOIN users on activite.user = users.id

	LEFT JOIN (SELECT count(*) as nb, type, user, MONTH(activite_jour.jour) as mois FROM activite_jour JOIN users on activite_jour.user = users.id 
	WHERE HOUR(jour) = 0 AND YEAR(activite_jour.jour) = annee AND (users.admin = admin Or admin = -1) 
	group by user, type, MONTH(activite_jour.jour)

	UNION ALL (SELECT count(*) * 0.5 as nb, type, user, MONTH(activite_jour.jour) as mois FROM activite_jour JOIN users on activite_jour.user = users.id 
	WHERE HOUR(jour) > 0 AND YEAR(activite_jour.jour) = annee AND (users.admin = admin Or admin = -1)
	group by user, type, MONTH(activite_jour.jour))) 

	as tActivite on tActivite.user = activite.user and MONTH(activite.mois) = tActivite.mois

	WHERE YEAR(activite.mois) = annee AND (users.admin = admin Or admin = -1)
	group by activite.user, tActivite.type, activite.mois
	ORDER BY activite.mois;

	-- Sélection des heures
	SELECT activite.mois, tActivite.jour, activite.user, heuresSup, heuresAstreinte, heuresNuit, heuresInt 
	FROM activite JOIN users on activite.user = users.id

	RIGHT JOIN (SELECT jour,heuresSup, heuresAstreinte, heuresNuit, heuresInt, user FROM activite_jour JOIN users on activite_jour.user = users.id 
	WHERE YEAR(activite_jour.jour) = annee AND (users.admin = admin Or admin = -1) 
	AND  (heuresSup > 0 OR heuresAstreinte > 0 OR heuresNuit > 0 OR heuresInt > 0)
	group by user, jour) 

	as tActivite on tActivite.user = activite.user AND MONTH(activite.mois) = MONTH(tActivite.jour)

	WHERE YEAR(activite.mois) = annee AND (users.admin = admin Or admin = -1)
	group by activite.user, tActivite.jour
	ORDER BY activite.mois;

	LEAVE ThisSP;
END IF;

-- Sélection des jours
SELECT activite.mois, activite.user, activite.etat, users.nom, users.prenom, sum(tActivite.nb) as nb, tActivite.type 
	FROM activite JOIN users on activite.user = users.id

LEFT JOIN (SELECT count(*) as nb, type, user FROM activite_jour JOIN users on activite_jour.user = users.id 
WHERE HOUR(jour) = 0 AND YEAR(activite_jour.jour) = annee AND (users.admin = admin Or admin = -1) 
AND MONTH(activite_jour.jour) = mois group by user, type

UNION ALL (SELECT count(*) * 0.5 as nb, type, user FROM activite_jour JOIN users on activite_jour.user = users.id 
WHERE HOUR(jour) > 0 AND YEAR(activite_jour.jour) = annee AND (users.admin = admin Or admin = -1) 
AND MONTH(activite_jour.jour) = mois group by user, type)) 

as tActivite on tActivite.user = activite.user

WHERE YEAR(activite.mois) = annee AND MONTH(activite.mois) = mois AND (users.admin = admin Or admin = -1)
group by activite.user, tActivite.type
ORDER BY activite.mois;

-- Sélection des heures
SELECT activite.mois, tActivite.jour, activite.user, heuresSup, heuresAstreinte, heuresNuit, heuresInt 
FROM activite JOIN users on activite.user = users.id

RIGHT JOIN (SELECT jour,heuresSup, heuresAstreinte, heuresNuit, heuresInt, user FROM activite_jour JOIN users on activite_jour.user = users.id 
WHERE YEAR(activite_jour.jour) = annee AND (users.admin = admin Or admin = -1) 
AND  (heuresSup > 0 OR heuresAstreinte > 0 OR heuresNuit > 0 OR heuresInt > 0)
AND MONTH(activite_jour.jour) = mois group by user, jour) 

as tActivite on tActivite.user = activite.user AND MONTH(activite.mois) = MONTH(tActivite.jour)

WHERE YEAR(activite.mois) = annee AND MONTH(activite.mois) = mois AND (users.admin = admin Or admin = -1)
group by activite.user, tActivite.jour
ORDER BY activite.mois;

END $$
DELIMITER ;

-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- CALL GenererChequesResto(2013, 11);
-- --------------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS GenererChequesResto; 
DELIMITER $$

CREATE PROCEDURE `GenererChequesResto` (annee INT, mois INT)
ThisSP:BEGIN

-- Sélection des jours
SELECT sum(t.nb) as nb, t.user, t.nom, t.prenom from (
SELECT count(*) as nb, user, users.nom, users.prenom FROM activite_jour JOIN users on activite_jour.user = users.id 
WHERE user <> 999999 and user <> 111111 and HOUR(jour) = 0 AND YEAR(activite_jour.jour) = annee AND MONTH(activite_jour.jour) = mois 
and (
activite_jour.type = 'JT1' or 
activite_jour.type = 'JT2' or 
activite_jour.type = 'JT3' or 
activite_jour.type = 'FOR' or 
activite_jour.type = 'INT'
)
group by user
UNION ALL
SELECT count(*) as nb, user, users.nom, users.prenom FROM activite_jour as act1 JOIN users on act1.user = users.id 
WHERE act1.user <> 999999 and user <> 111111 and HOUR(act1.jour) = 8 AND YEAR(act1.jour) = annee AND MONTH(act1.jour) = mois 
and (
act1.type = 'JT1' or 
act1.type = 'JT2' or 
act1.type = 'JT3' or 
act1.type = 'FOR' or 
act1.type = 'INT'
)
and DATE(act1.jour) IN (
SELECT DATE(act2.jour) FROM activite_jour as act2 JOIN users on act2.user = users.id 
WHERE act2.user = act1.user and HOUR(act2.jour) = 14 AND YEAR(act2.jour) = annee AND MONTH(act2.jour) = mois 
and (
act2.type = 'JT1' or 
act2.type = 'JT2' or 
act2.type = 'JT3' or 
act2.type = 'FOR' or 
act2.type = 'INT'
)
)
group by user
) as t
group by user;

END $$
DELIMITER ;

-- Génération des jours fériés
CALL GenererJourFerie();