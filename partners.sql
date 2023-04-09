CREATE TABLE partners (
    id int(11) NOT NULL AUTO_INCREMENT,
    name varchar(50) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    tel varchar(8), 
    picture varchar(50),
    PRIMARY KEY (id)
);