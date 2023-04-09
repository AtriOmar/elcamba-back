CREATE TABLE news (
    id int(11) NOT NULL AUTO_INCREMENT,
    title varchar(50) NOT NULL,
    picture varchar(50),
    content varchar(3000),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);