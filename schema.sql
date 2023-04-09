-- DROP DATABASE IF EXISTS passportmern;
-- CREATE DATABASE passportmern;
-- USE passportmern;

-- --------------------------------------------------------

CREATE TABLE users (
    userId int(6) NOT NULL AUTO_INCREMENT,
    username varchar(20) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    accessId int(3) NOT NULL,
    active boolean DEFAULT 1,
    PRIMARY KEY (userId)
);

-- --------------------------------------------------------

CREATE TABLE accessLevels (
    permissionLevel int(3) NOT NULL AUTO_INCREMENT,
    type varchar(30) NOT NULL,
    PRIMARY KEY (permissionLevel)
);