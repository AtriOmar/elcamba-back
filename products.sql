CREATE TABLE products (
    id int(11) NOT NULL AUTO_INCREMENT,
    category_id int(11) NOT NULL,
    name varchar(50) NOT NULL,
    picture varchar(50),
    description varchar(3000),
    price float,
    isLocal boolean,
    zeroWaste boolean,
    isNatural boolean,
    recyclable boolean,
    PRIMARY KEY (id)
);